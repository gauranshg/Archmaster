/**
 * Template Variables Service
 *
 * Utilities for working with template variables, validation,
 * and merging defaults with user values.
 *
 * Default values are now extracted from Jinja templates
 * using jinjaDefaultsParser.
 */

import type { TemplateVariable, TemplateVariableType } from '@/types/template';
import { parseJinjaDefaults, extractVariableNames as extractJinjaVariableNames } from '@/services/jinja/jinjaDefaultsParser';

/**
 * Validate a template variable value
 */
export function validateVariableValue(
  variable: TemplateVariable,
  value: any
): { valid: boolean; error?: string } {
  // Check required
  if (variable.required && (value === undefined || value === null || value === '')) {
    return { valid: false, error: `${variable.label} is required` };
  }

  // Skip validation if empty and not required
  if (!variable.required && (value === undefined || value === null || value === '')) {
    return { valid: true };
  }

  // Type-specific validation
  switch (variable.type) {
    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return { valid: false, error: `${variable.label} must be a number` };
      }
      if (variable.min !== undefined && value < variable.min) {
        return { valid: false, error: `${variable.label} must be at least ${variable.min}` };
      }
      if (variable.max !== undefined && value > variable.max) {
        return { valid: false, error: `${variable.label} must be at most ${variable.max}` };
      }
      break;

    case 'text':
    case 'textarea':
    case 'code':
      if (typeof value !== 'string') {
        return { valid: false, error: `${variable.label} must be text` };
      }
      if (variable.pattern) {
        const regex = new RegExp(variable.pattern);
        if (!regex.test(value)) {
          return { valid: false, error: `${variable.label} format is invalid` };
        }
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        return { valid: false, error: `${variable.label} must be true or false` };
      }
      break;

    case 'select':
      if (variable.options) {
        const validValues = variable.options.map(opt => opt.value);
        if (!validValues.includes(value)) {
          return { valid: false, error: `${variable.label} must be one of the provided options` };
        }
      }
      break;

    case 'color':
      if (typeof value !== 'string') {
        return { valid: false, error: `${variable.label} must be a color value` };
      }
      // Basic color validation (hex, rgb, rgba, color name)
      const colorRegex = /^(#([0-9A-Fa-f]{3}){1,2}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|[a-z]+)$/i;
      if (!colorRegex.test(value)) {
        return { valid: false, error: `${variable.label} must be a valid color` };
      }
      break;

    case 'icon':
      if (typeof value !== 'string') {
        return { valid: false, error: `${variable.label} must be text (emoji or icon name)` };
      }
      break;
  }

  return { valid: true };
}

/**
 * Merge template default values with user-provided values
 */
export function mergeTemplateValues(
  defaults: Record<string, any>,
  userValues: Record<string, any>
): Record<string, any> {
  return {
    ...defaults,
    ...userValues
  };
}

/**
 * Get effective value for a variable (user value or default from Jinja template)
 *
 * @param variable - The template variable definition
 * @param userValues - User-provided values
 * @param jinjaDefaults - Default values extracted from Jinja template
 */
export function getVariableValue(
  variable: TemplateVariable,
  userValues: Record<string, any>,
  jinjaDefaults: Record<string, any> = {}
): any {
  if (userValues[variable.name] !== undefined) {
    return userValues[variable.name];
  }
  return jinjaDefaults[variable.name];
}

/**
 * Convert string value to proper type based on variable type
 */
export function parseVariableValue(
  value: string,
  type: TemplateVariableType
): any {
  switch (type) {
    case 'number':
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;

    case 'boolean':
      return value === 'true' || value === '1' || value === 'yes';

    default:
      return value;
  }
}

/**
 * Format value for display
 */
export function formatVariableValue(
  value: any,
  type: TemplateVariableType
): string {
  switch (type) {
    case 'boolean':
      return value ? 'Yes' : 'No';

    case 'color':
      return value; // Could add color swatch in UI

    case 'icon':
      return value; // Could add icon preview in UI

    default:
      return String(value);
  }
}

/**
 * Extract all variable names from Jinja template
 * (Delegates to jinjaDefaultsParser)
 */
export function extractVariableNames(jinjaTemplate: string): string[] {
  return extractJinjaVariableNames(jinjaTemplate);
}

/**
 * Find unused variables (defined but not used in template)
 */
export function findUnusedVariables(
  variables: TemplateVariable[],
  jinjaTemplate: string
): TemplateVariable[] {
  const usedNames = new Set(extractJinjaVariableNames(jinjaTemplate));
  return variables.filter(v => !usedNames.has(v.name));
}

/**
 * Find undeclared variables (used in template but not defined)
 */
export function findUndeclaredVariables(
  variables: TemplateVariable[],
  jinjaTemplate: string
): string[] {
  const declaredNames = new Set(variables.map(v => v.name));
  const usedNames = extractJinjaVariableNames(jinjaTemplate);
  return usedNames.filter(name => !declaredNames.has(name));
}

/**
 * Validate complete template configuration
 */
export function validateTemplateConfig(
  variables: TemplateVariable[],
  jinjaTemplate: string
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for duplicate variable names
  const names = variables.map(v => v.name);
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate variable names: ${[...new Set(duplicates)].join(', ')}`);
  }

  // Check for undeclared variables
  const undeclared = findUndeclaredVariables(variables, jinjaTemplate);
  if (undeclared.length > 0) {
    warnings.push(`Variables used but not declared: ${undeclared.join(', ')}`);
  }

  // Check for unused variables
  const unused = findUnusedVariables(variables, jinjaTemplate);
  if (unused.length > 0) {
    warnings.push(`Declared but unused variables: ${unused.map(v => v.name).join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get all variables with their effective values
 */
export function getVariablesWithValues(
  variables: TemplateVariable[],
  userValues: Record<string, any>,
  jinjaDefaults: Record<string, any> = {}
): Array<{ variable: TemplateVariable; value: any }> {
  return variables.map(variable => ({
    variable,
    value: getVariableValue(variable, userValues, jinjaDefaults)
  }));
}
