"""
Input sanitization utilities.

Prevents XSS attacks and CSS injection by sanitizing user input.
"""

import logging
import re
from typing import List


logger = logging.getLogger(__name__)


# Dangerous HTML tags and attributes that should be removed
DANGEROUS_HTML_TAGS = [
    "script",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
    "button",
    "textarea",
    "select",
    "option",
]

DANGEROUS_HTML_ATTRIBUTES = [
    "onload",
    "onerror",
    "onclick",
    "onmouseover",
    "onmouseout",
    "onfocus",
    "onblur",
    "onkeydown",
    "onkeyup",
    "onkeypress",
    "javascript:",
    "data:text/html",
]

# Dangerous CSS properties and values
DANGEROUS_CSS_PATTERNS = [
    r"javascript:",
    r"expression\(",
    r"behavior:",
    r"binding:",
    r"@import",
    r"<script",
    r"</script",
]


def sanitize_html(html: str) -> str:
    """
    Sanitize HTML content to prevent XSS attacks.

    This is a basic implementation. For production, use a library like:
    - bleach (https://pypi.org/project/bleach/)
    - nh3 (https://pypi.org/project/nh3/)

    Args:
        html: Raw HTML string

    Returns:
        Sanitized HTML string
    """
    if not html:
        return ""

    # Remove dangerous tags
    for tag in DANGEROUS_HTML_TAGS:
        # Remove opening tags
        html = re.sub(f"<{tag}[^>]*>", "", html, flags=re.IGNORECASE)
        # Remove closing tags
        html = re.sub(f"</{tag}>", "", html, flags=re.IGNORECASE)

    # Remove dangerous attributes
    for attr in DANGEROUS_HTML_ATTRIBUTES:
        html = re.sub(f'{attr}[^"]*"[^"]*"', "", html, flags=re.IGNORECASE)
        html = re.sub(f"{attr}[^']*'[^']*'", "", html, flags=re.IGNORECASE)

    # Remove javascript: and data: protocols
    html = re.sub(r'javascript:', "", html, flags=re.IGNORECASE)
    html = re.sub(r'data:text/html', "", html, flags=re.IGNORECASE)

    return html


def sanitize_css(css: str) -> str:
    """
    Sanitize CSS content to prevent injection attacks.

    Args:
        css: Raw CSS string

    Returns:
        Sanitized CSS string

    Raises:
        ValueError if dangerous patterns are detected
    """
    if not css:
        return ""

    css_lower = css.lower()

    # Check for dangerous patterns
    for pattern in DANGEROUS_CSS_PATTERNS:
        if re.search(pattern, css_lower):
            logger.warning(f"Dangerous CSS pattern detected: {pattern}")
            raise ValueError(f"Dangerous CSS pattern detected: {pattern}")

    return css


def validate_node_id(node_id: str) -> bool:
    """
    Validate node ID format.

    Args:
        node_id: Node ID to validate

    Returns:
        True if valid, False otherwise
    """
    if not node_id:
        return False

    # Node IDs should be alphanumeric with hyphens and underscores only
    return bool(re.match(r'^[a-zA-Z0-9-_]+$', node_id))


def validate_edge_references(
    edge_source: str,
    edge_target: str,
    valid_node_ids: List[str]
) -> bool:
    """
    Validate that edge references point to valid nodes.

    Args:
        edge_source: Source node ID
        edge_target: Target node ID
        valid_node_ids: List of valid node IDs

    Returns:
        True if references are valid, False otherwise
    """
    if edge_source not in valid_node_ids:
        logger.warning(f"Edge source '{edge_source}' does not reference a valid node")
        return False

    if edge_target not in valid_node_ids:
        logger.warning(f"Edge target '{edge_target}' does not reference a valid node")
        return False

    return True


def sanitize_string(input_string: str, max_length: int = 1000) -> str:
    """
    Sanitize a string input by limiting length and removing null bytes.

    Args:
        input_string: Input string
        max_length: Maximum allowed length

    Returns:
        Sanitized string
    """
    if not input_string:
        return ""

    # Remove null bytes
    sanitized = input_string.replace("\x00", "")

    # Truncate if too long
    if len(sanitized) > max_length:
        logger.warning(f"String truncated from {len(sanitized)} to {max_length} characters")
        sanitized = sanitized[:max_length]

    return sanitized.strip()
