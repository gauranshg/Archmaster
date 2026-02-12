"""
Pydantic models for the Custom Architecture Platform.

This package contains all data models used throughout the application.
"""

from .diagram import (
    Node,
    Edge,
    Diagram,
    DiagramCreate,
    DiagramUpdate,
    DiagramType
)
from .workspace import (
    Workspace,
    WorkspaceCreate,
    WorkspaceUpdate
)
from .template import (
    Template,
    TemplateCreate,
    TemplateUpdate
)
from .user import (
    User,
    UserCreate,
    UserUpdate
)

__all__ = [
    # Diagram models
    "Node",
    "Edge",
    "Diagram",
    "DiagramCreate",
    "DiagramUpdate",
    "DiagramType",
    # Workspace models
    "Workspace",
    "WorkspaceCreate",
    "WorkspaceUpdate",
    # Template models
    "Template",
    "TemplateCreate",
    "TemplateUpdate",
    # User models
    "User",
    "UserCreate",
    "UserUpdate",
]
