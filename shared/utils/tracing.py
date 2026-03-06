"""LangSmith tracing configuration utilities."""

from __future__ import annotations

import logging
import os

_CONFIGURED = False


def _mask(secret: str | None) -> str:
    if not secret:
        return ""
    if len(secret) <= 6:
        return "***"
    return f"{secret[:3]}***{secret[-3:]}"


def configure_tracing(logger: logging.Logger | None = None) -> None:
    """Configure tracing using LANGSMITH_* env vars only."""
    global _CONFIGURED
    if _CONFIGURED:
        return

    log = logger or logging.getLogger(__name__)

    api_key = os.getenv("LANGSMITH_API_KEY")
    project = os.getenv("LANGSMITH_PROJECT")
    tracing_flag = os.getenv("LANGSMITH_TRACING_V2")
    endpoint = os.getenv("LANGSMITH_ENDPOINT")

    if tracing_flag is not None:
        normalized = str(tracing_flag).lower()
        if normalized != tracing_flag:
            os.environ["LANGSMITH_TRACING_V2"] = normalized
            tracing_flag = normalized

    if not api_key and str(tracing_flag).lower() == "true":
        # Avoid CI/local auth noise when tracing is enabled by config but no key is present.
        os.environ["LANGSMITH_TRACING_V2"] = "false"
        os.environ["LANGCHAIN_TRACING_V2"] = "false"
        tracing_flag = "false"

    log.info(
        "LangSmith tracing 설정 확인: tracing_v2=%s, project=%s, endpoint=%s, api_key(masked)=%s",
        tracing_flag,
        project or "(unset)",
        endpoint or "(default)",
        _mask(api_key) or "(missing)",
    )

    if not api_key:
        log.info("LangSmith tracing disabled: LANGSMITH_API_KEY is not set.")
    elif str(tracing_flag).lower() != "true":
        log.info("LangSmith tracing disabled via LANGSMITH_TRACING_V2.")

    _CONFIGURED = True
