/**
 * JSON Validator
 *
 * Validates JSON syntax and structure for Monaco Editor.
 * Provides error markers with line and column information.
 */

import type { ValidationError, ValidationResult } from './types';

/**
 * Validates JSON string
 *
 * @param jsonString - JSON string to validate
 * @returns Validation result with errors
 */
export function validateJson(jsonString: string): ValidationResult {
  const errors: ValidationError[] = [];

  try {
    // Try to parse JSON
    const parsed = JSON.parse(jsonString);

    // Basic structure validation
    if (!parsed || typeof parsed !== 'object') {
      errors.push({
        message: 'JSON must parse to an object',
        line: 1,
        column: 1,
        code: 'INVALID_TYPE',
      });
      return { valid: false, errors };
    }

    // Validate required fields for diagram
    const requiredFields = ['id', 'name', 'type', 'workspaceId', 'nodes', 'edges', 'metadata'];
    requiredFields.forEach((field) => {
      if (!(field in parsed)) {
        errors.push({
          message: `Missing required field: ${field}`,
          line: 1,
          column: 1,
          code: 'MISSING_FIELD',
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      data: errors.length === 0 ? parsed : undefined,
    };
  } catch (error) {
    // Parse error with location information
    if (error instanceof SyntaxError) {
      const parseError = parseJsonError(error.message, jsonString);
      errors.push(parseError);
    } else {
      errors.push({
        message: error instanceof Error ? error.message : 'Unknown JSON error',
        line: 1,
        column: 1,
        code: 'PARSE_ERROR',
      });
    }

    return { valid: false, errors };
  }
}

/**
 * Parses JSON syntax error message to extract line and column
 *
 * @param errorMessage - Error message from JSON.parse
 * @param jsonString - Original JSON string
 * @returns ValidationError with location
 */
function parseJsonError(errorMessage: string, jsonString: string): ValidationError {
  // Try to extract position from error message
  // Common formats: "Unexpected token at position 10", "Expected property name at 15:20"
  const positionMatch = errorMessage.match(/position (\d+)/);
  const lineColumnMatch = errorMessage.match(/at (\d+):(\d+)/);

  if (lineColumnMatch) {
    const line = parseInt(lineColumnMatch[1], 10);
    const column = parseInt(lineColumnMatch[2], 10);
    return {
      message: errorMessage,
      line,
      column,
      code: 'SYNTAX_ERROR',
    };
  }

  if (positionMatch) {
    const position = parseInt(positionMatch[1], 10);
    const { line, column } = getPositionInfo(jsonString, position);
    return {
      message: errorMessage,
      line,
      column,
      code: 'SYNTAX_ERROR',
    };
  }

  // Fallback: search for common error patterns
  return {
    message: errorMessage,
    line: 1,
    column: 1,
    code: 'SYNTAX_ERROR',
  };
}

/**
 * Converts character position to line and column
 *
 * @param text - Source text
 * @param position - Character position (0-based)
 * @returns Line and column (1-based)
 */
function getPositionInfo(text: string, position: number): { line: number; column: number } {
  const lines = text.substring(0, position).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}
