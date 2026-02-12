"""
Template data models for the Custom Architecture Platform.

Defines reusable node and diagram templates.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from .diagram import Node, Edge, DiagramType


class Template(BaseModel):
    """A reusable template for nodes or diagrams."""
    id: str = Field(..., description="Unique template identifier")
    name: str = Field(..., min_length=1, max_length=200, description="Template name")
    type: str = Field(..., description="Template type: 'node' or 'diagram'")
    category: Optional[str] = Field(None, max_length=100, description="Template category")
    description: Optional[str] = Field(None, max_length=1000)
    ownerId: str = Field(..., description="User ID of the template owner")
    isPublic: bool = Field(default=False, description="Whether template is public")
    data: Dict[str, Any] = Field(
        ...,
        description="Template data (node schema or diagram structure)"
    )
    thumbnail: Optional[str] = Field(None, description="Base64 thumbnail image")
    tags: List[str] = Field(default_factory=list, description="Template tags")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class TemplateCreate(BaseModel):
    """Request model for creating a new template."""
    name: str = Field(..., min_length=1, max_length=200)
    type: str = Field(..., description="Template type: 'node' or 'diagram'")
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    isPublic: bool = Field(default=False)
    data: Dict[str, Any] = Field(...)
    thumbnail: Optional[str] = Field(None)
    tags: List[str] = Field(default_factory=list)


class TemplateUpdate(BaseModel):
    """Request model for updating an existing template."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    isPublic: Optional[bool] = None
    data: Optional[Dict[str, Any]] = None
    thumbnail: Optional[str] = Field(None)
    tags: Optional[List[str]] = None

    class Config:
        extra = 'allow'
