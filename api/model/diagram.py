"""
Diagram data models for the Custom Architecture Platform.

Defines the core data structures for creating, updating, and managing
architecture diagrams with nodes, edges, and custom styling.
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class DiagramType(str, Enum):
    """Supported diagram types based on C4 model."""
    SYSTEM_CONTEXT = "system-context"
    CONTAINER = "container"
    COMPONENT = "component"
    CODE = "code"
    GENERIC = "generic"


class Position(BaseModel):
    """Node position on the canvas."""
    x: float = Field(..., ge=0, description="X coordinate in pixels")
    y: float = Field(..., ge=0, description="Y coordinate in pixels")


class NodeData(BaseModel):
    """Data associated with a diagram node."""
    label: str = Field(..., min_length=1, max_length=200, description="Node label")
    htmlContent: str = Field(
        default="",
        description="HTML content for the node (will be sanitized)"
    )
    cssClass: Optional[str] = Field(
        None,
        max_length=100,
        description="Custom CSS class for styling"
    )
    icon: Optional[str] = Field(None, description="Icon name or URL")
    width: Optional[int] = Field(
        None,
        ge=50,
        le=1000,
        description="Node width in pixels"
    )
    height: Optional[int] = Field(
        None,
        ge=50,
        le=1000,
        description="Node height in pixels"
    )
    description: Optional[str] = Field(None, max_length=1000)
    technology: Optional[str] = Field(None, max_length=200)

    @field_validator('htmlContent')
    @classmethod
    def validate_html_content(cls, v: str) -> str:
        """Validate HTML content (actual sanitization happens in service layer)."""
        if len(v) > 10000:
            raise ValueError("HTML content too long (max 10000 characters)")
        return v


class Node(BaseModel):
    """A node in the diagram representing a system component."""
    id: str = Field(..., pattern=r'^[a-zA-Z0-9-_]+$', description="Unique node identifier")
    position: Position
    data: NodeData
    type: Optional[str] = Field(
        "default",
        description="Node type for custom rendering"
    )
    style: Optional[Dict[str, Any]] = Field(
        None,
        description="Custom React Flow styles"
    )
    className: Optional[str] = Field(None, max_length=100)


class EdgeData(BaseModel):
    """Data associated with a diagram edge."""
    label: Optional[str] = Field(None, max_length=200)
    technology: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)


class Edge(BaseModel):
    """An edge in the diagram representing a relationship between nodes."""
    id: str = Field(..., pattern=r'^[a-zA-Z0-9-_]+$', description="Unique edge identifier")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    type: Optional[str] = Field(
        "default",
        description="Edge type for custom rendering"
    )
    data: Optional[EdgeData] = None
    animated: bool = Field(default=False)
    style: Optional[Dict[str, Any]] = Field(None, description="Custom React Flow styles")
    label: Optional[str] = Field(None, max_length=200)
    markerEnd: Optional[Dict[str, Any]] = Field(None)


class DiagramMetadata(BaseModel):
    """Metadata about the diagram."""
    version: int = Field(default=1, ge=1)
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    createdBy: Optional[str] = None
    lastModifiedBy: Optional[str] = None


class Diagram(BaseModel):
    """A complete architecture diagram."""
    id: str = Field(..., description="Unique diagram identifier")
    name: str = Field(..., min_length=1, max_length=200, description="Diagram name")
    type: DiagramType = Field(default=DiagramType.GENERIC)
    nodes: List[Node] = Field(default_factory=list)
    edges: List[Edge] = Field(default_factory=list)
    customCSS: Optional[str] = Field(
        None,
        max_length=50000,
        description="Custom CSS for the diagram (will be sanitized)"
    )
    workspaceId: str = Field(..., description="Parent workspace ID")
    parentId: Optional[str] = Field(
        None,
        description="Parent diagram ID for drill-down navigation"
    )
    metadata: DiagramMetadata = Field(default_factory=DiagramMetadata)
    description: Optional[str] = Field(None, max_length=1000)

    @field_validator('nodes')
    @classmethod
    def validate_unique_node_ids(cls, v: List[Node]) -> List[Node]:
        """Ensure all node IDs are unique within a diagram."""
        node_ids = [node.id for node in v]
        if len(node_ids) != len(set(node_ids)):
            raise ValueError("Duplicate node IDs detected")
        return v

    @field_validator('edges')
    @classmethod
    def validate_unique_edge_ids(cls, v: List[Edge]) -> List[Edge]:
        """Ensure all edge IDs are unique within a diagram."""
        edge_ids = [edge.id for edge in v]
        if len(edge_ids) != len(set(edge_ids)):
            raise ValueError("Duplicate edge IDs detected")
        return v


class DiagramCreate(BaseModel):
    """Request model for creating a new diagram."""
    name: str = Field(..., min_length=1, max_length=200)
    type: DiagramType = Field(default=DiagramType.GENERIC)
    nodes: List[Node] = Field(default_factory=list)
    edges: List[Edge] = Field(default_factory=list)
    customCSS: Optional[str] = Field(None, max_length=50000)
    workspaceId: str
    parentId: Optional[str] = None
    description: Optional[str] = Field(None, max_length=1000)


class DiagramUpdate(BaseModel):
    """Request model for updating an existing diagram."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[DiagramType] = None
    nodes: Optional[List[Node]] = None
    edges: Optional[List[Edge]] = None
    customCSS: Optional[str] = Field(None, max_length=50000)
    description: Optional[str] = Field(None, max_length=1000)

    class Config:
        # Allow partial updates
        extra = 'allow'
