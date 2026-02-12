"""
Correlation ID utilities for request tracking across Azure Functions.

Provides simple correlation ID extraction and generation for distributed tracing.
Uses standard Azure Functions header 'x-correlation-id'.
"""

import logging
import uuid
from typing import Optional

# Standard header name for correlation IDs
CORRELATION_HEADER = "x-correlation-id"


def get_or_create_correlation_id(headers: dict) -> str:
    """
    Extract correlation ID from request headers or generate a new one.

    Args:
        headers: Request headers dictionary

    Returns:
        Correlation ID string (UUID v4 format)

    Example:
        >>> headers = {"x-correlation-id": "existing-id-123"}
        >>> get_or_create_correlation_id(headers)
        'existing-id-123'

        >>> headers = {}
        >>> cid = get_or_create_correlation_id(headers)
        >>> len(cid)  # Generated UUID
        36
    """
    # Try to get from headers first
    correlation_id = headers.get(CORRELATION_HEADER) or headers.get(CORRELATION_HEADER.upper())

    if not correlation_id:
        # Generate new correlation ID
        correlation_id = str(uuid.uuid4())

    return correlation_id


def bind_correlation_logger(logger: logging.Logger, correlation_id: str) -> logging.Logger:
    """
    Add correlation ID to logger using LoggerAdapter.

    This makes correlation_id available in all log messages from this logger.

    Args:
        logger: Base logger instance
        correlation_id: Correlation ID to bind

    Returns:
        LoggerAdapter with correlation_id in extra dict

    Example:
        >>> logger = logging.getLogger(__name__)
        >>> correlated_logger = bind_correlation_logger(logger, "cid-123")
        >>> correlated_logger.info("Processing request")
        # Logs with correlation_id automatically attached
    """
    class CorrelationAdapter(logging.LoggerAdapter):
        def process(self, msg, kwargs):
            # Add correlation_id to extra context
            extra = kwargs.get("extra", {})
            extra["correlation_id"] = self.extra["correlation_id"]
            kwargs["extra"] = extra
            return msg, kwargs

    return CorrelationAdapter(logger, {"correlation_id": correlation_id})


def log_with_correlation(
    logger: logging.Logger,
    level: int,
    message: str,
    correlation_id: str,
    **extra_context
):
    """
    Log a message with correlation ID and additional context.

    Args:
        logger: Logger instance
        level: Logging level (logging.INFO, logging.ERROR, etc.)
        message: Log message
        correlation_id: Correlation ID
        **extra_context: Additional key-value pairs to log

    Example:
        >>> log_with_correlation(
        ...     logger, logging.INFO, "Processing expense",
        ...     correlation_id="cid-123",
        ...     endpoint="create_expense",
        ...     employee_email="user@example.com"
        ... )
    """
    logger.log(
        level,
        message,
        extra={
            "correlation_id": correlation_id,
            **extra_context
        }
    )


class RequestContext:
    """
    Simple context manager for request-scoped correlation ID.

    Automatically extracts/binds correlation ID and provides logging helper.

    Example:
        >>> req = func.HttpRequest(...)
        >>> with RequestContext(req, logging.getLogger(__name__)) as ctx:
        ...     ctx.logger.info("Processing request")
        ...     # Business logic here
        ...     # Logs automatically include correlation_id
    """

    def __init__(self, req, logger: logging.Logger):
        """Initialize request context with correlation ID."""
        self._raw_logger = logger
        self._correlation_id = get_or_create_correlation_id(req.headers)
        self.logger = bind_correlation_logger(logger, self._correlation_id)
        self.request = req

    @property
    def correlation_id(self) -> str:
        """Get the correlation ID for this request."""
        return self._correlation_id

    def log_input(self, data: dict, **extra):
        """Log request input data (excluding sensitive fields)."""
        safe_data = self._sanitize_data(data)
        self.logger.info(
            "Request input",
            extra={"input_data": safe_data, **extra}
        )

    def log_output(self, data: dict, **extra):
        """Log response output data."""
        self.logger.info(
            "Request output",
            extra={"output_data": data, **extra}
        )

    def log_error(self, error: Exception, **extra):
        """Log error with full context."""
        self.logger.error(
            f"Request error: {error}",
            exc_info=True,
            extra={
                "error_type": type(error).__name__,
                "error_message": str(error),
                **extra
            }
        )

    def _sanitize_data(self, data: dict) -> dict:
        """Remove sensitive fields from data before logging."""
        if not isinstance(data, dict):
            return data

        sensitive_keys = {
            "password", "secret", "token", "apikey", "api_key",
            "client_secret", "connection_string", "credit_card"
        }

        safe = {}
        for key, value in data.items():
            if any(sensitive in key.lower() for sensitive in sensitive_keys):
                safe[key] = "***REDACTED***"
            elif isinstance(value, dict):
                safe[key] = self._sanitize_data(value)
            else:
                safe[key] = value

        return safe

    def __enter__(self):
        """Enter context manager."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Exit context manager, log any unhandled exception."""
        if exc_type is not None:
            self.log_error(exc_val)
        return False
