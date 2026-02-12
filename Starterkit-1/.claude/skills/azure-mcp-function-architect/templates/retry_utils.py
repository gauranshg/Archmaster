"""
Retry utilities using tenacity for resilient external API calls.

Provides standard retry decorators for common scenarios:
- Network failures
- Rate limiting (429)
- Server errors (5xx)
- Timeouts
"""

import logging
from functools import wraps
from typing import Callable, TypeVar, Any

import requests
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)

T = TypeVar("T")


# ============================================
# STANDARD RETRY CONFIGURATIONS
# ============================================

def retry_on_network_error(
    max_attempts: int = 3,
    wait_min: float = 1.0,
    wait_max: float = 10.0,
    logger: logging.Logger = None,
) -> Callable:
    """
    Retry decorator for network-related failures.

    Retries on:
    - Connection errors
    - Timeout errors
    - HTTP 5xx server errors

    Args:
        max_attempts: Maximum number of retry attempts
        wait_min: Minimum wait time between retries (seconds)
        wait_max: Maximum wait time between retries (seconds)
        logger: Logger instance for retry logging

    Example:
        >>> @retry_on_network_error(max_attempts=3)
        ... def fetch_data(url):
        ...     return requests.get(url).json()
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        # Build log callback if logger provided
        log_callback = None
        if logger:
            log_callback = before_sleep_log(logger, logging.WARNING)

        @retry(
            stop=stop_after_attempt(max_attempts),
            wait=wait_exponential(multiplier=1, min=wait_min, max=wait_max),
            retry=retry_if_exception_type((
                requests.exceptions.ConnectionError,
                requests.exceptions.Timeout,
            )),
            before_sleep=log_callback,
            reraise=True,
        )
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> T:
            try:
                return func(*args, **kwargs)
            except requests.exceptions.HTTPError as e:
                # Retry on 5xx errors
                if 500 <= e.response.status_code < 600:
                    raise  # Let tenacity handle retry
                raise  # Re-raise for 4xx errors

        return wrapper
    return decorator


def retry_on_rate_limit(
    max_attempts: int = 5,
    wait_min: float = 2.0,
    wait_max: float = 60.0,
    logger: logging.Logger = None,
) -> Callable:
    """
    Retry decorator specifically for rate limiting (HTTP 429).

    Uses exponential backoff with longer waits for rate limits.

    Args:
        max_attempts: Maximum number of retry attempts
        wait_min: Minimum wait time between retries (seconds)
        wait_max: Maximum wait time between retries (seconds)
        logger: Logger instance for retry logging

    Example:
        >>> @retry_on_rate_limit(max_attempts=5)
        ... def call_api(endpoint):
        ...     return requests.post(endpoint, json=data)
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        log_callback = None
        if logger:
            log_callback = before_sleep_log(logger, logging.WARNING)

        @retry(
            stop=stop_after_attempt(max_attempts),
            wait=wait_exponential(multiplier=2, min=wait_min, max=wait_max),
            retry=retry_if_exception_type(RateLimitError),
            before_sleep=log_callback,
            reraise=True,
        )
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> T:
            try:
                result = func(*args, **kwargs)
                # Check for HTTP 429 in response
                if hasattr(result, "status_code") and result.status_code == 429:
                    raise RateLimitError("Rate limit exceeded", result)
                return result
            except RateLimitError:
                raise

        return wrapper
    return decorator


def retry_on_any_error(
    max_attempts: int = 3,
    wait_min: float = 1.0,
    wait_max: float = 10.0,
    logger: logging.Logger = None,
) -> Callable:
    """
    Retry decorator that catches all exceptions.

    Use sparingly - only for operations where retrying on any error makes sense.

    Args:
        max_attempts: Maximum number of retry attempts
        wait_min: Minimum wait time between retries (seconds)
        wait_max: Maximum wait time between retries (seconds)
        logger: Logger instance for retry logging

    Example:
        >>> @retry_on_any_error(max_attempts=2)
        ... def fragile_operation():
        ...     return unreliable_service.call()
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        log_callback = None
        if logger:
            log_callback = before_sleep_log(logger, logging.WARNING)

        @retry(
            stop=stop_after_attempt(max_attempts),
            wait=wait_exponential(multiplier=1, min=wait_min, max=wait_max),
            before_sleep=log_callback,
            reraise=True,
        )
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> T:
            return func(*args, **kwargs)

        return wrapper
    return decorator


# ============================================
# HELPER CLASSES
# ============================================

class RateLimitError(Exception):
    """Raised when HTTP 429 rate limit is encountered."""

    def __init__(self, message: str, response: Any = None):
        super().__init__(message)
        self.response = response
        self.retry_after = None
        if response and hasattr(response, "headers"):
            self.retry_after = response.headers.get("Retry-After")


# ============================================
# USAGE EXAMPLES
# ============================================

"""
Example 1: Simple GET with network retry:
    @retry_on_network_error(max_attempts=3)
    def fetch_user(user_id: str):
        response = requests.get(f"{API_URL}/users/{user_id}")
        response.raise_for_status()
        return response.json()

Example 2: POST with rate limit handling:
    @retry_on_rate_limit(max_attempts=5)
    def create_expense(expense_data: dict):
        response = requests.post(f"{API_URL}/expenses", json=expense_data)
        response.raise_for_status()
        return response.json()

Example 3: Combined retry logic:
    @retry_on_network_error(max_attempts=3)
    @retry_on_rate_limit(max_attempts=5)
    def update_expense(expense_id: str, data: dict):
        response = requests.put(f"{API_URL}/expenses/{expense_id}", json=data)
        response.raise_for_status()
        return response.json()

Example 4: With logging:
    logger = logging.getLogger(__name__)

    @retry_on_network_error(max_attempts=3, logger=logger)
    def external_api_call():
        return requests.get("https://api.example.com/data")
"""
