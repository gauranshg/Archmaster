"""
Diagram CRUD endpoints for Azure Functions.

Implements REST API endpoints for managing diagrams.
"""

import azure.functions as func
import logging
from typing import Dict, Any
from ..model import Diagram, DiagramCreate, DiagramUpdate
from ..db.cosmos import CosmosDBClient
from ..utils.errors import NotFoundError, ValidationError, APIError
from ..utils.auth import get_user_id_from_headers
from ..utils.config import get_cosmos_client


logger = logging.getLogger(__name__)
router = func.Blueprint()


@router.route(route="diagrams", auth_level=func.AuthLevel.ANONYMOUS, methods=["POST"])
async def create_diagram(req: func.HttpRequest) -> func.HttpResponse:
    """
    Create a new diagram.

    POST /api/diagrams

    Request body:
        {
            "name": "My Diagram",
            "type": "system-context",
            "nodes": [...],
            "edges": [...],
            "customCSS": "...",
            "workspaceId": "workspace-123"
        }

    Returns:
        Created diagram with ID (201)
    """
    try:
        # Get user ID from auth headers
        user_id = get_user_id_from_headers(req)
        if not user_id:
            return func.HttpResponse(
                body='{"error": "Unauthorized"}',
                status_code=401,
                mimetype="application/json"
            )

        # Parse request body
        data = req.get_json()
        if not data:
            raise ValidationError("Request body is required")

        # Validate with Pydantic
        diagram_data = DiagramCreate(**data)

        # Get Cosmos DB client
        cosmos_client = get_cosmos_client()
        if not cosmos_client:
            raise APIError("Database connection failed", 500)

        db = CosmosDBClient(
            connection_string="",  # Client already initialized
            database_name="architecture-platform"
        )

        # Create diagram
        diagram_dict = diagram_data.model_dump()
        created = await db.create_diagram(diagram_dict, diagram_data.workspaceId)

        return func.HttpResponse(
            body=Diagram(**created).model_dump_json(),
            status_code=201,
            mimetype="application/json",
            headers={"Location": f"/api/diagrams/{created['id']}"}
        )

    except ValidationError as e:
        return func.HttpResponse(
            body=f'{{"error": "{e.message}", "details": {e.details}}}',
            status_code=400,
            mimetype="application/json"
        )
    except APIError as e:
        return func.HttpResponse(
            body=e.to_dict(),
            status_code=e.status_code,
            mimetype="application/json"
        )
    except Exception as e:
        logger.exception(f"Error creating diagram: {e}")
        return func.HttpResponse(
            body='{"error": "Internal server error"}',
            status_code=500,
            mimetype="application/json"
        )


@router.route(route="diagrams/{diagram_id}", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
async def get_diagram(req: func.HttpRequest) -> func.HttpResponse:
    """
    Get a diagram by ID.

    GET /api/diagrams/{diagram_id}?workspaceId={workspace_id}

    Returns:
        Diagram data (200) or 404 if not found
    """
    try:
        # Get user ID from auth headers
        user_id = get_user_id_from_headers(req)
        if not user_id:
            return func.HttpResponse(
                body='{"error": "Unauthorized"}',
                status_code=401,
                mimetype="application/json"
            )

        # Get diagram ID from route
        diagram_id = req.route_params.get("diagram_id")
        if not diagram_id:
            raise ValidationError("diagram_id is required")

        # Get workspace_id from query params
        workspace_id = req.params.get("workspaceId")
        if not workspace_id:
            raise ValidationError("workspaceId query parameter is required")

        # Get Cosmos DB client
        cosmos_client = get_cosmos_client()
        if not cosmos_client:
            raise APIError("Database connection failed", 500)

        db = CosmosDBClient(
            connection_string="",
            database_name="architecture-platform"
        )

        # Fetch diagram
        diagram = await db.get_diagram(diagram_id, workspace_id)
        if not diagram:
            raise NotFoundError(f"Diagram {diagram_id} not found")

        return func.HttpResponse(
            body=Diagram(**diagram).model_dump_json(),
            status_code=200,
            mimetype="application/json"
        )

    except (ValidationError, NotFoundError, APIError) as e:
        return func.HttpResponse(
            body=e.to_dict(),
            status_code=e.status_code,
            mimetype="application/json"
        )
    except Exception as e:
        logger.exception(f"Error getting diagram: {e}")
        return func.HttpResponse(
            body='{"error": "Internal server error"}',
            status_code=500,
            mimetype="application/json"
        )


@router.route(route="diagrams/{diagram_id}", auth_level=func.AuthLevel.ANONYMOUS, methods=["PUT"])
async def update_diagram(req: func.HttpRequest) -> func.HttpResponse:
    """
    Update a diagram.

    PUT /api/diagrams/{diagram_id}?workspaceId={workspace_id}

    Request body:
        {
            "name": "Updated Name",
            "nodes": [...],
            "edges": [...]
        }

    Returns:
        Updated diagram (200)
    """
    try:
        # Get user ID from auth headers
        user_id = get_user_id_from_headers(req)
        if not user_id:
            return func.HttpResponse(
                body='{"error": "Unauthorized"}',
                status_code=401,
                mimetype="application/json"
            )

        # Get diagram ID from route
        diagram_id = req.route_params.get("diagram_id")
        if not diagram_id:
            raise ValidationError("diagram_id is required")

        # Get workspace_id from query params
        workspace_id = req.params.get("workspaceId")
        if not workspace_id:
            raise ValidationError("workspaceId query parameter is required")

        # Parse request body
        data = req.get_json()
        if not data:
            raise ValidationError("Request body is required")

        # Validate with Pydantic
        update_data = DiagramUpdate(**data)

        # Get Cosmos DB client
        cosmos_client = get_cosmos_client()
        if not cosmos_client:
            raise APIError("Database connection failed", 500)

        db = CosmosDBClient(
            connection_string="",
            database_name="architecture-platform"
        )

        # Update diagram
        updates = {k: v for k, v in update_data.model_dump().items() if v is not None}
        updated = await db.update_diagram(diagram_id, workspace_id, updates)

        if not updated:
            raise NotFoundError(f"Diagram {diagram_id} not found")

        return func.HttpResponse(
            body=Diagram(**updated).model_dump_json(),
            status_code=200,
            mimetype="application/json"
        )

    except (ValidationError, NotFoundError, APIError) as e:
        return func.HttpResponse(
            body=e.to_dict(),
            status_code=e.status_code,
            mimetype="application/json"
        )
    except Exception as e:
        logger.exception(f"Error updating diagram: {e}")
        return func.HttpResponse(
            body='{"error": "Internal server error"}',
            status_code=500,
            mimetype="application/json"
        )


@router.route(route="diagrams/{diagram_id}", auth_level=func.AuthLevel.ANONYMOUS, methods=["DELETE"])
async def delete_diagram(req: func.HttpRequest) -> func.HttpResponse:
    """
    Delete a diagram.

    DELETE /api/diagrams/{diagram_id}?workspaceId={workspace_id}

    Returns:
        204 No Content on success
    """
    try:
        # Get user ID from auth headers
        user_id = get_user_id_from_headers(req)
        if not user_id:
            return func.HttpResponse(
                body='{"error": "Unauthorized"}',
                status_code=401,
                mimetype="application/json"
            )

        # Get diagram ID from route
        diagram_id = req.route_params.get("diagram_id")
        if not diagram_id:
            raise ValidationError("diagram_id is required")

        # Get workspace_id from query params
        workspace_id = req.params.get("workspaceId")
        if not workspace_id:
            raise ValidationError("workspaceId query parameter is required")

        # Get Cosmos DB client
        cosmos_client = get_cosmos_client()
        if not cosmos_client:
            raise APIError("Database connection failed", 500)

        db = CosmosDBClient(
            connection_string="",
            database_name="architecture-platform"
        )

        # Delete diagram
        deleted = await db.delete_diagram(diagram_id, workspace_id)
        if not deleted:
            raise NotFoundError(f"Diagram {diagram_id} not found")

        return func.HttpResponse(status_code=204)

    except (ValidationError, NotFoundError, APIError) as e:
        return func.HttpResponse(
            body=e.to_dict(),
            status_code=e.status_code,
            mimetype="application/json"
        )
    except Exception as e:
        logger.exception(f"Error deleting diagram: {e}")
        return func.HttpResponse(
            body='{"error": "Internal server error"}',
            status_code=500,
            mimetype="application/json"
        )


@router.route(route="workspaces/{workspace_id}/diagrams", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
async def list_diagrams(req: func.HttpRequest) -> func.HttpResponse:
    """
    List all diagrams in a workspace.

    GET /api/workspaces/{workspace_id}/diagrams

    Returns:
        List of diagrams (200)
    """
    try:
        # Get user ID from auth headers
        user_id = get_user_id_from_headers(req)
        if not user_id:
            return func.HttpResponse(
                body='{"error": "Unauthorized"}',
                status_code=401,
                mimetype="application/json"
            )

        # Get workspace_id from route
        workspace_id = req.route_params.get("workspace_id")
        if not workspace_id:
            raise ValidationError("workspace_id is required")

        # Get Cosmos DB client
        cosmos_client = get_cosmos_client()
        if not cosmos_client:
            raise APIError("Database connection failed", 500)

        db = CosmosDBClient(
            connection_string="",
            database_name="architecture-platform"
        )

        # List diagrams
        diagrams = await db.list_diagrams(workspace_id)

        # Convert to Pydantic models
        result = [Diagram(**d).model_dump() for d in diagrams]

        return func.HttpResponse(
            body=func.json.dumps(result),
            status_code=200,
            mimetype="application/json"
        )

    except (ValidationError, APIError) as e:
        return func.HttpResponse(
            body=e.to_dict(),
            status_code=e.status_code,
            mimetype="application/json"
        )
    except Exception as e:
        logger.exception(f"Error listing diagrams: {e}")
        return func.HttpResponse(
            body='{"error": "Internal server error"}',
            status_code=500,
            mimetype="application/json"
        )
