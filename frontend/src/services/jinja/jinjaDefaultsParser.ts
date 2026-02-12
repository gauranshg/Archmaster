/**
 * Jinja Defaults Parser
 *
 * Extracts default values from Jinja templates by parsing
 * expressions like {{ variable or 'default' }}.
 *
 * Supports:
 * - {{ var or 'string' }}
 * - {{ var or "string" }}
 * - {{ var or 123 }}
 * - {{ var or true }}
 * - {{ var or 1.5 }}
 * - {{ var | default('value') }}
 */

/**
 * Parse default value from a Jinja expression
 * Handles: {{ var or 'default' }} and {{ var | default('default') }}
 */
function parseDefaultValue(value: string, quoteType?: string): any {
  const trimmed = value.trim();

  // Handle quoted strings
  if (quoteType === "'") {
    return trimmed.slice(1, -1); // Remove quotes
  }
  if (quoteType === '"') {
    return trimmed.slice(1, -1); // Remove quotes
  }

  // Handle unquoted values
  // Boolean
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null' || trimmed === 'none') return null;

  // Number
  const num = Number(trimmed);
  if (!isNaN(num)) return num;

  // Default to string (might be a variable reference)
  return trimmed;
}

/**
 * Parse Jinja template and extract default values for all variables
 *
 * Examples of patterns we extract from:
 * - {{ label or 'My Label' }}
 * - {{ width or 170 }}
 * - {{ enabled or true }}
 * - {{ items | default([]) }}
 * - {{ color or "#ff0000" }}
 */
export function parseJinjaDefaults(jinjaTemplate: string): Record<string, any> {
  const defaults: Record<string, any> = {};

  // Pattern 1: {{ var or 'value' }} or {{ var or "value" }} or {{ var or 123 }}
  // Matches: variable name, optional quote, value, optional quote
  const orPattern = /\{\{\s*(\w+)\s+or\s+(['"]?)([^'"}\s]+(?:\s+[^'"}\s]+)*)\2\s*\}\}/g;
  let match;

  while ((match = orPattern.exec(jinjaTemplate)) !== null) {
    const varName = match[1];
    const quoteType = match[2];
    const rawValue = match[3];

    if (!(varName in defaults)) {
      defaults[varName] = parseDefaultValue(rawValue, quoteType);
    }
  }

  // Pattern 2: {{ var | default('value') }} or {{ var|default("value") }}
  // Matches: variable name, optional spaces, default filter
  const defaultFilterPattern = /\{\{\s*(\w+)\s*\|\s*default\s*\(\s*(['"]?)([^'")]+)\2\s*\)\s*\}\}/g;

  while ((match = defaultFilterPattern.exec(jinjaTemplate)) !== null) {
    const varName = match[1];
    const quoteType = match[2];
    const rawValue = match[3];

    if (!(varName in defaults)) {
      defaults[varName] = parseDefaultValue(rawValue, quoteType);
    }
  }

  return defaults;
}

/**
 * Extract all variable names used in a Jinja template
 * (Both with and without defaults)
 */
export function extractVariableNames(jinjaTemplate: string): string[] {
  const names = new Set<string>();
  const pattern = /\{\{\s*(\w+)(?:\s|\||\})/g;
  let match;

  while ((match = pattern.exec(jinjaTemplate)) !== null) {
    names.add(match[1]);
  }

  return Array.from(names);
}

/**
 * Get variables that have defaults in the template
 */
export function getVariablesWithDefaults(jinjaTemplate: string): Array<{ name: string; defaultValue: any }> {
  const defaults = parseJinjaDefaults(jinjaTemplate);
  return Object.entries(defaults).map(([name, defaultValue]) => ({ name, defaultValue }));
}

/**
 * Get variables that don't have defaults in the template
 */
export function getVariablesWithoutDefaults(jinjaTemplate: string): string[] {
  const allNames = extractVariableNames(jinjaTemplate);
  const withDefaults = new Set(Object.keys(parseJinjaDefaults(jinjaTemplate)));
  return allNames.filter(name => !withDefaults.has(name));
}

/**
 * Validate that all declared variables are used in the template
 */
export function validateVariableUsage(
  variables: Array<{ name: string }>,
  jinjaTemplate: string
): { valid: boolean; unused: string[]; undeclared: string[] } {
  const declaredNames = new Set(variables.map(v => v.name));
  const usedNames = new Set(extractVariableNames(jinjaTemplate));

  const unused = [...declaredNames].filter(name => !usedNames.has(name));
  const undeclared = [...usedNames].filter(name => !declaredNames.has(name));

  return {
    valid: unused.length === 0 && undeclared.length === 0,
    unused,
    undeclared
  };
}
