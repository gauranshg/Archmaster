"""
Minimal function_app.py Template
All business logic has been extracted to separate files.
This file contains only Azure Functions decorators and routing.

Directory structure expected:
    http_triggers/          # HTTP endpoint implementations
    mcp_triggers/           # MCP trigger implementations
    utils/                  # Business logic and services
    mcp_utils.py           # MCP framework utilities
    correlation_utils.py   # Correlation ID tracking
"""

import azure.functions as func
import logging
import json
import os
import time

logger = logging.getLogger(__name__)

# ============================================
# INITIALIZE AZURE FUNCTIONS APP
# ============================================
app = func.FunctionApp()

# ============================================
# HEALTH CHECK ENDPOINT
# ============================================

@app.route(route="health", auth_level=func.AuthLevel.ANONYMOUS)
def health_check(req: func.HttpRequest) -> func.HttpResponse:
    """
    Health check endpoint for monitoring and load balancer checks.

    Returns basic service health status without requiring authentication.
    Use this for Azure Application Insights health checks, load balancer probes,
    and container orchestration health checks.

    Returns:
        HTTP response with health status information
    """
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "service": os.getenv("FUNCTIONS_EXTENSION_VERSION", "unknown"),
        "environment": os.getenv("AZURE_FUNCTIONS_ENVIRONMENT", "development")
    }

    return func.HttpResponse(
        body=json.dumps(health_status, indent=2),
        status_code=200,
        mimetype="application/json"
    )

# ============================================
# HTTP TRIGGERS - EXAMPLE ENDPOINTS
# ============================================

# Example: Simple HTTP Endpoint (Single Method)
from http_triggers.example_endpoint import example_endpoint_logic
@app.route(route="example", auth_level=func.AuthLevel.ANONYMOUS)
def example_endpoint(req: func.HttpRequest) -> func.HttpResponse:
    return example_endpoint_logic(req)

# Example: Dual Method HTTP Endpoint (GET = docs, POST = execute)
from http_triggers.create_item import create_item_get_logic, create_item_post_logic

@app.route(route="create-item", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def create_item_info(req: func.HttpRequest) -> func.HttpResponse:
    return create_item_get_logic(req)

@app.route(route="create-item", auth_level=func.AuthLevel.ANONYMOUS, methods=["POST"])
def create_item_post(req: func.HttpRequest) -> func.HttpResponse:
    return create_item_post_logic(req)

# ============================================
# MCP TOOL TRIGGERS - EXAMPLE TOOLS
# ============================================

# Example: Search MCP Tool
from mcp_triggers.search_items import (
    search_items_logic,
    search_items_properties_json,
    search_items_description
)
@app.generic_trigger(
    arg_name="context",
    type="mcpToolTrigger",
    toolName="search_items",
    description=search_items_description,
    toolProperties=search_items_properties_json,
    auth_level="anonymous",
)
def search_items_mcp(context) -> str:
    return search_items_logic(context)

# Example: Create Item MCP Tool
from mcp_triggers.create_item_mcp import (
    create_item_mcp_logic,
    create_item_mcp_properties_json,
    create_item_mcp_description
)
@app.generic_trigger(
    arg_name="context",
    type="mcpToolTrigger",
    toolName="create_item",
    description=create_item_mcp_description,
    toolProperties=create_item_mcp_properties_json,
    auth_level="anonymous",
)
def create_item_mcp(context) -> str:
    return create_item_mcp_logic(context)

# ============================================
# INSTRUCTIONS FOR ADDING NEW ENDPOINTS
# ============================================

"""
TO ADD NEW HTTP ENDPOINT:
1. Create file: http_triggers/your_endpoint.py
2. Implement: your_endpoint_get_logic() and/or your_endpoint_post_logic()
3. Import in this file
4. Add @app.route decorator(s)

TO ADD NEW MCP TOOL:
1. Create file: mcp_triggers/your_tool.py
2. Define: your_tool_properties, your_tool_properties_json, your_tool_description
3. Implement: your_tool_logic()
4. Import all three exports in this file
5. Add @app.generic_trigger decorator

TO ADD BUSINESS LOGIC:
1. Create module in utils/
2. Import from utils/ in your trigger files
3. Keep this file (function_app.py) minimal - only decorators!
"""
