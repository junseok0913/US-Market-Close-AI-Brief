"""Gemini single-speaker TTS 호출 유틸.

Gemini `generateContent` API를 사용해 turn 단위 오디오(bytes)를 생성한다.
"""

from __future__ import annotations

import base64
import json
import logging
import os
import socket
import urllib.error
import urllib.request
from hashlib import sha256
from typing import Any, Dict

from langsmith.run_helpers import traceable

logger = logging.getLogger(__name__)

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
DEFAULT_MODEL_PATH = "models/gemini-2.5-pro-preview-tts"
TRANSIENT_HTTP_CODES = {429, 500, 502, 503, 504}
KNOWN_FALLBACK_MODELS = (
    "models/gemini-2.5-pro-preview-tts",
    "models/gemini-2.5-flash-preview-tts",
)


def get_model_path() -> str:
    """TTS 모델 경로를 반환한다.

    - `.env` 또는 환경변수 `GEMINI_TTS_MODEL`로 오버라이드 가능
    - `models/` prefix가 없으면 자동으로 붙인다.
    """
    raw = (os.getenv("GEMINI_TTS_MODEL") or DEFAULT_MODEL_PATH).strip()
    if not raw:
        return DEFAULT_MODEL_PATH
    if not raw.startswith("models/"):
        raw = f"models/{raw}"
    return raw


def get_fallback_model_paths(primary_model: str) -> list[str]:
    """Fallback 모델 후보를 반환한다."""
    fallback_models: list[str] = []
    env_fallback = (os.getenv("GEMINI_TTS_FALLBACK_MODEL") or "").strip()
    if env_fallback:
        if not env_fallback.startswith("models/"):
            env_fallback = f"models/{env_fallback}"
        if env_fallback != primary_model:
            fallback_models.append(env_fallback)

    for model in KNOWN_FALLBACK_MODELS:
        if model != primary_model and model not in fallback_models:
            fallback_models.append(model)
    return fallback_models


def _read_http_error_body(e: urllib.error.HTTPError) -> str:
    try:
        return e.read().decode("utf-8", errors="replace")
    except Exception:
        return ""


def _is_wav(data: bytes) -> bool:
    return len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WAVE"


def extract_inline_audio_b64(resp: Dict[str, Any]) -> str:
    candidates = resp.get("candidates")
    if not isinstance(candidates, list) or not candidates:
        raise ValueError("Gemini 응답에 candidates가 없습니다.")
    content = candidates[0].get("content") or {}
    parts = content.get("parts")
    if not isinstance(parts, list) or not parts:
        raise ValueError("Gemini 응답에 content.parts가 없습니다.")

    part0 = parts[0]
    inline_data = part0.get("inlineData") or part0.get("inline_data")
    if not isinstance(inline_data, dict):
        raise ValueError("Gemini 응답에 inlineData/inline_data가 없습니다.")
    data_b64 = inline_data.get("data")
    if not isinstance(data_b64, str) or not data_b64:
        raise ValueError("Gemini 응답 inlineData.data가 비어있습니다.")
    return data_b64


def gemini_generate_tts(
    prompt: str,
    *,
    api_key: str,
    temperature: float,
    voice_name: str,
    timeout_s: float = 120.0,
) -> bytes:
    model_path = get_model_path()
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "temperature": temperature,
            "speechConfig": {
                "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice_name}}
            },
        },
    }
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request_headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key,
    }

    model_candidates = [model_path, *get_fallback_model_paths(model_path)]
    raw: bytes | None = None
    last_error: Exception | None = None

    for i, candidate_model in enumerate(model_candidates):
        url = f"{GEMINI_BASE_URL}/{candidate_model}:generateContent"
        req = urllib.request.Request(
            url,
            data=body,
            headers=request_headers,
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=timeout_s) as f:
                raw = f.read()
            if i > 0:
                logger.info("Gemini TTS succeeded with fallback model: %s", candidate_model)
            break
        except urllib.error.HTTPError as e:
            last_error = e
            err_body = _read_http_error_body(e)
            logger.error("Gemini TTS HTTPError on %s: %s %s", candidate_model, e.code, e.reason)
            if err_body:
                logger.error("Gemini error body: %s", err_body[:2000])

            has_fallback = i < len(model_candidates) - 1
            if has_fallback and e.code in TRANSIENT_HTTP_CODES:
                next_model = model_candidates[i + 1]
                logger.warning(
                    "Transient Gemini error (%s). Falling back to %s...",
                    e.code,
                    next_model,
                )
                continue
            raise
        except (urllib.error.URLError, TimeoutError, socket.timeout) as e:
            last_error = e
            logger.warning("Gemini TTS request failed on %s: %s", candidate_model, e)
            has_fallback = i < len(model_candidates) - 1
            if has_fallback:
                next_model = model_candidates[i + 1]
                logger.warning("Retrying with fallback model: %s...", next_model)
                continue
            raise

    if raw is None:
        raise RuntimeError("Gemini TTS failed and produced no response body") from last_error

    resp = json.loads(raw.decode("utf-8"))
    audio_b64 = extract_inline_audio_b64(resp)
    audio_bytes = base64.b64decode(audio_b64)
    return audio_bytes


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
        "timeout_s": inputs.get("timeout_s"),
        "prompt_chars": prompt_chars,
        "prompt_sha256_16": prompt_hash,
        "api_key": "(redacted)" if inputs.get("api_key") else "(missing)",
    }


def _trace_outputs_tts_call(output: Any) -> dict:
    if isinstance(output, (bytes, bytearray)):
        b = bytes(output)
        return {"audio_bytes": len(b), "is_wav": _is_wav(b)}
    return {"output_type": type(output).__name__}


@traceable(
    run_type="llm",
    name="gemini_tts.generate",
    tags=["tts", "gemini"],
    process_inputs=_trace_inputs_tts_call,
    process_outputs=_trace_outputs_tts_call,
)
def gemini_generate_tts_traced(
    *,
    chapter: str,
    start_id: int,
    end_id: int,
    turns: int,
    prompt: str,
    api_key: str,
    temperature: float,
    voice_name: str,
    timeout_s: float = 120.0,
) -> bytes:
    return gemini_generate_tts(
        prompt,
        api_key=api_key,
        temperature=temperature,
        voice_name=voice_name,
        timeout_s=timeout_s,
    )
