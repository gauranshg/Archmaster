/**
 * Common Type Definitions
 *
 * Shared types used across multiple modules.
 */

/**
 * Size in 2D space
 */
export interface Size {
  /** Width in pixels */
  width: number;

  /** Height in pixels */
  height: number;
}

/**
 * Position in 2D space
 */
export interface Position {
  /** X coordinate */
  x: number;

  /** Y coordinate */
  y: number;
}

/**
 * Rectangle area
 */
export interface Rect {
  /** X coordinate */
  x: number;

  /** Y coordinate */
  y: number;

  /** Width in pixels */
  width: number;

  /** Height in pixels */
  height: number;
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Field with error */
  field: string;

  /** Error message */
  message: string;

  /** Error code */
  code?: string;

  /** Invalid value */
  value?: unknown;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;

  /** Validation errors */
  errors: ValidationError[];

  /** Validation warnings */
  warnings?: ValidationError[];
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;

  /** Error message (if failed) */
  error?: string;

  /** HTTP status code */
  status: number;

  /** Success flag */
  success: boolean;

  /** Response message */
  message?: string;

  /** Response metadata */
  meta?: Record<string, unknown>;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  /** Data items */
  items: T[];

  /** Total number of items */
  total: number;

  /** Current page number */
  page: number;

  /** Page size */
  pageSize: number;

  /** Total number of pages */
  totalPages: number;

  /** Whether there's a next page */
  hasNext: boolean;

  /** Whether there's a previous page */
  hasPrev: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page?: number;

  /** Page size */
  pageSize?: number;

  /** Sort field */
  sortBy?: string;

  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter parameters
 */
export interface FilterParams {
  /** Search query */
  search?: string;

  /** Filter by tags */
  tags?: string[];

  /** Filter by type */
  type?: string;

  /** Filter by date range */
  dateFrom?: string;
  dateTo?: string;

  /** Custom filters */
  filters?: Record<string, unknown>;
}

/**
 * Sort option
 */
export interface SortOption {
  /** Sort field */
  field: string;

  /** Sort label */
  label: string;

  /** Sort direction */
  direction?: 'asc' | 'desc';
}

/**
 * Select option (for dropdowns, etc.)
 */
export interface SelectOption<T = string> {
  /** Option value */
  value: T;

  /** Option label */
  label: string;

  /** Whether option is disabled */
  disabled?: boolean;

  /** Optional icon */
  icon?: string;

  /** Optional data */
  data?: Record<string, unknown>;
}

/**
 * Theme type
 */
export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'high-contrast';

/**
 * View mode
 */
export type ViewMode = 'visual' | 'code' | 'split';

/**
 * Export format
 */
export type ExportFormat = 'png' | 'svg' | 'json' | 'yaml' | 'pdf';

/**
 * Export options
 */
export interface ExportOptions {
  /** Export format */
  format: ExportFormat;

  /** Background color (for images) */
  backgroundColor?: string;

  /** Scale factor (for images) */
  scale?: number;

  /** Quality (0-1, for JPEG) */
  quality?: number;

  /** Include background (for SVG) */
  includeBackground?: boolean;

  /** Include styles */
  includeStyles?: boolean;

  /** Output filename (without extension) */
  filename?: string;
}

/**
 * Import options
 */
export interface ImportOptions {
  /** Import format */
  format: 'json' | 'yaml';

  /** Whether to overwrite existing diagram */
  overwrite?: boolean;

  /** Whether to validate before import */
  validate?: boolean;

  /** New diagram name (optional) */
  diagramName?: string;
}

/**
 * File upload result
 */
export interface FileUploadResult {
  /** Uploaded file URL */
  url: string;

  /** File name */
  name: string;

  /** File size in bytes */
  size: number;

  /** File MIME type */
  type: string;

  /** Upload timestamp */
  uploadedAt: string;
}

/**
 * Error response
 */
export interface ErrorResponse {
  /** Error message */
  message: string;

  /** Error code */
  code?: string;

  /** Error details */
  details?: Record<string, unknown>;

  /** Stack trace (development only) */
  stack?: string;

  /** HTTP status code */
  status?: number;
}

/**
 * Success response
 */
export interface SuccessResponse<T = unknown> {
  /** Response data */
  data: T;

  /** Success message */
  message?: string;

  /** Response metadata */
  meta?: Record<string, unknown>;
}

/**
 * Loading state
 */
export interface LoadingState {
  /** Whether data is loading */
  isLoading: boolean;

  /** Whether initial load is complete */
  isInitialized: boolean;

  /** Error if loading failed */
  error?: string;

  /** Loading progress (0-100) */
  progress?: number;
}

/**
 * Selection state
 */
export interface SelectionState<T = string> {
  /** Selected items */
  selected: T[];

  /** Whether all items are selected */
  allSelected: boolean;

  /** Partial selection flag */
  someSelected: boolean;
}

/**
 * History state (for undo/redo)
 */
export interface HistoryState<T> {
  /** History stack */
  past: T[];

  /** Current state */
  present: T;

  /** Future stack (for redo) */
  future: T[];
}

/**
 * Clipboard data
 */
export interface ClipboardData<T = unknown> {
  /** Clipboard items */
  items: T[];

  /** Copy timestamp */
  copiedAt: string;

  /** Source diagram ID */
  sourceDiagramId?: string;
}
