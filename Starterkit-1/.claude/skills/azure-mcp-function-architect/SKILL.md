---
name: azure-mcp-function-architect
description: Converts simple Azure Function apps into well-structured MCP-enabled projects with organized folders for different trigger types (HTTP, MCP), proper separation of concerns, and production-ready architecture. Use when refactoring Azure Functions, adding MCP support, or structuring new function apps.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Azure MCP Function Architect

This skill helps you transform simple Azure Function applications into well-architected, MCP (Model Context Protocol) enabled projects following enterprise best practices.

## When to Use This Skill

Use this skill when you need to:
- Convert a simple function_app.py into a well-structured project
- Add MCP (Model Context Protocol) trigger support to Azure Functions
- Refactor existing Azure Functions for better organization
- Structure a new Azure Function app with HTTP and MCP triggers
- Implement clean separation of concerns in Azure Functions
- Set up proper folder structure for different trigger types

## Core Architecture Principle

**"function_app.py contains ONLY decorators and routing - ZERO business logic"**

This fundamental principle ensures:
- Easy navigation (all endpoints visible in one file)
- Testable business logic (separate from Azure Functions framework)
- Reusable code (shared between HTTP and MCP interfaces)
- Scalable architecture (adding endpoints is straightforward)

## Target Directory Structure

```
your-project/
├── function_app.py              # ONLY decorators and routing (minimal)
├── mcp_utils.py                 # MCP framework utilities
├── host.json                    # Azure Functions config (v4 with MCP support)
├── local.settings.json          # Environment variables
├── requirements.txt             # Python dependencies
├── .funcignore                  # Deployment exclusions
│
├── http_triggers/               # HTTP endpoint implementations
│   ├── __init__.py
│   ├── endpoint_name.py         # GET = docs, POST = execution
│   └── ...
│
├── mcp_triggers/                # MCP trigger implementations
│   ├── __init__.py
│   ├── tool_name.py             # Properties + Description + Logic
│   └── ...
│
├── utils/                       # Business logic and services
│   ├── __init__.py
│   ├── business_logic.py
│   ├── api_client.py
│   └── ...
│
└── services/                    # Optional: Additional services
    ├── authentication.py
    └── ...
```

## Step-by-Step Conversion Process

### Step 1: Analyze Current Structure

First, understand the existing function app:
1. Read the current function_app.py
2. Identify all endpoints and their business logic
3. List dependencies and environment variables
4. Note any authentication or service integrations

### Step 2: Create Directory Structure

```bash
mkdir -p http_triggers mcp_triggers utils services
touch http_triggers/__init__.py mcp_triggers/__init__.py utils/__init__.py
```

### Step 3: Extract Business Logic

For each function in the current function_app.py:

1. **Identify business logic** - Any code that isn't Azure Functions decorators
2. **Move to utils/** - Create appropriately named modules
3. **Create service interfaces** - For external API calls, database operations, etc.
4. **Export from utils/__init__.py** - Make functions available for import

### Step 4: Create HTTP Triggers

For each HTTP endpoint, create a file in `http_triggers/`:

**Pattern: Dual Method (GET = Documentation, POST = Execution)**

```python
"""
HTTP Trigger Logic: Endpoint Name
Description of what this endpoint does.
"""

import azure.functions as func
import logging
import json
from utils import your_business_logic_function

def endpoint_name_get_logic(req: func.HttpRequest) -> func.HttpResponse:
    """GET endpoint - Returns API documentation"""
    logging.info('GET /endpoint-name called.')

    info = {
        "description": "What this endpoint does",
        "input_example": {
            "field1": "value1",
            "field2": "value2"
        },
        "required_fields": ["field1", "field2"],
        "optional_fields": ["field3"],
        "output": "Description of response",
        "auth": "Authentication requirements"
    }

    return func.HttpResponse(
        body=json.dumps(info, indent=2),
        status_code=200,
        mimetype="application/json"
    )

def endpoint_name_post_logic(req: func.HttpRequest) -> func.HttpResponse:
    """POST endpoint - Implements actual operation"""
    logging.info('POST /endpoint-name called.')

    try:
        # 1. Parse request body
        req_body = req.get_json()
    except Exception:
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON body"}),
            status_code=400,
            mimetype="application/json"
        )

    # 2. Validate required fields
    required_fields = ["field1", "field2"]
    missing = [f for f in required_fields if f not in req_body]
    if missing:
        return func.HttpResponse(
            json.dumps({"error": f"Missing required fields: {', '.join(missing)}"}),
            status_code=400,
            mimetype="application/json"
        )

    # 3. Execute business logic
    try:
        result = your_business_logic_function(req_body)

        return func.HttpResponse(
            body=json.dumps(result, indent=2),
            status_code=200,
            mimetype="application/json"
        )

    except ValueError as e:
        logging.error(f"Validation error: {e}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=400,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Error in endpoint: {e}")
        return func.HttpResponse(
            json.dumps({"error": f"An error occurred: {str(e)}"}),
            status_code=500,
            mimetype="application/json"
        )
```

### Step 5: Create MCP Triggers

For MCP triggers, create files in `mcp_triggers/` with **three exports**:

**Pattern: Properties + Description + Logic**

```python
"""
MCP Trigger Logic: Tool Name
Description of what this tool does.
"""

import logging
import json
from mcp_utils import (
    ToolProperty,
    create_mcp_response,
    parse_mcp_context,
    validate_required_args,
)
from utils import your_business_logic_function

# ============================================
# PART 1: DEFINE TOOL PROPERTIES
# ============================================

tool_name_properties = [
    ToolProperty(
        "parameter1",
        "string",
        "Description of parameter1",
        required=True
    ),
    ToolProperty(
        "parameter2",
        "string",
        "Description of parameter2",
        required=True
    ),
    ToolProperty(
        "optionalParam",
        "string",
        "Description of optional parameter",
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

tool_name_description = """Clear description of what the tool does.

Required fields: parameter1, parameter2

Returns: Description of what the tool returns and its format."""

# ============================================
# PART 3: IMPLEMENT BUSINESS LOGIC
# ============================================

def tool_name_logic(context) -> str:
    """Business logic for the MCP tool."""
    logging.info("MCP trigger invoked for tool_name.")

    try:
        # 1. Parse MCP context
        args = parse_mcp_context(context)

        # 2. Validate required parameters
        validate_required_args(args, ["parameter1", "parameter2"])

        # 3. Extract parameters
        param1 = args["parameter1"]
        param2 = args["parameter2"]
        optional_param = args.get("optionalParam")

        # 4. Execute business logic
        result = your_business_logic_function(param1, param2, optional_param)

        # 5. Return standardized success response
        return create_mcp_response(success=True, data=result)

    except ValueError as e:
        logging.error(f"Validation error: {e}")
        return create_mcp_response(success=False, error=str(e))

    except Exception as e:
        logging.error(f"Unexpected error in tool_name: {e}")
        return create_mcp_response(
            success=False,
            error=f"An unexpected error occurred: {str(e)}"
        )
```

### Step 6: Create MCP Utils

Create `mcp_utils.py` in the project root:

```python
"""
Utility classes and functions for Azure Functions with MCP integration.
"""

import json

class ToolProperty:
    """Represents a tool property for MCP trigger metadata."""

    def __init__(
        self,
        property_name: str,
        property_type: str,
        description: str,
        required: bool = False,
    ):
        self.propertyName = property_name
        self.propertyType = property_type
        self.description = description
        self.required = required

    def to_dict(self):
        prop_dict = {
            "propertyName": self.propertyName,
            "propertyType": self.propertyType,
            "description": self.description,
        }
        if self.required:
            prop_dict["required"] = True
        return prop_dict

def create_mcp_response(success: bool, data=None, error: str = None) -> str:
    """Create a standardized MCP response."""
    response = {"success": success}
    if data is not None:
        response["data"] = data
    if error is not None:
        response["error"] = error
    return json.dumps(response)

def parse_mcp_context(context):
    """Parse MCP trigger context and extract arguments."""
    try:
        content = json.loads(context)
        return content.get("arguments", {})
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in MCP context: {e}")

def validate_required_args(args, required_fields):
    """Validate that all required arguments are present."""
    missing_fields = [field for field in required_fields if not args.get(field)]
    if missing_fields:
        raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
```

### Step 7: Create Minimal function_app.py

Rewrite function_app.py to contain ONLY decorators and routing:

```python
"""
Minimal function_app.py
All business logic has been extracted to separate files.
This file contains only Azure Functions decorators and routing.
"""

import azure.functions as func

# ============================================
# INITIALIZE AZURE FUNCTIONS APP
# ============================================
app = func.FunctionApp()

# ============================================
# HTTP TRIGGERS
# ============================================

# Example HTTP Endpoint
from http_triggers.endpoint_name import endpoint_name_get_logic, endpoint_name_post_logic

@app.route(route="endpoint-name", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def endpoint_name_info(req: func.HttpRequest) -> func.HttpResponse:
    return endpoint_name_get_logic(req)

@app.route(route="endpoint-name", auth_level=func.AuthLevel.ANONYMOUS, methods=["POST"])
def endpoint_name_post(req: func.HttpRequest) -> func.HttpResponse:
    return endpoint_name_post_logic(req)

# ============================================
# MCP TOOL TRIGGERS
# ============================================

# Example MCP Tool
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
```

### Step 8: Update Configuration Files

#### host.json
```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  }
}
```

Note: Extension Bundle v4+ is **required** for MCP support.

#### local.settings.json
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "AzureWebJobsSecretStorageType": "files",

    "TENANT_ID": "your-tenant-id",
    "CLIENT_ID": "your-client-id",
    "CLIENT_SECRET": "your-client-secret",
    "RESOURCE_URL": "your-resource-url"
  }
}
```

#### requirements.txt
```txt
azure-functions
requests
python-dotenv
tenacity
```

## Key Patterns and Best Practices

### 1. HTTP Trigger Pattern: Dual Method
- **GET** = Returns documentation (self-documenting API)
- **POST** = Executes the actual operation
- Consistent error handling with proper status codes
- JSON responses with clear error messages

### 2. MCP Trigger Pattern: Three Exports
- **Properties** = Parameter metadata as list of ToolProperty objects
- **Properties JSON** = Converted to JSON string for decorator
- **Description** = Clear, AI-friendly description of what the tool does
- **Logic Function** = The actual implementation

### 3. Business Logic Separation
- All business logic lives in `utils/` or `services/`
- Triggers only handle request/response formatting
- Reusable across both HTTP and MCP interfaces
- Easy to unit test independently

### 4. Standardized Error Handling
```python
try:
    result = business_logic()
    return success_response(result)
except ValueError as e:  # Validation errors
    logging.error(f"Validation error: {e}")
    return error_response(str(e), status_code=400)
except Exception as e:  # Unexpected errors
    logging.error(f"Unexpected error: {e}")
    return error_response("An error occurred", status_code=500)
```

### 5. Logging Best Practices

IMPORTANT LOGGING RULES:

1. Never log sensitive data - passwords, tokens, secrets, credit cards
2. Use correlation IDs - trace requests across services
3. Log with structured extra context - not just strings
4. Log inputs and outputs - for debugging (sanitize sensitive fields)
5. Use exc_info=True for errors - includes stack trace

Standard logging pattern for HTTP triggers:

```python
import logging

logger = logging.getLogger(__name__)
correlation_id = req.headers.get("x-correlation-id") or "unknown"

# Log request start
logger.info(
    "Request received",
    extra={
        "correlation_id": correlation_id,
        "endpoint": "endpoint-name",
        "method": "POST"
    }
)

# Log input (without sensitive fields)
logger.info(
    "Request input",
    extra={
        "correlation_id": correlation_id,
        "field1": req_body.get("field1"),
        "field2": req_body.get("field2")
    }
)

try:
    result = business_logic()

    # Log success
    logger.info(
        "Request completed successfully",
        extra={"correlation_id": correlation_id}
    )

except ValueError as e:
    # Log validation errors
    logger.error(
        f"Validation error: {e}",
        exc_info=True,  # Includes stack trace
        extra={
            "correlation_id": correlation_id,
            "error_type": "ValidationError"
        }
    )

except Exception as e:
    # Log unexpected errors
    logger.error(
        f"Unexpected error: {e}",
        exc_info=True,
        extra={
            "correlation_id": correlation_id,
            "error_type": type(e).__name__
        }
    )
```

Always return correlation ID in response headers:

```python
return func.HttpResponse(
    body=json.dumps(response),
    status_code=200,
    mimetype="application/json",
    headers={"x-correlation-id": correlation_id}
)
```

### 6. Configuration Management
- All secrets in environment variables
- Never hardcode credentials
- Use Azure Key Vault references in production
- Organize settings by service/domain

## MCP Trigger Definition Details

### Understanding MCP Triggers

MCP (Model Context Protocol) triggers allow AI agents to call your Azure Functions as tools. The key components are:

1. **toolName** - How AI agents reference the tool (use snake_case)
2. **description** - Helps AI decide when to use the tool
3. **toolProperties** - JSON schema defining input parameters
4. **Generic Trigger** - Use `@app.generic_trigger` with `type="mcpToolTrigger"`

### Property Types

Common property types for MCP tools:
- `"string"` - Text values
- `"integer"` - Whole numbers
- `"number"` - Decimal numbers
- `"boolean"` - true/false values
- `"array"` - Lists of values
- `"object"` - Complex nested structures

### Writing Good Descriptions

Good MCP tool descriptions should include:
- **First line**: Clear, concise purpose statement
- **Prerequisites**: What must be done first (if applicable)
- **Workflow**: Where this fits in a multi-step process
- **Parameters**: Brief explanation of key parameters
- **Returns**: What the tool returns
- **Important notes**: Critical information or warnings

Example:
```python
description = """Searches for products in the inventory system.

Use this tool to find products by name, category, or SKU. Supports fuzzy matching.

Required: At least one search parameter (name, category, or sku).
Optional: maxResults (default: 10), includeOutOfStock (default: false).

Returns: List of matching products with id, name, category, price, and stock level."""
```

## Conversion Checklist

When converting an existing function app, use this checklist:

- [ ] Create directory structure (http_triggers/, mcp_triggers/, utils/)
- [ ] Create `__init__.py` files in all directories
- [ ] Extract business logic to utils/
- [ ] Create HTTP trigger files (one per endpoint)
- [ ] Create MCP trigger files (one per tool)
- [ ] Create mcp_utils.py with helper functions
- [ ] Add correlation_utils.py for distributed tracing
- [ ] Add retry_utils.py for resilient API calls (optional)
- [ ] Rewrite function_app.py with only decorators
- [ ] Add health check endpoint to function_app.py
- [ ] Update host.json to Extension Bundle v4+
- [ ] Update local.settings.json with environment variables
- [ ] Update requirements.txt with dependencies
- [ ] Test HTTP endpoints (GET and POST)
- [ ] Test MCP triggers
- [ ] Add correlation ID logging throughout
- [ ] Add input/output logging in try/catch blocks
- [ ] Document environment variables needed
- [ ] Update deployment configuration if needed

## Testing Your Refactored App

### Test HTTP Endpoints
```bash
# Test GET (documentation)
curl http://localhost:7071/api/endpoint-name

# Test POST (execution)
curl -X POST http://localhost:7071/api/endpoint-name \
  -H "Content-Type: application/json" \
  -d '{"field1": "value1", "field2": "value2"}'
```

### Test MCP Triggers
```python
import json
from mcp_triggers.tool_name import tool_name_logic

# Create test context
context = json.dumps({
    "arguments": {
        "parameter1": "test1",
        "parameter2": "test2"
    }
})

# Call logic
result = tool_name_logic(context)
print(result)
```

## Common Issues and Solutions

### Issue: MCP Trigger Not Appearing
**Solution:**
- Ensure Extension Bundle is v4+ in host.json
- Verify all three exports (properties_json, description, logic)
- Check that toolProperties JSON is valid
- Restart the function app

### Issue: Import Errors
**Solution:**
- Ensure `__init__.py` exists in all directories
- Check that utils/ exports are correct
- Verify PYTHONPATH includes project root

### Issue: Environment Variables Not Loading
**Solution:**
- Check local.settings.json is in project root
- Verify JSON syntax is valid
- Ensure "Values" object exists
- Don't commit local.settings.json to git

## Resources and References

For more detailed information, see the template files:
- [function_app_template.py](templates/function_app_template.py) - Complete example
- [http_trigger_template.py](templates/http_trigger_template.py) - HTTP pattern
- [mcp_trigger_template.py](templates/mcp_trigger_template.py) - MCP pattern
- [mcp_utils_template.py](templates/mcp_utils_template.py) - Utilities

External resources:
- [Azure Functions Python Developer Guide](https://docs.microsoft.com/azure/azure-functions/functions-reference-python)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Azure Functions Extension Bundle v4](https://learn.microsoft.com/azure/azure-functions/functions-bindings-register)

## Summary

This skill helps you transform simple Azure Function apps into production-ready, well-architected projects with:
- Clear separation of concerns
- Dual interface support (HTTP + MCP)
- Testable, maintainable code
- Standardized patterns throughout
- Comprehensive error handling
- Proper configuration management

Remember: **function_app.py should only contain decorators and routing!**
