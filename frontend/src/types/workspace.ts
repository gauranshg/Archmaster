/**
 * Workspace Type Definitions
 *
 * Defines workspace entities for multi-user collaboration.
 */

import type { DiagramType, LayoutConfig } from './diagram';

/**
 * Workspace member role
 */
export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';

/**
 * Permission types
 */
export type Permission =
  | 'view'            // View workspace and diagrams
  | 'edit'            // Edit diagrams
  | 'delete'          // Delete diagrams
  | 'comment'         // Add comments
  | 'share'           // Share diagrams
  | 'manage_members'; // Manage workspace members

/**
 * Workspace entity
 */
export interface Workspace {
  /** Unique identifier */
  id: string;

  /** Workspace name */
  name: string;

  /** Workspace description */
  description?: string;

  /** User who owns it */
  ownerId: string;

  /** Workspace members */
  members?: WorkspaceMember[];

  /** Workspace settings */
  settings?: WorkspaceSettings;

  /** Default theme */
  defaultTheme?: string;

  /** Diagram IDs in this workspace */
  diagramIds?: string[];

  /** Whether this is the default workspace */
  isDefault?: boolean;

  /** Creation timestamp */
  createdAt: string;

  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Workspace member
 */
export interface WorkspaceMember {
  /** User ID */
  userId: string;

  /** Member role */
  role: MemberRole;

  /** User permissions */
  permissions?: Permission[];

  /** Joined timestamp */
  joinedAt?: string;
}

/**
 * Workspace settings
 */
export interface WorkspaceSettings {
  /** Default diagram type */
  defaultDiagramType?: DiagramType;

  /** Enable version control */
  enableVersionControl?: boolean;

  /** Enable comments */
  enableComments?: boolean;

  /** Default layout configuration */
  defaultLayout?: LayoutConfig;

  /** Enable auto-save */
  enableAutoSave?: boolean;

  /** Auto-save interval in seconds */
  autoSaveInterval?: number;

  /** Enable sharing */
  enableSharing?: boolean;
}

/**
 * Workspace summary (for list views)
 */
export interface WorkspaceSummary {
  /** Workspace ID */
  id: string;

  /** Workspace name */
  name: string;

  /** Owner ID */
  ownerId: string;

  /** Owner name */
  ownerName?: string;

  /** Number of diagrams */
  diagramCount: number;

  /** Number of members */
  memberCount: number;

  /** Whether user is owner */
  isOwner: boolean;

  /** User role */
  userRole?: MemberRole;

  /** Creation timestamp */
  createdAt: string;

  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Workspace creation data
 */
export interface CreateWorkspaceData {
  /** Workspace name */
  name: string;

  /** Workspace description */
  description?: string;

  /** Workspace settings */
  settings?: WorkspaceSettings;
}

/**
 * Workspace update data
 */
export interface UpdateWorkspaceData {
  /** Workspace name */
  name?: string;

  /** Workspace description */
  description?: string;

  /** Workspace settings */
  settings?: WorkspaceSettings;
}

/**
 * Member invitation
 */
export interface MemberInvitation {
  /** Invitation ID */
  id: string;

  /** Workspace ID */
  workspaceId: string;

  /** Invitee email */
  email: string;

  /** Role to assign */
  role: MemberRole;

  /** Inviter user ID */
  inviterId: string;

  /** Invitation token */
  token: string;

  /** Expiration timestamp */
  expiresAt: string;

  /** Whether invitation has been accepted */
  accepted: boolean;

  /** Creation timestamp */
  createdAt: string;
}

/**
 * Workspace statistics
 */
export interface WorkspaceStats {
  /** Total diagrams */
  totalDiagrams: number;

  /** Total members */
  totalMembers: number;

  /** Storage used in bytes */
  storageUsed: number;

  /** Last activity timestamp */
  lastActivityAt: string;

  /** Diagrams by type */
  diagramsByType: Record<DiagramType, number>;
}

/**
 * Role permissions mapping
 */
export const RolePermissions: Record<MemberRole, Permission[]> = {
  owner: ['view', 'edit', 'delete', 'comment', 'share', 'manage_members'],
  admin: ['view', 'edit', 'delete', 'comment', 'share', 'manage_members'],
  editor: ['view', 'edit', 'comment'],
  viewer: ['view']
};
