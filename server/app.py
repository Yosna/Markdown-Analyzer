"""Markdown Analyzer API Server.

This Flask application provides an API endpoint for analyzing and improving markdown
content using OpenAI's GPT-5-mini model. It supports image preview analysis and
returns both updated markdown and a summary of changes.

The server includes rate limiting, CORS configuration, and comprehensive error
handling for production deployment.
"""

import os
import json
import logging
from typing import Any

from openai import (
    OpenAI,
    APITimeoutError,
    APIConnectionError,
    RateLimitError,
    AuthenticationError,
    APIError,
)
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pydantic import BaseModel, Field, ValidationError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://127.0.0.1:5173").split(",")
CORS(app, resources={r"/api/*": {"origins": CORS_ORIGINS}})

# Rate limiting to prevent API abuse (30 requests per hour)
limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri=os.getenv("RATELIMIT_STORAGE_URI", "memory://"),
)

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class MarkdownRequest(BaseModel):
    """Request model for markdown analysis.

    Attributes:
        markdown: The markdown content to analyze.
        instructions: User instructions for analysis/improvement.
        preview: Optional base64 image of rendered markdown.
    """

    markdown: str = Field(..., min_length=1)
    instructions: str = Field(..., min_length=1)
    preview: str | None = None


class MarkdownResponse(BaseModel):
    """Response model for markdown analysis results.

    Attributes:
        markdown: The updated/improved markdown content.
        summary: A bullet-point summary of changes made to the markdown.
    """

    markdown: str
    summary: str


@app.route("/api/analyze", methods=["POST"])
@limiter.limit("30 per hour")
def analyze() -> dict[str, Any] | tuple[dict[str, Any], int]:
    """Analyze and improve markdown content using OpenAI's GPT-5-mini model.

    This endpoint accepts markdown content along with an optional image preview
    and user instructions. It uses OpenAI's responses API to analyze the content
    and return both improved markdown and a summary of changes.

    Expected JSON payload:
        - markdown: The markdown content to analyze
        - preview: Optional base64 image of rendered markdown
        - instructions: User instructions for analysis/improvement

    Returns:
        JSON response containing updated markdown and change summary
        or error message and HTTP status code if an error occurs.

    Raises:
        Various HTTP error codes based on the type of error encountered:
        - 408: Request timeout
        - 503: Connection failure
        - 429: Rate limit or quota exceeded
        - 401: Authentication failure
        - 400: Invalid request or JSON body
        - 500: Unexpected server error
    """
    try:
        request_json = request.get_json(silent=True)
        if not request_json:
            return {"error": "Invalid JSON body"}, 400
        payload = MarkdownRequest.model_validate(request_json)

        system_prompt = (
            "You are a helpful assistant that can analyze markdown with the rendered "
            "preview as an image, and you return the updated markdown along with a "
            "bullet-point list summary of the changes separated by line breaks. "
            "IMPORTANT: Always return the complete markdown content from start to "
            "finish. Do not skip any sections of the document, regardless of length. "
            "You can make improvements, edits, and changes as requested, but ensure "
            "you return the entire document."
        )
        user_prompt = (
            f"Instructions:\n{payload.instructions}\n\nMarkdown:\n{payload.markdown}"
        )

        request_size = len(
            json.dumps(
                {
                    "system_prompt": system_prompt,
                    "user_prompt": user_prompt,
                    "preview_length": len(payload.preview) if payload.preview else 0,
                }
            )
        )
        logger.debug(f"Request size: {request_size} characters")

        user_content = [{"type": "input_text", "text": user_prompt}]
        if payload.preview:
            user_content.append({"type": "input_image", "image_url": payload.preview})

        response = client.responses.parse(
            model="gpt-5-mini",
            input=[
                {"role": "developer", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            text_format=MarkdownResponse,
        )

        result = response.output_parsed
        return result.model_dump()

    except APITimeoutError as e:
        return {"error": "Request timed out", "details": str(e)}, 408
    except APIConnectionError as e:
        return {"error": "Connection failed", "details": str(e)}, 503
    except RateLimitError as e:
        return {"error": "Rate limit exceeded", "details": str(e)}, 429
    except AuthenticationError as e:
        return {"error": "Authentication failed", "details": str(e)}, 401
    except APIError as e:
        code = getattr(e, "status_code", 500)
        return {"error": "OpenAI API error", "details": str(e)}, code or 500
    except ValidationError as e:
        return {"error": "Invalid request", "details": e.errors()}, 400
    except Exception as e:
        return {"error": "An unexpected error occurred", "details": str(e)}, 500


@app.route("/api/health", methods=["GET"])
def health() -> dict[str, bool]:
    """Health check endpoint."""
    return {"ok": True}
