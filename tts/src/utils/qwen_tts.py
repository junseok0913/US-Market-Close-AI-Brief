"""Local Qwen3-TTS generation utility (MLX backend).

This module provides a provider-compatible interface for turn-level TTS
generation used by the LangGraph pipeline and shorts generation scripts.
"""

from __future__ import annotations

import io
import logging
import os
import threading
import time
import wave
from hashlib import sha256
from typing import Any

from langsmith.run_helpers import traceable

logger = logging.getLogger(__name__)

DEFAULT_MODEL_ID = "mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit"
DEFAULT_TIMEOUT_SECONDS = 300.0
DEFAULT_RETRIES = 1
DEFAULT_RETRY_BACKOFF_SECONDS = 1.5
TARGET_SAMPLE_RATE_HZ = 24000
TARGET_CHANNELS = 1
TARGET_SAMPLE_WIDTH_BYTES = 2  # s16le

KNOWN_QWEN_SPEAKERS = {
    "Vivian",
    "Serena",
    "Uncle_Fu",
    "Dylan",
    "Eric",
    "Ryan",
    "Aiden",
    "Ono_Anna",
    "Sohee",
}

VOICE_ALIASES = {
    "aoede": "Serena",
    "charon": "Ryan",
    "fenrir": "Aiden",
    "kore": "Sohee",
    "puck": "Eric",
    "zephyr": "Vivian",
}

LANGUAGE_ALIASES = {
    "ko": "Korean",
    "korean": "Korean",
    "en": "English",
    "english": "English",
}

_MODEL_CACHE: dict[str, Any] = {}
_MODEL_LOCK = threading.Lock()


def get_model_id() -> str:
    raw = (os.getenv("QWEN_TTS_MODEL") or DEFAULT_MODEL_ID).strip()
    if not raw:
        return DEFAULT_MODEL_ID
    return raw


def _normalize_language(language: str | None) -> str:
    raw = (language or "").strip().lower()
    if not raw:
        return "Auto"
    return LANGUAGE_ALIASES.get(raw, language or "Auto")


def _normalize_voice(voice_name: str | None, *, language: str | None) -> str:
    raw = (voice_name or "").strip()
    normalized_language = _normalize_language(language)
    if raw:
        alias = VOICE_ALIASES.get(raw.lower())
        if alias:
            return alias
        if raw in KNOWN_QWEN_SPEAKERS:
            return raw
    if normalized_language == "Korean":
        return "Sohee"
    return "Ryan"


def _split_prompt(prompt: str) -> tuple[str | None, str]:
    text = prompt.strip()
    if not text:
        raise ValueError("Prompt is empty.")

    if "\n\n" not in text:
        return None, text

    head, tail = text.split("\n\n", 1)
    instruct = head.strip()
    body = tail.strip()
    if not body:
        return None, text
    if not instruct:
        return None, body
    return instruct, body


def _load_model(model_id: str):
    with _MODEL_LOCK:
        cached = _MODEL_CACHE.get(model_id)
        if cached is not None:
            return cached

        try:
            from mlx_audio.tts.utils import load_model
        except Exception as e:  # pragma: no cover
            raise RuntimeError(
                "mlx-audio is required for local Qwen TTS. Install dependencies with `uv sync`."
            ) from e

        logger.info("Loading local Qwen TTS model: %s", model_id)
        try:
            model = load_model(model_id)
        except Exception as e:
            msg = str(e)
            if "401" in msg or "Repository Not Found" in msg or "Invalid username or password" in msg:
                raise RuntimeError(
                    "Failed to download Qwen model from Hugging Face. "
                    "Set `HF_TOKEN` (or run `huggingface-cli login`) and ensure access to the model repository."
                ) from e
            raise
        _MODEL_CACHE[model_id] = model
        return model


def _pick_sample_rate(*, result_obj: Any, model_obj: Any) -> int:
    for key in ("sample_rate", "sampling_rate", "sr"):
        v = getattr(result_obj, key, None)
        if isinstance(v, int) and v > 0:
            return v
        if isinstance(result_obj, dict):
            v = result_obj.get(key)
            if isinstance(v, int) and v > 0:
                return v

    for key in ("sample_rate", "sampling_rate", "sr"):
        v = getattr(model_obj, key, None)
        if isinstance(v, int) and v > 0:
            return v

    return TARGET_SAMPLE_RATE_HZ


def _to_mono_float32(audio: Any):
    try:
        import numpy as np
    except Exception as e:  # pragma: no cover
        raise RuntimeError("numpy is required for audio conversion.") from e

    arr = np.asarray(audio)
    if arr.size == 0:
        raise ValueError("Generated audio is empty.")

    if arr.ndim == 1:
        pass
    elif arr.ndim == 2:
        if arr.shape[0] == 1:
            arr = arr[0]
        elif arr.shape[1] == 1:
            arr = arr[:, 0]
        elif arr.shape[0] <= 8 and arr.shape[1] > arr.shape[0]:
            # Common layout: [channels, samples]
            arr = arr.mean(axis=0)
        else:
            # Common layout: [samples, channels]
            arr = arr.mean(axis=1)
    else:
        arr = arr.reshape(-1)

    if np.issubdtype(arr.dtype, np.integer):
        info = np.iinfo(arr.dtype)
        scale = float(max(abs(info.min), info.max))
        arr = arr.astype(np.float32) / max(scale, 1.0)
    else:
        arr = arr.astype(np.float32)

    arr = np.clip(arr, -1.0, 1.0)
    return arr


def _resample_if_needed(audio_f32, src_rate: int, target_rate: int):
    if src_rate == target_rate:
        return audio_f32

    try:
        import numpy as np
    except Exception as e:  # pragma: no cover
        raise RuntimeError("numpy is required for audio resampling.") from e

    if src_rate <= 0 or target_rate <= 0:
        raise ValueError(f"Invalid sample rate: src={src_rate}, target={target_rate}")

    if len(audio_f32) < 2:
        return audio_f32

    target_len = max(1, int(round(len(audio_f32) * (target_rate / src_rate))))
    src_x = np.linspace(0.0, 1.0, num=len(audio_f32), endpoint=False, dtype=np.float32)
    dst_x = np.linspace(0.0, 1.0, num=target_len, endpoint=False, dtype=np.float32)
    resampled = np.interp(dst_x, src_x, audio_f32).astype(np.float32)
    return np.clip(resampled, -1.0, 1.0)


def _float32_to_s16le_bytes(audio_f32) -> bytes:
    try:
        import numpy as np
    except Exception as e:  # pragma: no cover
        raise RuntimeError("numpy is required for PCM conversion.") from e
    pcm = (audio_f32 * 32767.0).clip(-32768.0, 32767.0).astype(np.int16)
    return pcm.tobytes()


def _pcm_to_wav_bytes(pcm: bytes, *, sample_rate_hz: int) -> bytes:
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(TARGET_CHANNELS)
        wf.setsampwidth(TARGET_SAMPLE_WIDTH_BYTES)
        wf.setframerate(sample_rate_hz)
        wf.writeframes(pcm)
    return buffer.getvalue()


def _generate_once(
    *,
    prompt: str,
    temperature: float,
    voice_name: str,
    language: str | None,
) -> bytes:
    model_id = get_model_id()
    model = _load_model(model_id)
    instruct, text = _split_prompt(prompt)

    normalized_language = _normalize_language(language)
    normalized_voice = _normalize_voice(voice_name, language=normalized_language)

    kwargs: dict[str, Any] = {
        "text": text,
        "voice": normalized_voice,
        "language": normalized_language,
    }
    if instruct:
        kwargs["instruct"] = instruct
    kwargs["temperature"] = float(temperature)

    try:
        results = list(model.generate(**kwargs))
    except TypeError:
        kwargs.pop("temperature", None)
        try:
            results = list(model.generate(**kwargs))
        except TypeError:
            kwargs.pop("instruct", None)
            results = list(model.generate(**kwargs))

    if not results:
        raise RuntimeError("Qwen TTS returned no generation output.")

    result = results[0]
    audio = getattr(result, "audio", None)
    if audio is None and isinstance(result, dict):
        audio = result.get("audio")
    if audio is None:
        raise RuntimeError("Qwen TTS output has no `audio` field.")

    src_rate = _pick_sample_rate(result_obj=result, model_obj=model)
    audio_f32 = _to_mono_float32(audio)
    audio_f32 = _resample_if_needed(audio_f32, src_rate, TARGET_SAMPLE_RATE_HZ)
    pcm = _float32_to_s16le_bytes(audio_f32)
    return _pcm_to_wav_bytes(pcm, sample_rate_hz=TARGET_SAMPLE_RATE_HZ)


def qwen_generate_tts(
    prompt: str,
    *,
    temperature: float,
    voice_name: str,
    language: str | None = None,
    timeout_s: float | None = None,
    max_retries: int = DEFAULT_RETRIES,
    retry_backoff_seconds: float = DEFAULT_RETRY_BACKOFF_SECONDS,
) -> bytes:
    timeout_raw = timeout_s if timeout_s is not None else float(
        os.getenv("QWEN_TTS_TIMEOUT_SECONDS") or DEFAULT_TIMEOUT_SECONDS
    )
    timeout_seconds = max(1.0, float(timeout_raw))
    retries = max(1, int(max_retries))
    backoff = max(0.0, float(retry_backoff_seconds))

    started_at = time.monotonic()
    last_error: Exception | None = None

    for attempt in range(1, retries + 1):
        try:
            wav_bytes = _generate_once(
                prompt=prompt,
                temperature=temperature,
                voice_name=voice_name,
                language=language,
            )
            elapsed = time.monotonic() - started_at
            if elapsed > timeout_seconds:
                raise TimeoutError(
                    f"Qwen TTS exceeded timeout after generation: elapsed={elapsed:.1f}s "
                    f"limit={timeout_seconds:.1f}s"
                )
            return wav_bytes
        except Exception as e:
            last_error = e
            if attempt >= retries:
                break
            delay = backoff * (2 ** (attempt - 1))
            logger.warning(
                "Qwen TTS retrying: attempt=%d/%d, error=%s, sleep=%.1fs",
                attempt,
                retries,
                str(e)[:160],
                delay,
            )
            if delay > 0:
                time.sleep(delay)

    if last_error is None:
        raise RuntimeError("Qwen TTS failed without an explicit error.")
    raise last_error


def _trace_inputs_tts_call(inputs: dict) -> dict:
    prompt = inputs.get("prompt")
    prompt_chars = len(prompt) if isinstance(prompt, str) else None
    prompt_hash = sha256(prompt.encode("utf-8")).hexdigest()[:16] if isinstance(prompt, str) else None
    return {
        "prompt": prompt if isinstance(prompt, str) else None,
        "chapter": inputs.get("chapter"),
        "start_id": inputs.get("start_id"),
        "end_id": inputs.get("end_id"),
        "turns": inputs.get("turns"),
        "temperature": inputs.get("temperature"),
        "voice_name": inputs.get("voice_name"),
        "language": inputs.get("language"),
        "timeout_s": inputs.get("timeout_s"),
        "model_id": get_model_id(),
        "prompt_chars": prompt_chars,
        "prompt_sha256_16": prompt_hash,
    }


def _trace_outputs_tts_call(output: Any) -> dict:
    if isinstance(output, (bytes, bytearray)):
        b = bytes(output)
        return {"audio_bytes": len(b), "is_wav": len(b) >= 12 and b[:4] == b"RIFF" and b[8:12] == b"WAVE"}
    return {"output_type": type(output).__name__}


@traceable(
    run_type="llm",
    name="qwen_tts.generate",
    tags=["tts", "qwen", "local"],
    process_inputs=_trace_inputs_tts_call,
    process_outputs=_trace_outputs_tts_call,
)
def qwen_generate_tts_traced(
    *,
    chapter: str,
    start_id: int,
    end_id: int,
    turns: int,
    prompt: str,
    temperature: float,
    voice_name: str,
    language: str | None = None,
    timeout_s: float = DEFAULT_TIMEOUT_SECONDS,
) -> bytes:
    return qwen_generate_tts(
        prompt,
        temperature=temperature,
        voice_name=voice_name,
        language=language,
        timeout_s=timeout_s,
    )
