"""Unit tests for the Markdown Analyzer backend.

This module contains unit tests for the Flask application endpoints,
focusing on the analyze endpoint functionality, error handling, and
response validation.
"""

import json
import pytest
from unittest.mock import Mock, patch
from openai import (
    APITimeoutError,
    APIConnectionError,
    RateLimitError,
    AuthenticationError,
    APIError,
)
from pydantic import ValidationError
from app import app, MarkdownRequest, MarkdownResponse


class MockErrorResponse:
    def __init__(self, status_code):
        self.status_code = status_code
        self.request = None
        self.headers = {}


@pytest.fixture
def user_request():
    """Build a request for testing purposes.

    Returns:
        Test data for the markdown analysis request.
    """
    yield MarkdownRequest(
        markdown="# Test Header\nThis is test content.",
        instructions="Improve the formatting",
        preview="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    )


def post_request(payload):
    """Post a request to the analyze endpoint.

    Args:
        payload: The payload to post to the analyze endpoint.

    Returns:
        The response from the analyze endpoint.
    """
    app.config["TESTING"] = True
    app.config["DEBUG"] = True
    app.config["PROPAGATE_EXCEPTIONS"] = True

    with app.test_client() as client:
        response = client.post("/api/analyze", json=payload)
        response.output = json.loads(response.data)
        return response


def test_api_analyze_success(user_request):
    """Test successful markdown analysis request.

    Verifies that the endpoint returns a valid response with
    markdown and summary fields when given proper input.
    """
    payload = user_request.model_dump()

    mock_response = Mock()
    mock_response.output_parsed = MarkdownResponse(
        markdown="# Improved Test Header\n\nThis is improved test content.",
        summary="- Enhanced header formatting\n- Added proper spacing",
    )

    with patch("app.client.responses.parse", return_value=mock_response):
        response = post_request(payload)

        assert response.status_code == 200
        assert "markdown" in response.output
        assert "summary" in response.output


def test_api_analyze_missing_field(user_request):
    """Test analyze endpoint with missing markdown field.

    Verifies proper error handling when required fields are missing.
    """
    delattr(user_request, "markdown")
    payload = user_request.model_dump()
    response = post_request(payload)

    assert response.status_code == 400


def test_api_analyze_invalid_json():
    """Test analyze endpoint with invalid JSON body.

    Verifies proper error handling when the JSON body is invalid.
    """
    response = post_request(None)

    assert response.status_code == 400


def test_markdown_response_valid():
    """Test creating a valid MarkdownResponse instance."""
    response = MarkdownResponse(markdown="# Test Content", summary="- Test change")

    assert response.markdown == "# Test Content"
    assert response.summary == "- Test change"


def test_markdown_response_missing_fields():
    """Test MarkdownResponse missing field validation."""
    with pytest.raises(ValidationError):
        MarkdownResponse(markdown="test")

    with pytest.raises(ValidationError):
        MarkdownResponse(summary="test")


@pytest.mark.parametrize(
    "error, error_message, status_code",
    [
        (APITimeoutError(request=None), "Request timed out", 408),
        (APIConnectionError(request=None), "Connection failed", 503),
        (
            RateLimitError(
                "Rate limit exceeded", response=MockErrorResponse(429), body=None
            ),
            "Rate limit exceeded",
            429,
        ),
        (
            AuthenticationError(
                "Invalid API key", response=MockErrorResponse(401), body=None
            ),
            "Authentication failed",
            401,
        ),
        (APIError("Bad Request", None, body=None), "OpenAI API error", 500),
        (Exception("unexpected error"), "An unexpected error occurred", 500),
    ],
)
def test_api_analyze_errors(user_request, error, error_message, status_code):
    """Test OpenAI API errors."""
    payload = user_request.model_dump()

    with patch("app.client.responses.parse", side_effect=error):
        response = post_request(payload)

        assert error_message in response.output["error"]
        assert status_code == response.status_code


def test_health_endpoint():
    """Test health check endpoint."""
    app.config["TESTING"] = True

    with app.test_client() as client:
        response = client.get("/api/health")

        assert response.status_code == 200
        assert response.json == {"ok": True}
