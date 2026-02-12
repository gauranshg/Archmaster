/**
 * User Type Definitions
 *
 * Defines user entities and authentication types.
 */

import type { DiagramType } from './diagram';

/**
 * User roles
 */
export type UserRole = 'admin' | 'user';

/**
 * User entity
 */
export interface User {
  /** Unique identifier */
  id: string;

  /** Azure AD object ID */
  azureObjectId?: string;

  /** User name */
  name: string;

  /** Email address */
  email: string;

  /** Avatar URL */
  avatar?: string;

  /** Global role */
  globalRole: UserRole;

  /** Azure AD groups/roles */
  roles?: string[];

  /** User preferences */
  preferences?: UserPreferences;

  /** Workspace IDs this user belongs to */
  workspaceIds?: string[];

  /** Creation timestamp */
  createdAt: string;

  /** Last login timestamp */
  lastLoginAt?: string;

  /** Last update timestamp */
  updatedAt: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  /** Theme preference */
  theme?: 'light' | 'dark';

  /** Language code */
  language?: string;

  /** Editor font size */
  editorFontSize?: number;

  /** Editor tab size */
  editorTabSize?: number;

  /** Enable auto-save */
  autoSave?: boolean;

  /** Auto-save interval in seconds */
  autoSaveInterval?: number;

  /** Default diagram type */
  defaultDiagramType?: DiagramType;

  /** Keyboard shortcuts */
  shortcuts?: Record<string, string>;

  /** Show minimap */
  showMinimap?: boolean;

  /** Enable snap to grid */
  snapToGrid?: boolean;

  /** Grid size */
  gridSize?: number;

  /** Default view mode */
  defaultViewMode?: 'visual' | 'code' | 'split';

  /** Enable notifications */
  enableNotifications?: boolean;

  /** Email notifications */
  emailNotifications?: boolean;
}

/**
 * User profile (public information)
 */
export interface UserProfile {
  /** User ID */
  id: string;

  /** User name */
  name: string;

  /** Avatar URL */
  avatar?: string;

  /** User role */
  globalRole: UserRole;
}

/**
 * User session (authentication state)
 */
export interface UserSession {
  /** User entity */
  user: User;

  /** Authentication token */
  token?: string;

  /** Token expiration timestamp */
  tokenExpiresAt?: string;

  /** Whether session is authenticated */
  isAuthenticated: boolean;
}

/**
 * User statistics
 */
export interface UserStats {
  /** Total workspaces */
  totalWorkspaces: number;

  /** Total diagrams */
  totalDiagrams: number;

  /** Total templates created */
  totalTemplates: number;

  /** Storage used in bytes */
  storageUsed: number;

  /** Last activity timestamp */
  lastActivityAt: string;
}

/**
 * Azure AD user info (from Static Web Apps headers)
 */
export interface AzureADUserInfo {
  /** User ID */
  userId: string;

  /** User name */
  userName?: string;

  /** User email */
  userEmail?: string;

  /** User roles */
  userRoles?: string[];

  /** Authentication provider */
  identityProvider?: string;

  /** User details */
  userDetails?: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  /** User entity */
  user: User;

  /** Authentication token */
  token: string;

  /** Token expiration timestamp */
  expiresAt: string;
}

/**
 * Login request
 */
export interface LoginRequest {
  /** Email (optional - using Azure AD) */
  email?: string;

  /** Password (optional - using Azure AD) */
  password?: string;

  /** Azure AD token */
  azureToken?: string;
}

/**
 * User update data
 */
export interface UpdateUserData {
  /** User name */
  name?: string;

  /** Avatar URL */
  avatar?: string;

  /** User preferences */
  preferences?: Partial<UserPreferences>;
}

/**
 * User activity log
 */
export interface UserActivity {
  /** Activity ID */
  id: string;

  /** User ID */
  userId: string;

  /** Activity type */
  type: 'create' | 'update' | 'delete' | 'view' | 'share' | 'export' | 'import';

  /** Resource type */
  resourceType: 'diagram' | 'template' | 'workspace';

  /** Resource ID */
  resourceId: string;

  /** Activity description */
  description?: string;

  /** IP address */
  ipAddress?: string;

  /** User agent */
  userAgent?: string;

  /** Timestamp */
  timestamp: string;
}
