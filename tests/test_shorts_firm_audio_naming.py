from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


def load_module(module_path: Path, module_name: str):
    spec = importlib.util.spec_from_file_location(module_name, module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Failed to load module: {module_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


ROOT = Path(__file__).resolve().parents[1]
generate_audio = load_module(ROOT / "shorts-firm" / "generate_audio.py", "shorts_firm_generate_audio")
generate_slide_script = load_module(
    ROOT / "shorts-firm" / "generate_slide_script.py",
    "shorts_firm_generate_slide_script",
)
generate_tsx = load_module(ROOT / "shorts-firm" / "generate_tsx.py", "shorts_firm_generate_tsx")


class ShortsFirmAudioNamingTests(unittest.TestCase):
    def test_audio_basename_is_shortsfirm_date_mp3(self) -> None:
        self.assertEqual(generate_audio.shorts_firm_audio_basename("20260312"), "shortsfirm20260312.mp3")
        self.assertEqual(generate_audio.shorts_firm_audio_basename("20260312", ext=".wav"), "shortsfirm20260312.wav")

    def test_slide_script_fallback_audio_file_uses_shortsfirm_basename(self) -> None:
        self.assertEqual(
            generate_slide_script.default_audio_file_name("20260312"),
            "shortsfirm20260312.mp3",
        )

    def test_generate_tsx_fallback_audio_file_uses_shortsfirm_basename(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            payload_path = Path(tmp_dir) / "payload.json"
            payload_path.write_text(
                json.dumps(
                    {
                        "date": "20260312",
                        "lang": "ko",
                        "title": "t",
                        "hook": "h",
                        "durationSeconds": 10,
                        "sections": [{"name": "company_1", "text": "sample"}],
                        "script": "sample",
                        "metadata": {},
                    },
                    ensure_ascii=False,
                ),
                encoding="utf-8",
            )

            episode = generate_tsx.load_episode_payload(payload_path, date="20260312", lang="ko")
            self.assertEqual(episode["audioFile"], "shortsfirm20260312.mp3")


if __name__ == "__main__":
    unittest.main()
