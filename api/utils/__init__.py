"""
Utility functions and helpers for the Custom Architecture Platform.
"""

from .config import get_config, get_cosmos_client, get_blob_client
from .errors import (
    APIError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError
)
from .auth import get_user_id_from_headers
from .sanitize import sanitize_html, sanitize_css

__all__ = [
    # Config
    "get_config",
    "get_cosmos_client",
    "get_blob_client",
    # Errors
    "APIError",
    "NotFoundError",
    "ValidationError",
    "UnauthorizedError",
    "ForbiddenError",
    # Auth
    "get_user_id_from_headers",
    # Sanitize
    "sanitize_html",
    "sanitize_css",
]
