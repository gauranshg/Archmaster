"""
User data models for the Custom Architecture Platform.

Defines user accounts and preferences.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User roles for access control."""
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"


class User(BaseModel):
    """A user account in the platform."""
    id: str = Field(..., description="Unique user identifier (Azure AD object ID)")
    email: EmailStr = Field(..., description="User email address")
    displayName: str = Field(..., min_length=1, max_length=200, description="User display name")
    role: UserRole = Field(default=UserRole.EDITOR, description="User role")
    preferences: Dict[str, Any] = Field(
        default_factory=dict,
        description="User preferences (theme, default settings, etc.)"
    )
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    lastLoginAt: Optional[datetime] = None


class UserCreate(BaseModel):
    """Request model for creating a new user."""
    id: str = Field(..., description="Azure AD object ID")
    email: EmailStr
    displayName: str = Field(..., min_length=1, max_length=200)
    role: UserRole = Field(default=UserRole.EDITOR)
    preferences: Dict[str, Any] = Field(default_factory=dict)


class UserUpdate(BaseModel):
    """Request model for updating an existing user."""
    displayName: Optional[str] = Field(None, min_length=1, max_length=200)
    role: Optional[UserRole] = None
    preferences: Optional[Dict[str, Any]] = None
    lastLoginAt: Optional[datetime] = None

    class Config:
        extra = 'allow'
