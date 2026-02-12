"""
Utility classes and functions for Azure Functions with MCP integration.

This module provides standardized utilities for working with MCP triggers:
- ToolProperty: Class for defining tool parameter metadata
- create_mcp_response: Standardized response format
- parse_mcp_context: Extract arguments from MCP context
- validate_required_args: Validate required parameters
"""

import json


class ToolProperty:
    """
    Represents a tool property for MCP trigger metadata.

    Used to define parameters that your MCP tool accepts, including
    their types, descriptions, and whether they're required.

    Attributes:
        propertyName (str): The name of the parameter (camelCase recommended)
        propertyType (str): The type (string, integer, number, boolean, array, object)
        description (str): Human-readable description of the parameter
        required (bool): Whether this parameter is required

    Example:
        >>> prop = ToolProperty("userName", "string", "The user's name", required=True)
        >>> prop.to_dict()
        {'propertyName': 'userName', 'propertyType': 'string',
         'description': "The user's name", 'required': True}
    """

    def __init__(
        self,
        property_name: str,
        property_type: str,
        description: str,
        required: bool = False,
    ):
        """
        Initialize a ToolProperty.

        Args:
            property_name: The parameter name (use camelCase)
            property_type: The type (string, integer, number, boolean, array, object)
            description: Clear description of what this parameter does
            required: Whether this parameter is required (default: False)
        """
        self.propertyName = property_name
        self.propertyType = property_type
        self.description = description
        self.required = required

    def to_dict(self):
        """
        Convert the ToolProperty to a dictionary for JSON serialization.

        Returns:
            dict: Dictionary representation of the property
        """
        prop_dict = {
            "propertyName": self.propertyName,
            "propertyType": self.propertyType,
            "description": self.description,
        }
        if self.required:
            prop_dict["required"] = True
        return prop_dict


def create_mcp_response(success: bool, data=None, error: str = None) -> str:
    """
    Create a standardized MCP response.

    All MCP tools should use this function to return responses in a
    consistent format that AI agents can reliably parse.

    Args:
        success: Whether the operation succeeded
        data: The response data (any JSON-serializable object)
        error: Error message if success is False

    Returns:
        JSON string with standardized response format

    Examples:
        >>> create_mcp_response(success=True, data={"id": 123, "name": "Item"})
        '{"success": true, "data": {"id": 123, "name": "Item"}}'

        >>> create_mcp_response(success=False, error="Item not found")
        '{"success": false, "error": "Item not found"}'
    """
    response = {"success": success}
    if data is not None:
        response["data"] = data
    if error is not None:
        response["error"] = error
    return json.dumps(response)


def parse_mcp_context(context):
    """
    Parse MCP trigger context and extract arguments.

    The MCP runtime passes a JSON string containing the tool arguments.
    This function safely parses that context and extracts the arguments.

    Args:
        context: The MCP trigger context string

    Returns:
        dict: Arguments dictionary extracted from context

    Raises:
        ValueError: If context is invalid JSON or malformed

    Example:
        >>> context = '{"arguments": {"name": "John", "age": 30}}'
        >>> args = parse_mcp_context(context)
        >>> args
        {'name': 'John', 'age': 30}
    """
    try:
        content = json.loads(context)
        return content.get("arguments", {})
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in MCP context: {e}")
    except Exception as e:
        raise ValueError(f"Failed to parse MCP context: {e}")


def validate_required_args(args, required_fields):
    """
    Validate that all required arguments are present and non-empty.

    Checks that each required field exists in the arguments dictionary
    and has a truthy value (not None, empty string, etc.).

    Args:
        args: Arguments dictionary to validate
        required_fields: List of required field names

    Raises:
        ValueError: If any required field is missing or empty

    Example:
        >>> args = {"name": "John", "email": "john@example.com"}
        >>> validate_required_args(args, ["name", "email"])  # Success
        >>> validate_required_args(args, ["name", "phone"])  # Raises ValueError
        ValueError: Missing required fields: phone
    """
    missing_fields = [field for field in required_fields if not args.get(field)]
    if missing_fields:
        raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")


# ============================================
# ADDITIONAL HELPER FUNCTIONS
# ============================================

def validate_field_type(args, field_name, expected_type):
    """
    Validate that a field has the expected type.

    Args:
        args: Arguments dictionary
        field_name: Name of the field to validate
        expected_type: Expected Python type (str, int, float, bool, list, dict)

    Raises:
        ValueError: If field type doesn't match expected type

    Example:
        >>> args = {"age": 30}
        >>> validate_field_type(args, "age", int)  # Success
        >>> validate_field_type(args, "age", str)  # Raises ValueError
    """
    if field_name in args:
        value = args[field_name]
        if not isinstance(value, expected_type):
            raise ValueError(
                f"Field '{field_name}' must be of type {expected_type.__name__}, "
                f"got {type(value).__name__}"
            )


def validate_field_in_list(args, field_name, valid_values):
    """
    Validate that a field value is in a list of valid values.

    Args:
        args: Arguments dictionary
        field_name: Name of the field to validate
        valid_values: List of valid values

    Raises:
        ValueError: If field value is not in valid_values

    Example:
        >>> args = {"status": "active"}
        >>> validate_field_in_list(args, "status", ["active", "inactive"])  # Success
        >>> validate_field_in_list(args, "status", ["pending", "completed"])  # Raises ValueError
    """
    if field_name in args:
        value = args[field_name]
        if value not in valid_values:
            raise ValueError(
                f"Field '{field_name}' must be one of {valid_values}, got '{value}'"
            )


def extract_optional_args(args, optional_fields, defaults=None):
    """
    Extract optional arguments with default values.

    Args:
        args: Arguments dictionary
        optional_fields: List of optional field names
        defaults: Dictionary of default values for optional fields

    Returns:
        dict: Dictionary with optional field values (using defaults if not provided)

    Example:
        >>> args = {"name": "John"}
        >>> defaults = {"age": 0, "active": True}
        >>> optional = extract_optional_args(args, ["age", "active"], defaults)
        >>> optional
        {'age': 0, 'active': True}
    """
    defaults = defaults or {}
    result = {}
    for field in optional_fields:
        result[field] = args.get(field, defaults.get(field))
    return result
