/**
 * Validator Types
 *
 * Common types for validation results and errors.
 */

export interface ValidationError {
  /** Error message */
  message: string;

  /** Line number (1-based) */
  line?: number;

  /** Column number (1-based) */
  column?: number;

  /** Error code */
  code?: string;
}

export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;

  /** Array of validation errors */
  errors: ValidationError[];

  /** Parsed data (if valid) */
  data?: unknown;
}
