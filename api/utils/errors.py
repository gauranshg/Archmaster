"""
Custom exceptions for the API.

Provides structured error handling with appropriate HTTP status codes.
"""

from typing import Optional, Dict, Any


class APIError(Exception):
    """
    Base API error with status code.

    Attributes:
        message: Human-readable error message
        status_code: HTTP status code
        details: Additional error details
    """

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)

    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary for JSON response."""
        return {
            "error": self.message,
            **self.details
        }


class NotFoundError(APIError):
    """Resource not found (404)."""

    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 404, details)


class ValidationError(APIError):
    """Input validation failed (400)."""

    def __init__(self, message: str = "Validation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 400, details)


class UnauthorizedError(APIError):
    """Authentication required (401)."""

    def __init__(self, message: str = "Unauthorized", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 401, details)


class ForbiddenError(APIError):
    """Access denied (403)."""

    def __init__(self, message: str = "Forbidden", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 403, details)


class ConflictError(APIError):
    """Resource conflict (409)."""

    def __init__(self, message: str = "Conflict", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 409, details)


class RateLimitError(APIError):
    """Rate limit exceeded (429)."""

    def __init__(self, message: str = "Rate limit exceeded", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 429, details)
