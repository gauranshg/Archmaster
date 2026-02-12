"""
Workspace CRUD endpoints for Azure Functions.

Implements REST API endpoints for managing workspaces.
"""

import azure.functions as func
import logging
from typing import List
from ..model import Workspace, WorkspaceCreate, WorkspaceUpdate
from ..db.cosmos import CosmosDBClient
from ..utils.errors import NotFoundError, ValidationError, APIError
from ..utils.auth import get_user_id_from_headers
from ..utils.config import get_cosmos_client


logger = logging.getLogger(__name__)
router = func.Blueprint()


@router.route(route="workspaces", auth_level=func.AuthLevel.ANONYMOUS, methods=["POST"])
async def create_workspace(req: func.HttpRequest) -> func.HttpResponse:
    """
    Create a new workspace.

    POST /api/workspaces

    Request body:
        {
            "name": "My Workspace",
            "description": "Workspace description"
        }

    Returns:
        Created workspace with ID (201)
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
        workspace_data = WorkspaceCreate(**data)

        # Get Cosmos DB client
        cosmos_client = get_cosmos_client()
        if not cosmos_client:
            raise APIError("Database connection failed", 500)

        db = CosmosDBClient(
            connection_string="",
            database_name="architecture-platform"
        )

        # Create workspace
        workspace_dict = workspace_data.model_dump()
        created = await db.create_workspace(workspace_dict, user_id)

        return func.HttpResponse(
            body=Workspace(**created).model_dump_json(),
            status_code=201,
            mimetype="application/json",
            headers={"Location": f"/api/workspaces/{created['id']}"}
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
        logger.exception(f"Error creating workspace: {e}")
        return func.HttpResponse(
            body='{"error": "Internal server error"}',
            status_code=500,
            mimetype="application/json"
        )


@router.route(route="workspaces/{workspace_id}", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
async def get_workspace(req: func.HttpRequest) -> func.HttpResponse:
    """
    Get a workspace by ID.

    GET /api/workspaces/{workspace_id}

    Returns:
        Workspace data (200) or 404 if not found
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

        # Fetch workspace
        workspace = await db.get_workspace(workspace_id, user_id)
        if not workspace:
            raise NotFoundError(f"Workspace {workspace_id} not found")

        return func.HttpResponse(
            body=Workspace(**workspace).model_dump_json(),
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
        logger.exception(f"Error getting workspace: {e}")
        return func.HttpResponse(
            body='{"error": "Internal server error"}',
            status_code=500,
            mimetype="application/json"
        )


@router.route(route="workspaces/{workspace_id}", auth_level=func.AuthLevel.ANONYMOUS, methods=["PUT"])
async def update_workspace(req: func.HttpRequest) -> func.HttpResponse:
    """
    Update a workspace.

    PUT /api/workspaces/{workspace_id}

    Request body:
        {
            "name": "Updated Name",
            "description": "Updated description"
        }

    Returns:
        Updated workspace (200)
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

        # Parse request body
        data = req.get_json()
        if not data:
            raise ValidationError("Request body is required")

        # Validate with Pydantic
        update_data = WorkspaceUpdate(**data)

        # Get Cosmos DB client
        cosmos_client = get_cosmos_client()
        if not cosmos_client:
            raise APIError("Database connection failed", 500)

        db = CosmosDBClient(
            connection_string="",
            database_name="architecture-platform"
        )

        # Update workspace
        updates = {k: v for k, v in update_data.model_dump().items() if v is not None}
        updated = await db.update_workspace(workspace_id, user_id, updates)

        if not updated:
            raise NotFoundError(f"Workspace {workspace_id} not found")

        return func.HttpResponse(
            body=Workspace(**updated).model_dump_json(),
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
        logger.exception(f"Error updating workspace: {e}")
        return func.HttpResponse(
            body='{"error": "Internal server error"}',
            status_code=500,
            mimetype="application/json"
        )


@router.route(route="workspaces/{workspace_id}", auth_level=func.AuthLevel.ANONYMOUS, methods=["DELETE"])
async def delete_workspace(req: func.HttpRequest) -> func.HttpResponse:
    """
    Delete a workspace.

    DELETE /api/workspaces/{workspace_id}

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

        # Delete workspace
        deleted = await db.delete_workspace(workspace_id, user_id)
        if not deleted:
            raise NotFoundError(f"Workspace {workspace_id} not found")

        return func.HttpResponse(status_code=204)

    except (ValidationError, NotFoundError, APIError) as e:
        return func.HttpResponse(
            body=e.to_dict(),
            status_code=e.status_code,
            mimetype="application/json"
        )
    except Exception as e:
        logger.exception(f"Error deleting workspace: {e}")
        return func.HttpResponse(
            body='{"error": "Internal server error"}',
            status_code=500,
            mimetype="application/json"
        )


@router.route(route="workspaces", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
async def list_workspaces(req: func.HttpRequest) -> func.HttpResponse:
    """
    List all workspaces for the current user.

    GET /api/workspaces

    Returns:
        List of workspaces (200)
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

        # Get Cosmos DB client
        cosmos_client = get_cosmos_client()
        if not cosmos_client:
            raise APIError("Database connection failed", 500)

        db = CosmosDBClient(
            connection_string="",
            database_name="architecture-platform"
        )

        # List workspaces
        workspaces = await db.list_workspaces(user_id)

        # Convert to Pydantic models
        result = [Workspace(**w).model_dump() for w in workspaces]

        return func.HttpResponse(
            body=func.json.dumps(result),
            status_code=200,
            mimetype="application/json"
        )

    except APIError as e:
        return func.HttpResponse(
            body=e.to_dict(),
            status_code=e.status_code,
            mimetype="application/json"
        )
    except Exception as e:
        logger.exception(f"Error listing workspaces: {e}")
        return func.HttpResponse(
            body='{"error": "Internal server error"}',
            status_code=500,
            mimetype="application/json"
        )
