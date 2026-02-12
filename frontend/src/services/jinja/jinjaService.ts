/**
 * Jinja Template Engine Service
 *
 * Provides template compilation, rendering, caching, and validation.
 */

import nunjucks from 'nunjucks';
import DOMPurify from 'dompurify';
import type {
  JinjaTemplateContext,
  TemplateRenderResult,
  TemplateValidationResult,
  JinjaFilter
} from '@/types/jinja';
import type { NodeData, NodeStyle } from '@/types';

/**
 * Template cache for performance
 */
const templateCache = new Map<string, nunjucks.Template>();

/**
 * Configure Nunjucks for browser environment
 */
const configureNunjucks = () => {
  // Configure auto-escaping (disabled - we handle manually)
  nunjucks.configure({
    autoescape: false,
    web: {
      useCache: true,
      async: false
    }
  });
};

// Initialize on load
configureNunjucks();

/**
 * Built-in filters
 */
const BUILTIN_FILTERS: JinjaFilter[] = [
  { name: 'upper', description: 'Convert to uppercase', example: '{{ label | upper }}' },
  { name: 'lower', description: 'Convert to lowercase', example: '{{ label | lower }}' },
  { name: 'capitalize', description: 'Capitalize first letter', example: '{{ label | capitalize }}' },
  { name: 'title', description: 'Title case', example: '{{ label | title }}' },
  { name: 'trim', description: 'Remove whitespace', example: '{{ description | trim }}' },
  { name: 'default', description: 'Default value if undefined', example: '{{ description | default("N/A") }}' },
  { name: 'safe', description: 'Mark as safe (bypass auto-escape)', example: '{{ htmlContent | safe }}' },
  { name: 'length', description: 'Get array/string length', example: '{{ properties | length }}' },
  { name: 'first', description: 'Get first item', example: '{{ tags | first }}' },
  { name: 'last', description: 'Get last item', example: '{{ tags | last }}' },
  { name: 'join', description: 'Join array items', example: '{{ tags | join(", ") }}' },
  { name: 'sort', description: 'Sort array', example: '{{ tags | sort }}' },
  { name: 'unique', description: 'Remove duplicates', example: '{{ tags | unique }}' },
  { name: 'replace', description: 'Replace text', example: '{{ label | replace("old", "new") }}' },
  { name: 'truncate', description: 'Truncate text', example: '{{ description | truncate(50) }}' },
  { name: 'wordcount', description: 'Count words', example: '{{ description | wordcount }}' },
];

/**
 * Build template context from node data
 */
export function buildTemplateContext(nodeData: NodeData, nodeStyle?: NodeStyle): JinjaTemplateContext {
  return {
    // Basic fields
    label: nodeData.label || '',
    description: nodeData.description,
    icon: nodeData.icon,
    image: nodeData.image,
    cssClass: nodeData.cssClass,
    cssId: nodeData.cssId,
    width: nodeData.width,
    height: nodeData.height,
    childDiagramId: nodeData.childDiagramId,
    properties: nodeData.properties || {},

    // Style object
    style: {
      backgroundColor: nodeStyle?.backgroundColor,
      borderColor: nodeStyle?.borderColor,
      borderWidth: nodeStyle?.borderWidth,
      borderRadius: nodeStyle?.borderRadius,
      padding: nodeStyle?.padding,
      margin: nodeStyle?.margin,
      fontSize: nodeStyle?.fontSize,
      fontFamily: nodeStyle?.fontFamily,
      color: nodeStyle?.color,
      boxShadow: nodeStyle?.boxShadow,
      ...nodeStyle
    },

    // Computed values
    hasDescription: Boolean(nodeData.description),
    hasIcon: Boolean(nodeData.icon),
    hasImage: Boolean(nodeData.image),
    hasProperties: Boolean(nodeData.properties && Object.keys(nodeData.properties).length > 0),
  };
}

/**
 * Render Jinja template with context
 */
export function renderJinjaTemplate(
  templateString: string,
  context: JinjaTemplateContext
): TemplateRenderResult {
  const startTime = performance.now();

  try {
    // Check cache first
    let template: nunjucks.Template;

    if (templateCache.has(templateString)) {
      template = templateCache.get(templateString)!;
    } else {
      // Compile template
      template = nunjucks.compile(templateString);
      templateCache.set(templateString, template);
    }

    // Render with context
    const renderedHtml = template.render(context);

    // Sanitize rendered output
    const sanitizedHtml = DOMPurify.sanitize(renderedHtml, {
      ALLOWED_TAGS: ['div', 'span', 'p', 'strong', 'em', 'u', 'b', 'i', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'img', 'a', 'code', 'pre', 'small', 'blockquote', 'table', 'tr', 'td', 'th', 'thead', 'tbody'],
      ALLOWED_ATTR: ['class', 'style', 'href', 'src', 'alt', 'title', 'id', 'target', 'rel', 'colspan', 'rowspan'],
    });

    const renderTime = performance.now() - startTime;

    return {
      html: sanitizedHtml,
      success: true,
      renderTime
    };
  } catch (error) {
    const renderTime = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      html: '',
      success: false,
      error: errorMessage,
      renderTime
    };
  }
}

/**
 * Validate Jinja template syntax
 */
export function validateJinjaTemplate(templateString: string): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const variables = new Set<string>();
  const filters = new Set<string>();

  try {
    // Try to compile
    nunjucks.compile(templateString);

    // Extract variables (basic regex-based extraction)
    const varRegex = /\{\{\s*(\w+)(?:\|\s*(\w+))?/g;
    let match;

    while ((match = varRegex.exec(templateString)) !== null) {
      variables.add(match[1]);
      if (match[2]) {
        filters.add(match[2]);
      }
    }

    // Check for dangerous patterns
    if (templateString.includes('{% import')) {
      warnings.push('Import statements are not recommended for security');
    }

    if (templateString.includes('{% include')) {
      warnings.push('Include statements may not work in browser environment');
    }

  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown syntax error');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    variables: Array.from(variables),
    filters: Array.from(filters)
  };
}

/**
 * Clear template cache
 */
export function clearTemplateCache(): void {
  templateCache.clear();
}

/**
 * Get template cache size
 */
export function getCacheSize(): number {
  return templateCache.size;
}

/**
 * Get built-in filters
 */
export function getBuiltinFilters(): JinjaFilter[] {
  return [...BUILTIN_FILTERS];
}

/**
 * Get available template variables documentation
 */
export function getTemplateVariablesDocumentation(): Record<string, { description: string; type: string; example: string }> {
  return {
    label: { description: 'Node label', type: 'string', example: 'My Service' },
    description: { description: 'Node description', type: 'string', example: 'REST API service' },
    icon: { description: 'Node icon (emoji)', type: 'string', example: '⚙️' },
    image: { description: 'Node image URL', type: 'string', example: 'https://...' },
    cssClass: { description: 'Custom CSS class', type: 'string', example: 'my-custom-class' },
    cssId: { description: 'Custom CSS ID', type: 'string', example: 'node-123' },
    width: { description: 'Node width', type: 'number', example: '200' },
    height: { description: 'Node height', type: 'number', example: '100' },
    childDiagramId: { description: 'Child diagram ID for drill-down', type: 'string', example: 'diagram-456' },
    properties: { description: 'Custom properties object', type: 'object', example: '{ "version": "1.0" }' },
    style: { description: 'Style properties', type: 'object', example: '{ "backgroundColor": "#fff" }' },
    hasDescription: { description: 'Whether description exists', type: 'boolean', example: 'true' },
    hasIcon: { description: 'Whether icon exists', type: 'boolean', example: 'true' },
    hasImage: { description: 'Whether image exists', type: 'boolean', example: 'false' },
    hasProperties: { description: 'Whether properties exist', type: 'boolean', example: 'true' },
  };
}
