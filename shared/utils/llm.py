"""Shared LLM builder."""

from __future__ import annotations

import logging
import os
from typing import Optional, Union

from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI

from .tracing import configure_tracing


def _getenv_nonempty(name: str, default: str) -> str:
    value = os.getenv(name)
    if value is None:
        return default
    value = value.strip()
    return value if value else default


def build_llm(prefix: str, *, logger: Optional[logging.Logger] = None) -> Union[ChatOpenAI, ChatGoogleGenerativeAI]:
    """Build LLM (OpenAI or Gemini) with prefix-specific overrides.

    If GEMINI_API_KEY is set, uses Gemini. Otherwise uses OpenAI.

    Example prefixes:
    - OPENING
    - THEME_WORKER
    - THEME_REFINER
    - CLOSING
    """
    configure_tracing(logger=logger)
    
    # Check which API to use
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")
    
    prefix_key = f"{prefix.strip('_')}_" if prefix else ""

    def cfg(key: str, default_env_key: str, default: str) -> str:
        return _getenv_nonempty(f"{prefix_key}{key}", _getenv_nonempty(default_env_key, default))

    if gemini_api_key:
        # Use Gemini
        model_name = cfg("GEMINI_MODEL", "GEMINI_MODEL", "gemini-2.5-pro")
        temperature = float(cfg("GEMINI_TEMPERATURE", "GEMINI_TEMPERATURE", "0.0"))
        timeout = float(cfg("GEMINI_TIMEOUT", "GEMINI_TIMEOUT", "120"))
        max_retries = int(cfg("GEMINI_MAX_RETRIES", "GEMINI_MAX_RETRIES", "2"))

        llm_kwargs: dict[str, object] = {
            "model": model_name,
            "temperature": temperature,
            "timeout": timeout,
            "max_retries": max_retries,
            "google_api_key": gemini_api_key,
        }

        return ChatGoogleGenerativeAI(**llm_kwargs)
    
    elif openai_api_key:
        # Use OpenAI
        model_name = cfg("OPENAI_MODEL", "OPENAI_MODEL", "gpt-5.1")
        reasoning_effort_raw = cfg("OPENAI_REASONING_EFFORT", "OPENAI_REASONING_EFFORT", "")
        temperature = float(cfg("OPENAI_TEMPERATURE", "OPENAI_TEMPERATURE", "0.0"))
        timeout = float(cfg("OPENAI_TIMEOUT", "OPENAI_TIMEOUT", "120"))
        max_retries = int(cfg("OPENAI_MAX_RETRIES", "OPENAI_MAX_RETRIES", "2"))

        reasoning_effort_norm = (reasoning_effort_raw or "").strip().lower()
        llm_kwargs: dict[str, object] = {
            "model": model_name,
            "temperature": temperature,
            "timeout": timeout,
            "max_retries": max_retries,
        }
        if reasoning_effort_norm and reasoning_effort_norm not in {"none", "null", "off", "false"}:
            llm_kwargs["reasoning_effort"] = reasoning_effort_raw
        
        return ChatOpenAI(**llm_kwargs)
    
    else:
        raise EnvironmentError(
            "GEMINI_API_KEY 또는 OPENAI_API_KEY 중 하나가 설정되어야 합니다. "
            ".env 파일을 확인하세요."
        )
