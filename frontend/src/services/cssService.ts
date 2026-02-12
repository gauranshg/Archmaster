/**
 * CSS Service
 *
 * Provides secure CSS validation, sanitization, and injection for diagram styling.
 * Prevents XSS attacks through CSS injection and ensures proper scoping.
 */

/**
 * CSS Validation Result
 */
interface CSSValidationResult {
  /** Whether CSS is valid */
  valid: boolean;
  /** Sanitized CSS */
  sanitized: string;
  /** Validation errors/warnings */
  errors: CSSValidationError[];
  /** Line numbers of dangerous rules */
  dangerousLines: number[];
}

/**
 * CSS Validation Error
 */
interface CSSValidationError {
  /** Error type */
  type: 'error' | 'warning';
  /** Error message */
  message: string;
  /** Line number (1-based) */
  line: number;
  /** Column number */
  column?: number;
  /** Rule/property that caused the error */
  rule?: string;
}

/**
 * Dangerous CSS patterns that could lead to XSS or security issues
 */
const DANGEROUS_PATTERNS = [
  // JavaScript execution attempts
  /javascript:/gi,
  /expression\s*\(/gi,
  /behavior\s*:/gi,
  /moz-binding\s*:/gi,
  /-\s*moz-binding\s*:/gi,

  // Data URLs with scripts
  /data\s*:\s*text\/html/gi,
  /data\s*:\s*image\/svg\+xml.*<script/gi,

  // External resources (potential security risk)
  /@import\s+/gi,
  /@charset\s+/gi,

  // User-modifiable content selectors (too broad)
  /html\s*\{/gi,
  /body\s*\{/gi,
  /\*\s*\{/gi,
];

/**
 * CSS properties that are potentially dangerous
 */
const DANGEROUS_PROPERTIES = [
  'behavior',
  'binding',
  'expression',
  '-moz-binding',
  'javascript',
  'vbscript',
  'livescript',
];

/**
 * Allowed CSS properties (safe subset)
 */
const ALLOWED_PROPERTIES = [
  // Layout
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'float',
  'clear',
  'overflow',
  'overflow-x',
  'overflow-y',

  // Box Model
  'width',
  'height',
  'min-width',
  'max-width',
  'min-height',
  'max-height',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-width',
  'border-style',
  'border-color',
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',

  // Typography
  'font',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-variant',
  'line-height',
  'letter-spacing',
  'word-spacing',
  'text-align',
  'text-decoration',
  'text-transform',
  'text-indent',
  'text-shadow',
  'white-space',
  'word-break',
  'word-wrap',

  // Visual
  'opacity',
  'color',
  'background',
  'background-color',
  'background-image',
  'background-repeat',
  'background-position',
  'background-size',
  'background-attachment',
  'box-shadow',
  'filter',
  'backdrop-filter',

  // Transitions & Animations
  'transition',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'transition-delay',
  'animation',
  'animation-name',
  'animation-duration',
  'animation-timing-function',
  'animation-delay',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'transform',
  'transform-origin',

  // Other
  'cursor',
  'pointer-events',
  'visibility',
];

/**
 * Validate CSS for security and syntax
 */
export function validateCSS(css: string): CSSValidationResult {
  const errors: CSSValidationError[] = [];
  const dangerousLines: number[] = [];

  if (!css || css.trim().length === 0) {
    return {
      valid: true,
      sanitized: '',
      errors: [],
      dangerousLines: [],
    };
  }

  const lines = css.split('\n');

  // Check for dangerous patterns
  lines.forEach((line, index) => {
    const lineNum = index + 1;

    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(line)) {
        dangerousLines.push(lineNum);
        errors.push({
          type: 'error',
          message: `Dangerous CSS pattern detected: ${pattern.source}`,
          line: lineNum,
          rule: line.trim(),
        });
      }
    }

    // Check for dangerous properties
    const propertyMatch = line.match(/^([\w-]+)\s*:/);
    if (propertyMatch) {
      const property = propertyMatch[1].toLowerCase().trim();
      if (DANGEROUS_PROPERTIES.includes(property)) {
        dangerousLines.push(lineNum);
        errors.push({
          type: 'error',
          message: `Dangerous CSS property: ${property}`,
          line: lineNum,
          rule: property,
        });
      }
    }
  });

  // Check for overly broad selectors
  const broadSelectors = [
    { pattern: /^\s*html\s*\{/m, message: 'Selector "html" is too broad' },
    { pattern: /^\s*body\s*\{/m, message: 'Selector "body" is too broad' },
    { pattern: /^\s*\*\s*\{/m, message: 'Universal selector "*" is too broad' },
  ];

  broadSelectors.forEach(({ pattern, message }) => {
    const match = css.match(pattern);
    if (match) {
      const lineNum = css.substring(0, match.index!).split('\n').length;
      errors.push({
        type: 'warning',
        message,
        line: lineNum,
      });
    }
  });

  // Basic syntax validation (braces matching)
  const openBraces = (css.match(/\{/g) || []).length;
  const closeBraces = (css.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push({
      type: 'error',
      message: 'Mismatched braces: check opening and closing braces',
      line: 1,
    });
  }

  return {
    valid: dangerousLines.length === 0 && openBraces === closeBraces,
    sanitized: css,
    errors,
    dangerousLines,
  };
}

/**
 * Sanitize CSS by removing dangerous rules
 */
export function sanitizeCSS(css: string): string {
  if (!css || css.trim().length === 0) {
    return '';
  }

  let sanitized = css;

  // Remove dangerous patterns
  DANGEROUS_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '/* REMOVED: dangerous pattern */');
  });

  // Remove @import and @charset
  sanitized = sanitized.replace(/@import\s+[^;]+;/gi, '/* REMOVED: @import */');
  sanitized = sanitized.replace(/@charset\s+[^;]+;/gi, '/* REMOVED: @charset */');

  return sanitized;
}

/**
 * Scope CSS to a specific diagram ID
 */
export function scopeCSS(css: string, diagramId: string): string {
  if (!css || css.trim().length === 0) {
    return '';
  }

  // Add data-diagram-id attribute to all selectors
  const scoped = css.replace(
    /([^{]+)\{/g,
    (match, selector) => {
      // Skip @ rules
      if (selector.trim().startsWith('@')) {
        return match;
      }

      // Add scoping attribute
      const trimmedSelector = selector.trim();
      return `[data-diagram-id="${diagramId}"] ${trimmedSelector} {`;
    }
  );

  return scoped;
}

/**
 * Extract CSS class names from CSS
 */
export function extractClassNames(css: string): string[] {
  const classRegex = /\.([\w-]+)/g;
  const matches = new Set<string>();
  let match;

  while ((match = classRegex.exec(css)) !== null) {
    matches.add(match[1]);
  }

  return Array.from(matches);
}

/**
 * Generate a unique style element ID
 */
export function generateStyleId(diagramId: string): string {
  return `css-${diagramId}`;
}

/**
 * CSS Service API
 */
export const cssService = {
  validateCSS,
  sanitizeCSS,
  scopeCSS,
  extractClassNames,
  generateStyleId,
};
