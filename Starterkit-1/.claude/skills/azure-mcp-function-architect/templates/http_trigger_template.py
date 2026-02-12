"""
HTTP Trigger Logic Template: [Endpoint Name]
[Description of what this endpoint does]

This template demonstrates the dual-method pattern:
- GET method returns API documentation
- POST method implements the actual operation

Includes:
- Correlation ID tracking for distributed tracing
- Structured logging with request context
- Input/output logging for debugging
- Proper error handling and logging
"""

import azure.functions as func
import logging
import json
from utils import your_business_logic_function  # Import from utils
from correlation_utils import RequestContext, log_with_correlation

logger = logging.getLogger(__name__)


def endpoint_name_get_logic(req: func.HttpRequest) -> func.HttpResponse:
    """
    GET endpoint logic - Returns API documentation

    Args:
        req: HTTP request

    Returns:
        HTTP response with endpoint documentation
    """
    # Get or create correlation ID
    correlation_id = req.headers.get("x-correlation-id") or "unknown"

    log_with_correlation(
        logger,
        logging.INFO,
        "GET /endpoint-name called",
        correlation_id=correlation_id,
        endpoint="endpoint-name",
        method="GET"
    )

    info = {
        "description": "POST to this endpoint to perform [operation description]",
        "input_example": {
            "field1": "value1",
            "field2": "value2",
            "optionalField": "optional value"
        },
        "required_fields": ["field1", "field2"],
        "optional_fields": ["optionalField"],
        "output": {
            "success": True,
            "data": {
                "result": "description of result"
            }
        },
        "auth": "Authentication requirements (if any)"
    }

    return func.HttpResponse(
        body=json.dumps(info, indent=2),
        status_code=200,
        mimetype="application/json",
        headers={"x-correlation-id": correlation_id}
    )


def endpoint_name_post_logic(req: func.HttpRequest) -> func.HttpResponse:
    """
    POST endpoint logic - Implements the actual operation

    Args:
        req: HTTP request containing operation parameters

    Returns:
        HTTP response with result or error
    """
    # Get or create correlation ID
    correlation_id = req.headers.get("x-correlation-id") or "unknown"

    log_with_correlation(
        logger,
        logging.INFO,
        "POST /endpoint-name called",
        correlation_id=correlation_id,
        endpoint="endpoint-name",
        method="POST"
    )

    # 1. Parse request body
    try:
        req_body = req.get_json()
    except Exception as e:
        logger.error(
            f"Invalid JSON in request: {e}",
            exc_info=True,
            extra={"correlation_id": correlation_id}
        )
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON body. See GET endpoint for documentation."}),
            status_code=400,
            mimetype="application/json",
            headers={"x-correlation-id": correlation_id}
        )

    # 2. Validate required fields
    required_fields = ["field1", "field2"]
    missing = [f for f in required_fields if f not in req_body]
    if missing:
        logger.warning(
            f"Missing required fields: {missing}",
            extra={"correlation_id": correlation_id, "missing_fields": missing}
        )
        return func.HttpResponse(
            json.dumps({"error": f"Missing required fields: {', '.join(missing)}"}),
            status_code=400,
            mimetype="application/json",
            headers={"x-correlation-id": correlation_id}
        )

    # 3. Extract parameters
    field1 = req_body["field1"]
    field2 = req_body["field2"]
    optional_field = req_body.get("optionalField")

    # Log input (excluding sensitive fields)
    logger.info(
        "Request input received",
        extra={
            "correlation_id": correlation_id,
            "field1": field1,
            "field2": field2,
            "has_optional_field": optional_field is not None
        }
    )

    # 4. Execute business logic
    try:
        result = your_business_logic_function(
            field1=field1,
            field2=field2,
            optional_field=optional_field
        )

        # Log output
        logger.info(
            "Request completed successfully",
            extra={"correlation_id": correlation_id}
        )

        return func.HttpResponse(
            body=json.dumps({"success": True, "data": result}, indent=2),
            status_code=200,
            mimetype="application/json",
            headers={"x-correlation-id": correlation_id}
        )

    except ValueError as e:
        # Handle validation errors (400 Bad Request)
        logger.error(
            f"Validation error: {e}",
            exc_info=True,
            extra={
                "correlation_id": correlation_id,
                "error_type": "ValidationError"
            }
        )
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=400,
            mimetype="application/json",
            headers={"x-correlation-id": correlation_id}
        )

    except Exception as e:
        # Handle unexpected errors (500 Internal Server Error)
        logger.error(
            f"Unexpected error in endpoint_name: {e}",
            exc_info=True,
            extra={
                "correlation_id": correlation_id,
                "error_type": type(e).__name__
            }
        )
        return func.HttpResponse(
            json.dumps({"error": "An internal error occurred"}),
            status_code=500,
            mimetype="application/json",
            headers={"x-correlation-id": correlation_id}
        )


# ============================================
# USAGE IN function_app.py
# ============================================

"""
from http_triggers.endpoint_name import endpoint_name_get_logic, endpoint_name_post_logic

@app.route(route="endpoint-name", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def endpoint_name_info(req: func.HttpRequest) -> func.HttpResponse:
    return endpoint_name_get_logic(req)

@app.route(route="endpoint-name", auth_level=func.AuthLevel.ANONYMOUS, methods=["POST"])
def endpoint_name_post(req: func.HttpRequest) -> func.HttpResponse:
    return endpoint_name_post_logic(req)
"""
