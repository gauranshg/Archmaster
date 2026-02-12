# Examples

This directory contains practical examples demonstrating the Azure MCP Function Architect patterns.

## Available Examples

### [conversion_example.md](conversion_example.md)
A complete before-and-after example showing how to convert a simple, monolithic Azure Function app into a well-structured MCP-enabled project.

**What it covers:**
- Before: 150+ line function_app.py with business logic mixed in
- After: Clean separation into http_triggers/, mcp_triggers/, and utils/
- All intermediate files with complete code
- Benefits comparison
- Migration steps summary

**Use this example when:**
- You have an existing simple function app to refactor
- You want to see the complete transformation process
- You need a reference for the full file structure

## Quick Reference: File Organization Patterns

### Pattern 1: Simple HTTP Endpoint
```
http_triggers/
└── endpoint_name.py
    └── endpoint_name_logic(req) -> HttpResponse
```

**In function_app.py:**
```python
from http_triggers.endpoint_name import endpoint_name_logic

@app.route(route="endpoint")
def endpoint(req):
    return endpoint_name_logic(req)
```

### Pattern 2: Dual-Method HTTP Endpoint
```
http_triggers/
└── endpoint_name.py
    ├── endpoint_name_get_logic(req) -> HttpResponse (docs)
    └── endpoint_name_post_logic(req) -> HttpResponse (execution)
```

**In function_app.py:**
```python
from http_triggers.endpoint_name import endpoint_name_get_logic, endpoint_name_post_logic

@app.route(route="endpoint", methods=["GET"])
def endpoint_info(req):
    return endpoint_name_get_logic(req)

@app.route(route="endpoint", methods=["POST"])
def endpoint_post(req):
    return endpoint_name_post_logic(req)
```

### Pattern 3: MCP Trigger
```
mcp_triggers/
└── tool_name.py
    ├── tool_name_properties = [ToolProperty(...), ...]
    ├── tool_name_properties_json = json.dumps([...])
    ├── tool_name_description = "..."
    └── tool_name_logic(context) -> str
```

**In function_app.py:**
```python
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
def tool_name_mcp(context):
    return tool_name_logic(context)
```

### Pattern 4: Business Logic Module
```
utils/
├── __init__.py (exports)
└── service_name.py
    ├── function_1()
    ├── function_2()
    └── function_3()
```

**In utils/__init__.py:**
```python
from .service_name import function_1, function_2, function_3

__all__ = ["function_1", "function_2", "function_3"]
```

**In triggers:**
```python
from utils import function_1, function_2
```

## Testing Examples

### Testing HTTP Endpoints

**Test GET endpoint (documentation):**
```bash
curl http://localhost:7071/api/endpoint
```

**Test POST endpoint (execution):**
```bash
curl -X POST http://localhost:7071/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"field1": "value1", "field2": "value2"}'
```

### Testing MCP Triggers

**Python test:**
```python
import json
from mcp_triggers.tool_name import tool_name_logic

context = json.dumps({
    "arguments": {
        "param1": "test1",
        "param2": "test2"
    }
})

result = tool_name_logic(context)
print(result)
```

### Testing Business Logic

**Unit test:**
```python
from utils import your_function

def test_your_function():
    result = your_function("input1", "input2")
    assert result["status"] == "success"
    assert "data" in result
```

## Common Scenarios

### Scenario 1: Adding Authentication
```python
# utils/auth.py
import os
import requests

def get_access_token():
    """Get OAuth access token"""
    tenant_id = os.getenv("TENANT_ID")
    client_id = os.getenv("CLIENT_ID")
    client_secret = os.getenv("CLIENT_SECRET")

    # Token acquisition logic
    # ...

    return access_token

def build_headers(token):
    """Build authenticated headers"""
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
```

### Scenario 2: Database Operations
```python
# utils/database.py
import pyodbc
import os

def get_connection():
    """Get database connection"""
    conn_str = os.getenv("DATABASE_CONNECTION_STRING")
    return pyodbc.connect(conn_str)

def query_data(query, params=None):
    """Execute query and return results"""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params or [])
        return cursor.fetchall()
```

### Scenario 3: External API Integration
```python
# utils/api_client.py
import requests
import os

class APIClient:
    def __init__(self):
        self.base_url = os.getenv("API_BASE_URL")
        self.api_key = os.getenv("API_KEY")

    def _headers(self):
        return {"Authorization": f"Bearer {self.api_key}"}

    def get(self, endpoint):
        """GET request"""
        response = requests.get(
            f"{self.base_url}/{endpoint}",
            headers=self._headers()
        )
        response.raise_for_status()
        return response.json()

    def post(self, endpoint, data):
        """POST request"""
        response = requests.post(
            f"{self.base_url}/{endpoint}",
            json=data,
            headers=self._headers()
        )
        response.raise_for_status()
        return response.json()
```

## Additional Resources

- [Azure Functions Python Developer Guide](https://docs.microsoft.com/azure/azure-functions/functions-reference-python)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Python logging best practices](https://docs.python.org/3/howto/logging.html)
- [HTTP status codes reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

## Contributing Examples

If you have additional examples that would be helpful, consider adding them to this directory following the same pattern:
1. Clear before/after comparison (if applicable)
2. Complete, working code
3. Explanation of benefits
4. Usage instructions
