"""
MCP Trigger Logic Template: [Tool Name]
[Description of what this tool does]

This template demonstrates the three-part export pattern for MCP tools:
1. Properties - Parameter metadata
2. Description - AI-friendly tool description
3. Logic - The actual implementation

Includes:
- Correlation ID tracking for distributed tracing
- Structured logging with request context
- Input/output logging for debugging
- Proper error handling and logging
"""

import logging
import json
import uuid
from mcp_utils import (
    ToolProperty,
    create_mcp_response,
    parse_mcp_context,
    validate_required_args,
)
from utils import your_business_logic_function  # Import from utils

logger = logging.getLogger(__name__)


# ============================================
# PART 1: DEFINE TOOL PROPERTIES
# ============================================

tool_name_properties = [
    ToolProperty(
        "parameter1",
        "string",
        "Description of parameter1 - what it does and expected format",
        required=True
    ),
    ToolProperty(
        "parameter2",
        "string",
        "Description of parameter2 - what it does and expected format",
        required=True
    ),
    ToolProperty(
        "optionalParam",
        "string",
        "Description of optional parameter - what it does and default behavior",
        required=False
    ),
]

# Convert to JSON for decorator
tool_name_properties_json = json.dumps([
    prop.to_dict() for prop in tool_name_properties
])


# ============================================
# PART 2: DEFINE TOOL DESCRIPTION
# ============================================

tool_name_description = """[Clear, concise description of what the tool does]

[Optional: PREREQUISITES section - what must be done first]
PREREQUISITES: Must call [other_tool] first to [reason].

[Optional: WORKFLOW section - where this fits in a multi-step process]
WORKFLOW: Step [X] of [Y] - [brief context].

[Required fields section]
Required fields: parameter1 (description), parameter2 (description).

[Optional fields section - if applicable]
Optional fields: optionalParam (description, default: [value]).

[Returns section - what the tool returns]
Returns: [Description of the response structure and what it contains]

[Optional: IMPORTANT section - critical notes or warnings]
IMPORTANT: [Any critical information users should know]
"""


# ============================================
# PART 3: IMPLEMENT BUSINESS LOGIC
# ============================================

def tool_name_logic(context) -> str:
    """
    Business logic for the MCP tool.

    Args:
        context: MCP trigger context containing arguments

    Returns:
        JSON string with standardized response format
    """
    # Generate correlation ID for this MCP invocation
    correlation_id = str(uuid.uuid4())

    logger.info(
        "MCP trigger invoked for tool_name",
        extra={
            "correlation_id": correlation_id,
            "tool": "tool_name"
        }
    )

    try:
        # 1. Parse MCP context to extract arguments
        args = parse_mcp_context(context)

        # 2. Validate required parameters
        validate_required_args(args, ["parameter1", "parameter2"])

        # 3. Extract parameters
        param1 = args["parameter1"]
        param2 = args["parameter2"]
        optional_param = args.get("optionalParam")

        # Log input (excluding sensitive data)
        logger.info(
            "MCP tool input received",
            extra={
                "correlation_id": correlation_id,
                "tool": "tool_name",
                "parameter1": param1,
                "parameter2": param2,
                "has_optional_param": optional_param is not None
            }
        )

        # 4. Execute business logic
        result = your_business_logic_function(
            param1=param1,
            param2=param2,
            optional_param=optional_param
        )

        # Log output
        logger.info(
            "MCP tool completed successfully",
            extra={
                "correlation_id": correlation_id,
                "tool": "tool_name"
            }
        )

        # 5. Return standardized success response
        return create_mcp_response(success=True, data=result)

    except ValueError as e:
        # Handle validation errors
        logger.error(
            f"Validation error in tool_name: {e}",
            exc_info=True,
            extra={
                "correlation_id": correlation_id,
                "tool": "tool_name",
                "error_type": "ValidationError"
            }
        )
        return create_mcp_response(success=False, error=str(e))

    except Exception as e:
        # Handle unexpected errors
        logger.error(
            f"Unexpected error in tool_name: {e}",
            exc_info=True,
            extra={
                "correlation_id": correlation_id,
                "tool": "tool_name",
                "error_type": type(e).__name__
            }
        )
        return create_mcp_response(
            success=False,
            error=f"An unexpected error occurred"
        )


# ============================================
# USAGE IN function_app.py
# ============================================

"""
from mcp_triggers.tool_name import (
    tool_name_logic,
    tool_name_properties_json,
    tool_name_description
)

@app.generic_trigger(
    arg_name="context",
    type="mcpToolTrigger",
    toolName="tool_name",
    description=tool_name_description,
    toolProperties=tool_name_properties_json,
    auth_level="anonymous",
)
def tool_name_mcp(context) -> str:
    return tool_name_logic(context)
"""


# ============================================
# COMMON PROPERTY TYPES
# ============================================

"""
Property types you can use:
- "string" - Text values
- "integer" - Whole numbers
- "number" - Decimal numbers
- "boolean" - true/false values
- "array" - Lists of values
- "object" - Complex nested structures

Example with different types:
tool_properties = [
    ToolProperty("name", "string", "User name", required=True),
    ToolProperty("age", "integer", "User age", required=False),
    ToolProperty("price", "number", "Product price", required=True),
    ToolProperty("active", "boolean", "Is active", required=False),
    ToolProperty("tags", "array", "List of tags", required=False),
    ToolProperty("metadata", "object", "Additional data", required=False),
]
"""
