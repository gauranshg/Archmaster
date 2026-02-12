"""
Cosmos DB client wrapper for the Custom Architecture Platform.

Provides async operations for diagrams, workspaces, templates, and users.
"""

import logging
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from azure.cosmos import CosmosClient, PartitionKey
from azure.cosmos.exceptions import CosmosResourceNotFoundError, CosmosHttpResponseError


logger = logging.getLogger(__name__)


class CosmosDBClient:
    """
    Azure Cosmos DB client for managing diagram platform data.

    Uses userId as partition key for all collections to ensure proper
    multi-tenant isolation and efficient queries.
    """

    def __init__(self, connection_string: str, database_name: str = "architecture-platform"):
        """
        Initialize Cosmos DB client.

        Args:
            connection_string: Cosmos DB connection string
            database_name: Database name (default: architecture-platform)
        """
        self.client = CosmosClient.from_connection_string(connection_string)
        self.database_name = database_name
        self.database = self.client.get_database_client(database_name)

        # Container references
        self._diagrams_container = None
        self._workspaces_container = None
        self._templates_container = None
        self._users_container = None

    def _get_container(self, container_name: str, partition_key_path: str = "/userId"):
        """
        Get or create a container.

        Args:
            container_name: Name of the container
            partition_key_path: Partition key path (default: /userId)
        """
        try:
            database = self.client.get_database_client(self.database_name)
            container = database.get_container_client(container_name)

            # Test if container exists
            container.read()
            return container
        except CosmosResourceNotFoundError:
            # Create container if it doesn't exist
            database = self.client.create_database_if_not_exists(id=self.database_name)
            container = database.create_container_if_not_exists(
                id=container_name,
                partition_key=PartitionKey(path=partition_key_path),
                offer_throughput=400
            )
            logger.info(f"Created container: {container_name}")
            return container

    @property
    def diagrams(self):
        """Get diagrams container."""
        if not self._diagrams_container:
            self._diagrams_container = self._get_container("diagrams", partition_key_path="/workspaceId")
        return self._diagrams_container

    @property
    def workspaces(self):
        """Get workspaces container."""
        if not self._workspaces_container:
            self._workspaces_container = self._get_container("workspaces", partition_key_path="/ownerId")
        return self._workspaces_container

    @property
    def templates(self):
        """Get templates container."""
        if not self._templates_container:
            self._templates_container = self._get_container("templates", partition_key_path="/ownerId")
        return self._templates_container

    @property
    def users(self):
        """Get users container."""
        if not self._users_container:
            self._users_container = self._get_container("users", partition_key_path="/id")
        return self._users_container

    # Diagram Operations

    async def get_diagram(self, diagram_id: str, workspace_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a diagram by ID.

        Args:
            diagram_id: Diagram ID
            workspace_id: Workspace ID (partition key)

        Returns:
            Diagram data or None if not found
        """
        try:
            item = self.diagrams.read_item(item=diagram_id, partition_key=workspace_id)
            return item
        except CosmosResourceNotFoundError:
            return None
        except Exception as e:
            logger.error(f"Error getting diagram {diagram_id}: {e}")
            raise

    async def create_diagram(self, diagram: Dict[str, Any], workspace_id: str) -> Dict[str, Any]:
        """
        Create a new diagram.

        Args:
            diagram: Diagram data
            workspace_id: Workspace ID (partition key)

        Returns:
            Created diagram with generated ID
        """
        try:
            # Ensure workspaceId is set
            diagram['workspaceId'] = workspace_id

            # Generate ID if not provided
            if 'id' not in diagram:
                diagram['id'] = str(uuid.uuid4())

            # Set timestamps
            now = datetime.utcnow().isoformat()
            diagram['createdAt'] = now
            diagram['updatedAt'] = now

            if 'metadata' not in diagram:
                diagram['metadata'] = {}
            diagram['metadata']['createdAt'] = now
            diagram['metadata']['updatedAt'] = now

            created = self.diagrams.create_item(body=diagram)
            logger.info(f"Created diagram: {created['id']}")
            return created
        except Exception as e:
            logger.error(f"Error creating diagram: {e}")
            raise

    async def update_diagram(
        self,
        diagram_id: str,
        workspace_id: str,
        updates: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Update a diagram.

        Args:
            diagram_id: Diagram ID
            workspace_id: Workspace ID (partition key)
            updates: Fields to update

        Returns:
            Updated diagram or None if not found
        """
        try:
            # Get existing diagram
            existing = await self.get_diagram(diagram_id, workspace_id)
            if not existing:
                return None

            # Merge updates
            merged = {**existing, **updates, 'id': diagram_id, 'workspaceId': workspace_id}

            # Update timestamp
            now = datetime.utcnow().isoformat()
            merged['updatedAt'] = now
            if 'metadata' in merged:
                merged['metadata']['updatedAt'] = now

            # Replace item
            updated = self.diagrams.replace_item(item=diagram_id, partition_key=workspace_id, body=merged)
            logger.info(f"Updated diagram: {diagram_id}")
            return updated
        except Exception as e:
            logger.error(f"Error updating diagram {diagram_id}: {e}")
            raise

    async def delete_diagram(self, diagram_id: str, workspace_id: str) -> bool:
        """
        Delete a diagram.

        Args:
            diagram_id: Diagram ID
            workspace_id: Workspace ID (partition key)

        Returns:
            True if deleted, False if not found
        """
        try:
            self.diagrams.delete_item(item=diagram_id, partition_key=workspace_id)
            logger.info(f"Deleted diagram: {diagram_id}")
            return True
        except CosmosResourceNotFoundError:
            return False
        except Exception as e:
            logger.error(f"Error deleting diagram {diagram_id}: {e}")
            raise

    async def list_diagrams(self, workspace_id: str) -> List[Dict[str, Any]]:
        """
        List all diagrams in a workspace.

        Args:
            workspace_id: Workspace ID (partition key)

        Returns:
            List of diagrams
        """
        try:
            query = "SELECT * FROM c WHERE c.workspaceId = @workspaceId"
            params = [{"name": "@workspaceId", "value": workspace_id}]

            items = self.diagrams.query_items(
                query=query,
                parameters=params,
                partition_key=workspace_id
            )

            return list(items)
        except Exception as e:
            logger.error(f"Error listing diagrams for workspace {workspace_id}: {e}")
            raise

    # Workspace Operations

    async def get_workspace(self, workspace_id: str, owner_id: str) -> Optional[Dict[str, Any]]:
        """Get a workspace by ID."""
        try:
            item = self.workspaces.read_item(item=workspace_id, partition_key=owner_id)
            return item
        except CosmosResourceNotFoundError:
            return None
        except Exception as e:
            logger.error(f"Error getting workspace {workspace_id}: {e}")
            raise

    async def create_workspace(self, workspace: Dict[str, Any], owner_id: str) -> Dict[str, Any]:
        """Create a new workspace."""
        try:
            workspace['ownerId'] = owner_id
            if 'id' not in workspace:
                workspace['id'] = str(uuid.uuid4())

            now = datetime.utcnow().isoformat()
            workspace['createdAt'] = now
            workspace['updatedAt'] = now

            created = self.workspaces.create_item(body=workspace)
            logger.info(f"Created workspace: {created['id']}")
            return created
        except Exception as e:
            logger.error(f"Error creating workspace: {e}")
            raise

    async def update_workspace(
        self,
        workspace_id: str,
        owner_id: str,
        updates: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Update a workspace."""
        try:
            existing = await self.get_workspace(workspace_id, owner_id)
            if not existing:
                return None

            merged = {**existing, **updates, 'id': workspace_id, 'ownerId': owner_id}
            merged['updatedAt'] = datetime.utcnow().isoformat()

            updated = self.workspaces.replace_item(item=workspace_id, partition_key=owner_id, body=merged)
            logger.info(f"Updated workspace: {workspace_id}")
            return updated
        except Exception as e:
            logger.error(f"Error updating workspace {workspace_id}: {e}")
            raise

    async def delete_workspace(self, workspace_id: str, owner_id: str) -> bool:
        """Delete a workspace."""
        try:
            self.workspaces.delete_item(item=workspace_id, partition_key=owner_id)
            logger.info(f"Deleted workspace: {workspace_id}")
            return True
        except CosmosResourceNotFoundError:
            return False
        except Exception as e:
            logger.error(f"Error deleting workspace {workspace_id}: {e}")
            raise

    async def list_workspaces(self, owner_id: str) -> List[Dict[str, Any]]:
        """List all workspaces for a user."""
        try:
            query = "SELECT * FROM c WHERE c.ownerId = @ownerId"
            params = [{"name": "@ownerId", "value": owner_id}]

            items = self.workspaces.query_items(
                query=query,
                parameters=params,
                partition_key=owner_id
            )

            return list(items)
        except Exception as e:
            logger.error(f"Error listing workspaces for user {owner_id}: {e}")
            raise

    # Template Operations

    async def get_template(self, template_id: str, owner_id: str) -> Optional[Dict[str, Any]]:
        """Get a template by ID."""
        try:
            item = self.templates.read_item(item=template_id, partition_key=owner_id)
            return item
        except CosmosResourceNotFoundError:
            return None
        except Exception as e:
            logger.error(f"Error getting template {template_id}: {e}")
            raise

    async def create_template(self, template: Dict[str, Any], owner_id: str) -> Dict[str, Any]:
        """Create a new template."""
        try:
            template['ownerId'] = owner_id
            if 'id' not in template:
                template['id'] = str(uuid.uuid4())

            now = datetime.utcnow().isoformat()
            template['createdAt'] = now
            template['updatedAt'] = now

            created = self.templates.create_item(body=template)
            logger.info(f"Created template: {created['id']}")
            return created
        except Exception as e:
            logger.error(f"Error creating template: {e}")
            raise

    async def list_templates(self, owner_id: str, include_public: bool = True) -> List[Dict[str, Any]]:
        """List templates (user's own + public templates)."""
        try:
            if include_public:
                query = "SELECT * FROM c WHERE c.ownerId = @ownerId OR c.isPublic = true"
            else:
                query = "SELECT * FROM c WHERE c.ownerId = @ownerId"

            params = [{"name": "@ownerId", "value": owner_id}]

            items = self.templates.query_items(
                query=query,
                parameters=params,
                partition_key=owner_id
            )

            return list(items)
        except Exception as e:
            logger.error(f"Error listing templates for user {owner_id}: {e}")
            raise

    # User Operations

    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a user by ID."""
        try:
            item = self.users.read_item(item=user_id, partition_key=user_id)
            return item
        except CosmosResourceNotFoundError:
            return None
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            raise

    async def create_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user."""
        try:
            if 'id' not in user:
                user['id'] = str(uuid.uuid4())

            now = datetime.utcnow().isoformat()
            user['createdAt'] = now
            user['updatedAt'] = now

            created = self.users.create_item(body=user)
            logger.info(f"Created user: {created['id']}")
            return created
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise

    async def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a user."""
        try:
            existing = await self.get_user(user_id)
            if not existing:
                return None

            merged = {**existing, **updates, 'id': user_id}
            merged['updatedAt'] = datetime.utcnow().isoformat()

            updated = self.users.replace_item(item=user_id, partition_key=user_id, body=merged)
            logger.info(f"Updated user: {user_id}")
            return updated
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {e}")
            raise
