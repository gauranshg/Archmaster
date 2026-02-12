# Conversion Example: Before and After

This document shows a complete example of converting a simple Azure Function app into a well-structured MCP-enabled project.

## Before: Simple function_app.py

```python
# function_app.py (Before - 150+ lines, business logic mixed in)

import azure.functions as func
import logging
import json
import requests
import os

app = func.FunctionApp()

# Business logic mixed with routing
def get_products_from_api():
    """Fetch products from external API"""
    api_url = os.getenv("PRODUCT_API_URL")
    api_key = os.getenv("PRODUCT_API_KEY")

    headers = {"Authorization": f"Bearer {api_key}"}
    response = requests.get(f"{api_url}/products", headers=headers)
    response.raise_for_status()

    return response.json()

def create_product_in_api(name, category, price):
    """Create product via external API"""
    api_url = os.getenv("PRODUCT_API_URL")
    api_key = os.getenv("PRODUCT_API_KEY")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    data = {
        "name": name,
        "category": category,
        "price": price
    }

    response = requests.post(f"{api_url}/products", json=data, headers=headers)
    response.raise_for_status()

    return response.json()

@app.route(route="products", auth_level=func.AuthLevel.ANONYMOUS)
def list_products(req: func.HttpRequest) -> func.HttpResponse:
    """List all products"""
    logging.info('HTTP trigger: list_products')

    try:
        products = get_products_from_api()
        return func.HttpResponse(
            json.dumps(products),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(str(e), status_code=500)

@app.route(route="products/create", auth_level=func.AuthLevel.ANONYMOUS, methods=["POST"])
def create_product(req: func.HttpRequest) -> func.HttpResponse:
    """Create a new product"""
    logging.info('HTTP trigger: create_product')

    try:
        req_body = req.get_json()
    except:
        return func.HttpResponse("Invalid JSON", status_code=400)

    name = req_body.get("name")
    category = req_body.get("category")
    price = req_body.get("price")

    if not name or not category:
        return func.HttpResponse("Missing required fields", status_code=400)

    try:
        result = create_product_in_api(name, category, price)
        return func.HttpResponse(
            json.dumps(result),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(str(e), status_code=500)
```

### Problems with "Before":
1. ❌ Business logic mixed with routing
2. ❌ No separation of concerns
3. ❌ Hard to test business logic independently
4. ❌ No self-documenting API (no GET documentation)
5. ❌ No MCP support
6. ❌ Inconsistent error handling
7. ❌ No reusability

---

## After: Well-Structured Project

### Project Structure
```
project/
├── function_app.py              # ONLY decorators (35 lines)
├── mcp_utils.py                 # MCP utilities
├── host.json
├── local.settings.json
├── requirements.txt
│
├── http_triggers/
│   ├── __init__.py
│   ├── list_products.py         # HTTP: List products
│   └── create_product.py        # HTTP: Create product (GET + POST)
│
├── mcp_triggers/
│   ├── __init__.py
│   ├── search_products.py       # MCP: Search products
│   └── create_product_mcp.py    # MCP: Create product
│
└── utils/
    ├── __init__.py
    ├── product_api.py           # Product API client
    └── config.py                # Configuration management
```

### File 1: function_app.py (Only decorators - 35 lines)

```python
"""
Minimal function_app.py - ONLY decorators and routing
"""

import azure.functions as func

app = func.FunctionApp()

# ============================================
# HTTP TRIGGERS
# ============================================

from http_triggers.list_products import list_products_logic
@app.route(route="products", auth_level=func.AuthLevel.ANONYMOUS)
def list_products(req: func.HttpRequest) -> func.HttpResponse:
    return list_products_logic(req)

from http_triggers.create_product import create_product_get_logic, create_product_post_logic

@app.route(route="products/create", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def create_product_info(req: func.HttpRequest) -> func.HttpResponse:
    return create_product_get_logic(req)

@app.route(route="products/create", auth_level=func.AuthLevel.ANONYMOUS, methods=["POST"])
def create_product_post(req: func.HttpRequest) -> func.HttpResponse:
    return create_product_post_logic(req)

# ============================================
# MCP TRIGGERS
# ============================================

from mcp_triggers.create_product_mcp import (
    create_product_mcp_logic,
    create_product_mcp_properties_json,
    create_product_mcp_description
)

@app.generic_trigger(
    arg_name="context",
    type="mcpToolTrigger",
    toolName="create_product",
    description=create_product_mcp_description,
    toolProperties=create_product_mcp_properties_json,
    auth_level="anonymous",
)
def create_product_mcp(context) -> str:
    return create_product_mcp_logic(context)
```

### File 2: utils/product_api.py (Business logic)

```python
"""
Product API Client
All business logic for interacting with the product API.
"""

import requests
import os
import logging


def get_api_headers():
    """Get authenticated headers for API calls"""
    api_key = os.getenv("PRODUCT_API_KEY")
    return {"Authorization": f"Bearer {api_key}"}


def get_all_products():
    """
    Fetch all products from external API.

    Returns:
        list: List of product dictionaries

    Raises:
        requests.RequestException: If API call fails
    """
    api_url = os.getenv("PRODUCT_API_URL")
    headers = get_api_headers()

    try:
        response = requests.get(f"{api_url}/products", headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logging.error(f"Failed to fetch products: {e}")
        raise


def create_product(name, category, price=None):
    """
    Create a new product via external API.

    Args:
        name: Product name (required)
        category: Product category (required)
        price: Product price (optional)

    Returns:
        dict: Created product details

    Raises:
        ValueError: If required fields are missing
        requests.RequestException: If API call fails
    """
    if not name or not category:
        raise ValueError("Name and category are required")

    api_url = os.getenv("PRODUCT_API_URL")
    headers = {
        **get_api_headers(),
        "Content-Type": "application/json"
    }

    data = {
        "name": name,
        "category": category
    }

    if price is not None:
        data["price"] = price

    try:
        response = requests.post(f"{api_url}/products", json=data, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logging.error(f"Failed to create product: {e}")
        raise
```

### File 3: utils/__init__.py (Exports)

```python
"""
Utility functions for product operations.
"""

from .product_api import get_all_products, create_product

__all__ = ["get_all_products", "create_product"]
```

### File 4: http_triggers/list_products.py

```python
"""
HTTP Trigger: List Products
Returns all products from the system.
"""

import azure.functions as func
import logging
import json
from utils import get_all_products


def list_products_logic(req: func.HttpRequest) -> func.HttpResponse:
    """
    List all products.

    Args:
        req: HTTP request

    Returns:
        HTTP response with product list or error
    """
    logging.info('HTTP trigger: list_products')

    try:
        products = get_all_products()

        return func.HttpResponse(
            body=json.dumps(products, indent=2),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Error listing products: {e}")
        return func.HttpResponse(
            json.dumps({"error": f"An error occurred: {str(e)}"}),
            status_code=500,
            mimetype="application/json"
        )
```

### File 5: http_triggers/create_product.py

```python
"""
HTTP Trigger: Create Product
Dual-method endpoint (GET = docs, POST = create).
"""

import azure.functions as func
import logging
import json
from utils import create_product


def create_product_get_logic(req: func.HttpRequest) -> func.HttpResponse:
    """GET endpoint - Returns API documentation"""
    logging.info('GET /products/create called.')

    info = {
        "description": "POST to this endpoint to create a new product",
        "input_example": {
            "name": "Product Name",
            "category": "Category",
            "price": 99.99
        },
        "required_fields": ["name", "category"],
        "optional_fields": ["price"],
        "output": {
            "success": True,
            "data": {
                "id": "123",
                "name": "Product Name",
                "category": "Category",
                "price": 99.99
            }
        }
    }

    return func.HttpResponse(
        body=json.dumps(info, indent=2),
        status_code=200,
        mimetype="application/json"
    )


def create_product_post_logic(req: func.HttpRequest) -> func.HttpResponse:
    """POST endpoint - Creates the product"""
    logging.info('POST /products/create called.')

    try:
        req_body = req.get_json()
    except Exception:
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON body"}),
            status_code=400,
            mimetype="application/json"
        )

    # Validate required fields
    required_fields = ["name", "category"]
    missing = [f for f in required_fields if f not in req_body]
    if missing:
        return func.HttpResponse(
            json.dumps({"error": f"Missing required fields: {', '.join(missing)}"}),
            status_code=400,
            mimetype="application/json"
        )

    try:
        result = create_product(
            name=req_body["name"],
            category=req_body["category"],
            price=req_body.get("price")
        )

        return func.HttpResponse(
            body=json.dumps({"success": True, "data": result}, indent=2),
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
        logging.error(f"Error creating product: {e}")
        return func.HttpResponse(
            json.dumps({"error": f"An error occurred: {str(e)}"}),
            status_code=500,
            mimetype="application/json"
        )
```

### File 6: mcp_triggers/create_product_mcp.py

```python
"""
MCP Trigger: Create Product
Allows AI agents to create products via MCP protocol.
"""

import logging
import json
from mcp_utils import (
    ToolProperty,
    create_mcp_response,
    parse_mcp_context,
    validate_required_args,
)
from utils import create_product


# Part 1: Define Properties
create_product_mcp_properties = [
    ToolProperty("name", "string", "Product name", required=True),
    ToolProperty("category", "string", "Product category", required=True),
    ToolProperty("price", "number", "Product price (optional)", required=False),
]

create_product_mcp_properties_json = json.dumps([
    prop.to_dict() for prop in create_product_mcp_properties
])


# Part 2: Define Description
create_product_mcp_description = """Creates a new product in the system.

Required fields: name (product name), category (product category).
Optional fields: price (product price as a number).

Returns: Created product details including id, name, category, and price."""


# Part 3: Implement Logic
def create_product_mcp_logic(context) -> str:
    """MCP tool logic for creating products."""
    logging.info("MCP trigger invoked for create_product.")

    try:
        # Parse and validate
        args = parse_mcp_context(context)
        validate_required_args(args, ["name", "category"])

        # Execute business logic
        result = create_product(
            name=args["name"],
            category=args["category"],
            price=args.get("price")
        )

        return create_mcp_response(success=True, data=result)

    except ValueError as e:
        logging.error(f"Validation error: {e}")
        return create_mcp_response(success=False, error=str(e))

    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return create_mcp_response(success=False, error=f"An error occurred: {str(e)}")
```

---

## Benefits of "After" Structure

### ✅ Separation of Concerns
- **function_app.py**: Only decorators and routing (35 lines vs 150+)
- **utils/**: All business logic, testable independently
- **http_triggers/**: HTTP-specific request/response handling
- **mcp_triggers/**: MCP-specific tool definitions

### ✅ Reusability
- Business logic in `utils/product_api.py` is used by both HTTP and MCP interfaces
- No code duplication

### ✅ Testability
```python
# Easy to unit test business logic
from utils import create_product

def test_create_product():
    result = create_product("Test Product", "Test Category", 99.99)
    assert "id" in result
```

### ✅ Self-Documenting
- GET endpoints return usage documentation
- Clear file structure shows all available endpoints
- MCP descriptions help AI agents understand tool usage

### ✅ Scalability
- Adding new endpoints is straightforward
- Each endpoint is self-contained
- Easy to find and modify specific functionality

### ✅ Dual Interface Support
- Same business logic accessible via HTTP and MCP
- Maximum flexibility for different use cases

### ✅ Proper Error Handling
- Consistent error handling patterns
- Appropriate HTTP status codes
- Detailed logging for debugging

---

## Migration Steps Summary

1. ✅ Created directory structure
2. ✅ Extracted business logic to `utils/product_api.py`
3. ✅ Created HTTP trigger files with dual-method pattern
4. ✅ Created MCP trigger files with three-part export
5. ✅ Rewrote `function_app.py` with only decorators
6. ✅ Added proper error handling throughout
7. ✅ Added comprehensive logging
8. ✅ Created self-documenting endpoints

The result is a **production-ready, maintainable, scalable** Azure Function application with both HTTP and MCP support!
