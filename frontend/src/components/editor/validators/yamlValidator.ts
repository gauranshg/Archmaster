/**
 * YAML Validator
 *
 * Validates YAML syntax and structure for Monaco Editor.
 * Provides error markers with line and column information.
 */

import yaml, { YAMLException } from 'js-yaml';
import type { ValidationError, ValidationResult } from './types';

/**
 * Validates YAML string
 *
 * @param yamlString - YAML string to validate
 * @returns Validation result with errors
 */
export function validateYaml(yamlString: string): ValidationResult {
  const errors: ValidationError[] = [];

  try {
    // Try to load YAML
    const data = yaml.load(yamlString);

    // Basic type validation
    if (!data || typeof data !== 'object') {
      errors.push({
        message: 'YAML must parse to an object',
        line: 1,
        column: 1,
        code: 'INVALID_TYPE',
      });
      return { valid: false, errors };
    }

    // Validate required fields for diagram
    const requiredFields = ['id', 'name', 'type', 'workspaceId', 'nodes', 'edges', 'metadata'];
    requiredFields.forEach((field) => {
      if (!(field in data)) {
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
      data: errors.length === 0 ? data : undefined,
    };
  } catch (error) {
    // YAML parse error with location information
    if (error instanceof YAMLException) {
      errors.push({
        message: error.message,
        line: error.mark?.line ? error.mark.line + 1 : 1,
        column: error.mark?.column || 1,
        code: 'SYNTAX_ERROR',
      });
    } else {
      errors.push({
        message: error instanceof Error ? error.message : 'Unknown YAML error',
        line: 1,
        column: 1,
        code: 'PARSE_ERROR',
      });
    }

    return { valid: false, errors };
  }
}
