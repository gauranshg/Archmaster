/**
 * Type Definitions Index
 *
 * Central export point for all type definitions.
 * Import types from this file for cleaner imports.
 */

// Diagram types
export type {
  Diagram,
  DiagramType,
  DiagramMetadata,
  DiagramStyles,
  LayoutConfig,
} from './diagram';

// C4 Model types
export type {
  C4Metadata,
  C4ElementMetadata,
  C4RelationshipMetadata,
} from './c4';

export {
  C4Level,
  C4ElementType,
  C4RelationshipType,
  C4Scope,
  DIAGRAM_TYPE_TO_C4_LEVEL,
  C4_LEVEL_TO_DIAGRAM_TYPE,
  C4_LEVEL_NAMES,
  C4_LEVEL_DESCRIPTIONS,
  C4_ELEMENT_TYPE_NAMES,
  getC4LevelFromDiagramType,
  isC4DiagramType,
  isC4Diagram,
  getC4Level,
  getC4LevelName,
  getC4LevelDescription,
  getC4DiagramTypes,
  getValidChildTypes,
} from './c4';

// Node types
export type {
  Node,
  NodeData,
  NodeStyle,
  NodeConstraints,
  Position,
  Size,
  Rect,
  FlowNode,
} from './node';

// Edge types
export type {
  Edge,
  EdgeData,
  EdgeStyle,
  EdgeType,
  EdgeRouting,
  EdgeLabelPosition,
  Marker,
  MarkerType,
  FlowEdge,
} from './edge';

// Template types
export type {
  Template,
  TemplateLibrary,
  TemplateCategory,
  TemplateCategoryDefinition,
  TemplateData,
  TemplateApplicationResult,
  TemplateFilter,
  BuiltInTemplate,
  TemplateVariable,
  TemplateVariableType,
} from './template';

// Workspace types
export type {
  Workspace,
  WorkspaceMember,
  WorkspaceSettings,
  WorkspaceSummary,
  CreateWorkspaceData,
  UpdateWorkspaceData,
  MemberInvitation,
  WorkspaceStats,
  MemberRole,
  Permission,
  RolePermissions,
} from './workspace';

// User types
export type {
  User,
  UserPreferences,
  UserProfile,
  UserSession,
  UserStats,
  AzureADUserInfo,
  AuthResponse,
  LoginRequest,
  UpdateUserData,
  UserActivity,
  UserRole,
} from './user';

// Common types
export type {
  Size as CommonSize,
  Position as CommonPosition,
  Rect as CommonRect,
  ValidationError,
  ValidationResult,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  FilterParams,
  SortOption,
  SelectOption,
  Theme,
  ViewMode,
  ExportFormat,
  ExportOptions,
  ImportOptions,
  FileUploadResult,
  ErrorResponse,
  SuccessResponse,
  LoadingState,
  SelectionState,
  HistoryState,
  ClipboardData,
} from './common';

// Re-export commonly used types at top level
export type { DiagramType as C4Level } from './diagram';
export type { NodeStyle as CSSStyle } from './node';
export type { EdgeStyle as LineStyle } from './edge';

// Architecture template types
export type {
  ArchitectureTemplate,
  ArchitectureTemplateCategory,
  ArchitectureTemplateCategoryInfo,
  ArchitectureTemplatePreview,
} from './architectureTemplate';
