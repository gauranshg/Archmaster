"""
Workspace data models for the Custom Architecture Platform.

Defines workspaces which act as containers for related diagrams.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class Workspace(BaseModel):
    """A workspace containing related diagrams."""
    id: str = Field(..., description="Unique workspace identifier")
    name: str = Field(..., min_length=1, max_length=200, description="Workspace name")
    description: Optional[str] = Field(None, max_length=1000)
    ownerId: str = Field(..., description="User ID of the workspace owner")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    settings: Optional[dict] = Field(
        default_factory=dict,
        description="Workspace-specific settings"
    )


class WorkspaceCreate(BaseModel):
    """Request model for creating a new workspace."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    settings: Optional[dict] = Field(default_factory=dict)


class WorkspaceUpdate(BaseModel):
    """Request model for updating an existing workspace."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    settings: Optional[dict] = None

    class Config:
        # Allow partial updates
        extra = 'allow'
