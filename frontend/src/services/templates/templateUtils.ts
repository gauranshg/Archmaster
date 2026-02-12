/**
 * Preset Utilities
 *
 * Helper functions for preset (template with values) management,
 * conversion between presets and nodes, and preset-related operations.
 */

import type { Template, NodeData, NodeStyle } from '@/types';
import type { Node } from 'reactflow';

/**
 * Convert a template to a React Flow Node
 *
 * @param template - The template to convert
 * @param position - Position where the node should be placed
 * @param id - Optional custom ID (defaults to timestamp-based)
 * @returns React Flow Node created from template
 */
export function templateToNode(
  template: Template,
  position: { x: number; y: number },
  id?: string
): Node {
  const nodeId = id || `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: nodeId,
    type: 'custom',
    position,
    data: {
      ...template.data,
      id: nodeId,
      // IMPORTANT: Set templateId so the node uses the UI template
      templateId: template.id,
      // Initialize properties with template's default values
      properties: template.defaultValues || undefined,
    } as NodeData,
    style: template.style as NodeStyle,
    className: template.className,
    draggable: true,
    selectable: true,
    connectable: true,
  };
}

/**
 * Convert a React Flow Node to a Template
 *
 * @param node - The node to convert
 * @param templateName - Name for the template
 * @param author - Template author
 * @param category - Template category
 * @param description - Optional description
 * @returns Template created from node
 */
export function nodeToTemplate(
  node: Node,
  templateName: string,
  author: string,
  category: string,
  description?: string
): Omit<Template, 'id' | 'createdAt' | 'updatedAt'> {
  const nodeData = node.data as NodeData;

  return {
    name: templateName,
    description,
    category: category as any,
    author,
    isPublic: false,
    // Preserve templateId and properties if they exist
    data: {
      ...nodeData,
      // Don't include templateId in the saved template data
      // as it will be set when the template is used
    },
    // Preserve defaultValues from the node's properties
    defaultValues: nodeData.properties || undefined,
    style: (node.style || {}) as NodeStyle,
    className: node.className,
    thumbnail: undefined, // Will be generated separately
    tags: [],
    constraints: undefined,
  };
}

/**
 * Generate a unique template ID
 *
 * @param name - Template name to base ID on
 * @returns Unique template ID
 */
export function generateTemplateId(name: string): string {
  const timestamp = Date.now();
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `template-${slug}-${timestamp}`;
}

/**
 * Validate template data
 *
 * @param template - Template to validate
 * @returns Validation result with success flag and error message
 */
export function validateTemplate(
  template: Partial<Template>
): { valid: boolean; error?: string } {
  if (!template.name || template.name.trim().length === 0) {
    return { valid: false, error: 'Template name is required' };
  }

  if (!template.data) {
    return { valid: false, error: 'Template data is required' };
  }

  if (!template.data.label || template.data.label.trim().length === 0) {
    return { valid: false, error: 'Node label is required' };
  }

  if (!template.category) {
    return { valid: false, error: 'Template category is required' };
  }

  if (!template.author || template.author.trim().length === 0) {
    return { valid: false, error: 'Template author is required' };
  }

  return { valid: true };
}

/**
 * Extract template category from node data
 *
 * @param node - Node to analyze
 * @returns Suggested template category
 */
export function suggestTemplateCategory(node: Node): string {
  const data = node.data as NodeData;
  const label = data.label?.toLowerCase() || '';
  const description = data.description?.toLowerCase() || '';
  const combined = `${label} ${description}`;

  // Database patterns
  if (
    /database|db|sql|mongodb|postgres|mysql|oracle|cassandra|dynamodb/.test(
      combined
    )
  ) {
    return 'database';
  }

  // API patterns
  if (/api|rest|graphql|endpoint|service/.test(combined)) {
    return 'service';
  }

  // Infrastructure patterns
  if (/queue|cache|redis|kafka|rabbitmq|storage|s3|blob/.test(combined)) {
    return 'infrastructure';
  }

  // External patterns
  if (/external|third.?party|vendor|partner/.test(combined)) {
    return 'external';
  }

  // Container patterns
  if (/app|application|web|mobile|spa|mpa|container/.test(combined)) {
    return 'container';
  }

  // Component patterns
  if (/component|module|library|lib|ui|frontend/.test(combined)) {
    return 'component';
  }

  // Default to custom
  return 'custom';
}

/**
 * Create template thumbnail placeholder
 * (Used when actual thumbnail generation fails or is pending)
 *
 * @param template - Template to create placeholder for
 * @returns Placeholder SVG data URL
 */
export function createThumbnailPlaceholder(template: Template): string {
  const colors: Record<string, string> = {
    database: '#3b82f6',
    service: '#22c55e',
    infrastructure: '#f97316',
    external: '#9ca3af',
    component: '#ec4899',
    container: '#0ea5e9',
    custom: '#8b5cf6',
  };

  const color = colors[template.category || 'custom'] || '#8b5cf6';
  const initial = (template.name[0] || 'T').toUpperCase();

  const svg = `
    <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="150" fill="${color}20"/>
      <circle cx="100" cy="75" r="40" fill="${color}40"/>
      <text x="100" y="85" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="${color}" text-anchor="middle">${initial}</text>
      <text x="100" y="130" font-family="Arial, sans-serif" font-size="14" fill="#666" text-anchor="middle">${template.name}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Sort templates by name
 *
 * @param templates - Templates to sort
 * @param order - Sort order ('asc' or 'desc')
 * @returns Sorted templates array
 */
export function sortTemplatesByName(
  templates: Template[],
  order: 'asc' | 'desc' = 'asc'
): Template[] {
  return [...templates].sort((a, b) => {
    const compare = a.name.localeCompare(b.name);
    return order === 'asc' ? compare : -compare;
  });
}

/**
 * Group templates by category
 *
 * @param templates - Templates to group
 * @returns Object with category as key and templates array as value
 */
export function groupTemplatesByCategory(
  templates: Template[]
): Record<string, Template[]> {
  return templates.reduce((acc, template) => {
    const category = template.category || 'custom';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);
}

/**
 * Filter templates by search term
 *
 * @param templates - Templates to filter
 * @param searchTerm - Search term to filter by
 * @returns Filtered templates
 */
export function filterTemplatesBySearch(
  templates: Template[],
  searchTerm: string
): Template[] {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return templates;
  }

  const term = searchTerm.toLowerCase();

  return templates.filter((template) => {
    const nameMatch = template.name.toLowerCase().includes(term);
    const descMatch = template.description?.toLowerCase().includes(term);
    const tagMatch = template.tags?.some((tag) =>
      tag.toLowerCase().includes(term)
    );
    const categoryMatch = template.category?.toLowerCase().includes(term);

    return nameMatch || descMatch || tagMatch || categoryMatch;
  });
}

/**
 * Clone template for editing
 *
 * @param template - Template to clone
 * @returns Cloned template with new ID
 */
export function cloneTemplate(template: Template): Template {
  return {
    ...template,
    id: generateTemplateId(`${template.name}-copy`),
    name: `${template.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Merge template with custom overrides
 *
 * @param template - Base template
 * @param overrides - Custom overrides to apply
 * @returns Merged template
 */
export function mergeTemplate(
  template: Template,
  overrides: Partial<Template>
): Template {
  return {
    ...template,
    ...overrides,
    data: {
      ...template.data,
      ...overrides.data,
    },
    style: {
      ...template.style,
      ...overrides.style,
    },
    updatedAt: new Date().toISOString(),
  };
}
