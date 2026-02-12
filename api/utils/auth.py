"""
Authentication and authorization utilities.

Extracts user information from Azure AD tokens.
"""

import logging
from typing import Optional
from azure.functions import HttpRequest


logger = logging.getLogger(__name__)


def get_user_id_from_headers(request: HttpRequest) -> Optional[str]:
    """
    Extract user ID from request headers (Azure AD authentication).

    In Azure Static Web Apps with Azure AD, the following headers are available:
    - x-ms-client-principal-id: User's Azure AD object ID
    - x-ms-client-principal-name: User's email/username

    Args:
        request: Azure Function HTTP request object

    Returns:
        User ID (Azure AD object ID) or None if not authenticated
    """
    # Try Azure Static Web Apps headers
    user_id = request.headers.get("x-ms-client-principal-id")
    if user_id:
        logger.info(f"Extracted user ID from Azure Static Web Apps header: {user_id}")
        return user_id

    # Try Authorization header (Bearer token)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        # In production, you'd validate the JWT token here
        # For now, we'll log a warning and return None
        logger.warning("Bearer token found but JWT validation not implemented")
        return None

    logger.warning("No authentication headers found")
    return None


def get_user_email_from_headers(request: HttpRequest) -> Optional[str]:
    """
    Extract user email from request headers.

    Args:
        request: Azure Function HTTP request object

    Returns:
        User email or None if not available
    """
    # Try Azure Static Web Apps header
    email = request.headers.get("x-ms-client-principal-name")
    if email:
        return email

    return None


def get_user_display_name(request: HttpRequest) -> Optional[str]:
    """
    Extract user display name from request headers.

    Args:
        request: Azure Function HTTP request object

    Returns:
        User display name or None if not available
    """
    # This may be passed in a custom header or require token parsing
    # For now, return the email as a fallback
    return get_user_email_from_headers(request)


def check_auth(request: HttpRequest) -> tuple[Optional[str], Optional[str]]:
    """
    Check authentication and return user ID and email.

    Args:
        request: Azure Function HTTP request object

    Returns:
        Tuple of (user_id, email) or (None, None) if not authenticated
    """
    user_id = get_user_id_from_headers(request)
    email = get_user_email_from_headers(request)
    return user_id, email
