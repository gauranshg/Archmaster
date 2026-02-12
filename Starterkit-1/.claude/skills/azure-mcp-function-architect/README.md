# Azure MCP Function Architect - Skill Documentation

A Claude Code skill for converting simple Azure Function apps into well-structured, MCP-enabled projects with enterprise-grade architecture.

## Quick Start

This skill is automatically available when you're working in this project. Claude will use it when you ask for help with:
- Refactoring Azure Functions
- Adding MCP trigger support
- Structuring function apps
- Converting monolithic function_app.py files

## What This Skill Does

The Azure MCP Function Architect skill helps you:

1. **Transform Simple Function Apps** - Convert monolithic function_app.py files into well-organized projects
2. **Add MCP Support** - Enable AI agent integration through Model Context Protocol
3. **Implement Best Practices** - Apply enterprise architecture patterns
4. **Organize Code** - Create proper separation of concerns with dedicated folders
5. **Standardize Patterns** - Use consistent patterns for HTTP and MCP triggers

## Core Principle

> **"function_app.py contains ONLY decorators and routing - ZERO business logic"**

This fundamental principle ensures:
- Easy navigation (all endpoints visible in one place)
- Testable business logic (separate from Azure Functions framework)
- Reusable code (shared between HTTP and MCP interfaces)
- Scalable architecture (simple to add new endpoints)

## Directory Structure

The skill guides you to create this structure:

```
your-project/
├── function_app.py              # ONLY decorators (minimal)
├── mcp_utils.py                 # MCP framework utilities
├── correlation_utils.py         # Correlation ID tracking
├── retry_utils.py               # Retry decorators (optional)
├── host.json                    # Azure Functions config
├── local.settings.json          # Environment variables
├── requirements.txt             # Dependencies
│
├── http_triggers/               # HTTP endpoints
│   ├── __init__.py
│   └── endpoint.py              # GET = docs, POST = execute
│
├── mcp_triggers/                # MCP tools
│   ├── __init__.py
│   └── tool.py                  # Properties + Description + Logic
│
└── utils/                       # Business logic
    ├── __init__.py
    └── service.py               # All business logic here
```

## Key Patterns

### HTTP Trigger Pattern: Dual Method
- **GET** = Returns documentation (self-documenting API)
- **POST** = Executes the operation
- Consistent error handling
- Proper HTTP status codes

### MCP Trigger Pattern: Three Exports
- **Properties** = Parameter metadata (ToolProperty list)
- **Properties JSON** = JSON string for decorator
- **Description** = AI-friendly tool description
- **Logic Function** = The actual implementation

### Business Logic Separation
- All business logic in `utils/` or `services/`
- Triggers only handle request/response formatting
- Reusable across both HTTP and MCP
- Easy to unit test

## What's Included

### Main Documentation
- **[SKILL.md](SKILL.md)** - Complete skill instructions with step-by-step guide

### Templates
- **[function_app_template.py](templates/function_app_template.py)** - Minimal function_app.py with health check
- **[http_trigger_template.py](templates/http_trigger_template.py)** - HTTP endpoint pattern with correlation ID
- **[mcp_trigger_template.py](templates/mcp_trigger_template.py)** - MCP tool pattern with correlation ID
- **[mcp_utils_template.py](templates/mcp_utils_template.py)** - MCP utilities with helpers
- **[correlation_utils.py](templates/correlation_utils.py)** - Correlation ID tracking and logging
- **[retry_utils.py](templates/retry_utils.py)** - Retry decorators using tenacity

### Examples
- **[conversion_example.md](examples/conversion_example.md)** - Complete before/after conversion
- **[README.md](examples/README.md)** - Quick reference patterns and testing examples

## Example Usage

### Ask Claude to Use This Skill

```
"Help me refactor this Azure Function app to follow MCP best practices"

"Convert my function_app.py to use the MCP architecture pattern"

"Add MCP trigger support to my Azure Functions"

"Structure my function app with separate folders for HTTP and MCP triggers"
```

Claude will automatically use this skill when appropriate based on your request.

## MCP Trigger Basics

### What is MCP?

MCP (Model Context Protocol) allows AI agents to call your Azure Functions as tools. Key components:

- **toolName** - How AI agents reference the tool
- **description** - Helps AI decide when to use it
- **toolProperties** - JSON schema of input parameters
- **Generic Trigger** - Use `@app.generic_trigger` with `type="mcpToolTrigger"`

### Simple MCP Example

```python
# mcp_triggers/greet.py
from mcp_utils import ToolProperty, create_mcp_response, parse_mcp_context

greet_properties_json = json.dumps([
    ToolProperty("name", "string", "User name", required=True).to_dict()
])

greet_description = "Greets a user by name."

def greet_logic(context):
    args = parse_mcp_context(context)
    return create_mcp_response(
        success=True,
        data={"message": f"Hello, {args['name']}!"}
    )

# In function_app.py:
from mcp_triggers.greet import greet_logic, greet_properties_json, greet_description

@app.generic_trigger(
    arg_name="context",
    type="mcpToolTrigger",
    toolName="greet",
    description=greet_description,
    toolProperties=greet_properties_json,
    auth_level="anonymous"
)
def greet_mcp(context):
    return greet_logic(context)
```

## Requirements

### Azure Functions v4+
MCP support requires Extension Bundle v4 or higher:

```json
{
  "version": "2.0",
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  }
}
```

### Python Dependencies
```txt
azure-functions
requests
python-dotenv
tenacity
```

## Benefits

### Before Refactoring
- 150+ line function_app.py with mixed concerns
- Business logic hard to test
- No code reusability
- No self-documentation
- Inconsistent error handling
- No request tracing

### After Refactoring
- 35-line function_app.py (only decorators)
- Business logic in testable modules
- Code shared between HTTP and MCP
- Self-documenting GET endpoints
- Standardized error handling
- Correlation ID tracking for distributed tracing
- Retry logic for resilient API calls
- Production-ready architecture

## New Utilities

### correlation_utils.py
Provides correlation ID tracking for distributed tracing:
- Extract or generate correlation IDs from request headers
- Structured logging with correlation context
- Automatic sanitization of sensitive data (passwords, tokens, secrets)

### retry_utils.py
Provides retry decorators using tenacity:
- `retry_on_network_error` - Retries connection failures, timeouts, 5xx errors
- `retry_on_rate_limit` - Specifically handles HTTP 429 rate limits
- `retry_on_any_error` - Catch-all retry (use sparingly)

## Testing

### HTTP Endpoints
```bash
# Documentation
curl http://localhost:7071/api/endpoint

# Execution with correlation ID
curl -X POST http://localhost:7071/api/endpoint \
  -H "Content-Type: application/json" \
  -H "x-correlation-id: my-trace-id-123" \
  -d '{"field": "value"}'

# Health check
curl http://localhost:7071/api/health
```

### MCP Triggers
```python
import json
from mcp_triggers.tool import tool_logic

context = json.dumps({"arguments": {"param": "value"}})
result = tool_logic(context)
```

### Business Logic
```python
from utils import your_function

def test_function():
    result = your_function("input")
    assert result["status"] == "success"
```

## Common Issues

### MCP Trigger Not Appearing
- Ensure Extension Bundle is v4+ in host.json
- Verify all three exports (properties_json, description, logic)
- Check toolProperties JSON is valid
- Restart function app

### Import Errors
- Ensure `__init__.py` exists in all directories
- Check utils/ exports are correct
- Verify project root is in PYTHONPATH

### Correlation ID Missing in Logs
- Ensure correlation_utils.py is in project root
- Check that logger uses `extra={"correlation_id": ...}`
- Verify x-correlation-id header is returned in response

## Resources

- [Azure Functions Python Guide](https://docs.microsoft.com/azure/azure-functions/functions-reference-python)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Azure Functions Extension Bundle](https://learn.microsoft.com/azure/azure-functions/functions-bindings-register)

## Skill Metadata

- **Name**: azure-mcp-function-architect
- **Version**: 1.0.0
- **Type**: Project Skill (team-shared)
- **Location**: `.claude/skills/azure-mcp-function-architect/`
- **Allowed Tools**: Read, Write, Edit, Glob, Grep, Bash

## Support

For issues or questions about this skill:
1. Check the [SKILL.md](SKILL.md) for detailed instructions
2. Review [examples/](examples/) for practical examples
3. Consult the [templates/](templates/) for reference code

---

**Remember**: The goal is a minimal function_app.py with all business logic extracted to separate, testable modules!
