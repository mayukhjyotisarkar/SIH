"""
Shared pytest configuration.

The suite must not depend on a live LLM. Several tests assert on the
deterministic question flow and the curated extraction paths -- they passed for
a long time only because the configured Gemini model had been retired and every
call 404'd, so the fallback always answered. The moment a working key was added
they became nondeterministic, and the suite slowed from ~50s to ~160s because it
was making real API calls.

Outbound model calls are therefore disabled by default. A test that genuinely
wants live behaviour can opt in with @pytest.mark.live_llm.
"""
import pytest

from app.services.llm_service import LLMService
from app.services.ocr_service import OCRService


def pytest_configure(config):
    config.addinivalue_line(
        "markers", "live_llm: allow this test to make real model API calls"
    )


@pytest.fixture(autouse=True)
def no_live_llm(request, monkeypatch):
    """
    Routes every model call to the deterministic fallback, so results depend on
    our own logic rather than on a network round trip.
    """
    if "live_llm" in request.keywords:
        yield
        return

    async def _no_llm(*args, **kwargs):
        return None

    async def _no_vision(*args, **kwargs):
        # Same shape _extract_with_vision_llm returns when it cannot answer.
        return ({}, 0.0, "other", None, "local_ocr_fallback")

    monkeypatch.setattr(LLMService, "_call_llm_provider", classmethod(_no_llm))
    monkeypatch.setattr(OCRService, "_extract_with_vision_llm", classmethod(_no_vision))
    yield
