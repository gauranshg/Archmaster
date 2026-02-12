/**
 * Default Jinja Templates
 *
 * Built-in Jinja templates for each node type.
 */

import type { Template, TemplateVariable } from '@/types';

/**
 * Jinja template for CustomNode
 */
const CUSTOM_NODE_JINJA = `
<div style="text-align: center; padding: 12px;">
  {% if icon %}
  <div style="font-size: 28px; margin-bottom: 8px;">{{ icon }}</div>
  {% endif %}
  {% if image %}
  <img src="{{ image }}" alt="{{ label }}" style="width: 48px; height: 48px; margin-bottom: 8px; border-radius: 8px;" />
  {% endif %}
  <div style="font-weight: 600; color: #1f2937; font-size: 14px;">{{ label }}</div>
  {% if description %}
  <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">{{ description }}</div>
  {% endif %}
  {% if properties %}
  <div style="margin-top: 8px; font-size: 11px; color: #9ca3af;">
    {% for key, value in properties.items() %}
    <div>{{ key }}: {{ value }}</div>
    {% endfor %}
  </div>
  {% endif %}
</div>
`.trim();

/**
 * Jinja template for C4PersonNode
 */
const C4_PERSON_JINJA = `
<div style="text-align: center; padding: 12px;">
  <div style="width: 40px; height: 40px; border-radius: 50%; background: #ecfeff; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: #0891b2;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="8" r="4"/>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    </svg>
  </div>
  <div style="font-weight: 600; color: #1e293b; font-size: 13px;">{{ label }}</div>
  {% if description %}
  <div style="font-size: 11px; color: #64748b; margin-top: 4px;">{{ description }}</div>
  {% endif %}
  {% if properties and properties.technology %}
  <div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-style: italic;">[{{ properties.technology }}]</div>
  {% endif %}
</div>
`.trim();

/**
 * Jinja template for C4SoftwareSystemNode
 */
const C4_SOFTWARE_SYSTEM_JINJA = `
<div style="text-align: center; padding: 12px;">
  <div style="font-size: 32px; margin-bottom: 8px;">🖥️</div>
  <div style="font-weight: 600; color: #1e293b; font-size: 13px;">{{ label }}</div>
  {% if description %}
  <div style="font-size: 11px; color: #64748b; margin-top: 4px;">{{ description }}</div>
  {% endif %}
  {% if properties and properties.technology %}
  <div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-style: italic;">[{{ properties.technology }}]</div>
  {% endif %}
</div>
`.trim();

/**
 * Jinja template for C4ContainerNode
 */
const C4_CONTAINER_JINJA = `
<div style="text-align: center; padding: 12px;">
  <div style="font-size: 28px; margin-bottom: 8px;">📦</div>
  <div style="font-weight: 600; color: #1e293b; font-size: 13px;">{{ label }}</div>
  {% if description %}
  <div style="font-size: 11px; color: #64748b; margin-top: 4px;">{{ description }}</div>
  {% endif %}
  {% if properties and properties.technology %}
  <div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-style: italic;">[{{ properties.technology }}]</div>
  {% endif %}
</div>
`.trim();

/**
 * Jinja template for C4ComponentNode
 */
const C4_COMPONENT_JINJA = `
<div style="text-align: center; padding: 12px;">
  <div style="font-size: 28px; margin-bottom: 8px;">⚙️</div>
  <div style="font-weight: 600; color: #1e293b; font-size: 13px;">{{ label }}</div>
  {% if description %}
  <div style="font-size: 11px; color: #64748b; margin-top: 4px;">{{ description }}</div>
  {% endif %}
  {% if properties and properties.technology %}
  <div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-style: italic;">[{{ properties.technology }}]</div>
  {% endif %}
</div>
`.trim();

/**
 * Jinja template for C4DatabaseNode
 */
const C4_DATABASE_JINJA = `
<div style="text-align: center; padding: 12px;">
  <div style="font-size: 32px; margin-bottom: 8px;">🗄️</div>
  <div style="font-weight: 600; color: #1e293b; font-size: 13px;">{{ label }}</div>
  {% if description %}
  <div style="font-size: 11px; color: #64748b; margin-top: 4px;">{{ description }}</div>
  {% endif %}
  {% if properties %}
  <div style="margin-top: 6px; font-size: 10px; color: #64748b;">
    {% if properties.databaseType %}
    <div>Type: {{ properties.databaseType }}</div>
    {% endif %}
    {% if properties.technology %}
    <div>{{ properties.technology }}</div>
    {% endif %}
  </div>
  {% endif %}
</div>
`.trim();

/**
 * Jinja template for C4QueueNode
 */
const C4_QUEUE_JINJA = `
<div style="text-align: center; padding: 12px;">
  <div style="font-size: 28px; margin-bottom: 8px;">📬</div>
  <div style="font-weight: 600; color: #1e293b; font-size: 13px;">{{ label }}</div>
  {% if description %}
  <div style="font-size: 11px; color: #64748b; margin-top: 4px;">{{ description }}</div>
  {% endif %}
  {% if properties and properties.technology %}
  <div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-style: italic;">[{{ properties.technology }}]</div>
  {% endif %}
</div>
`.trim();

/**
 * Jinja template for DatabaseNode
 */
const DATABASE_NODE_JINJA = `
<div style="text-align: center; padding: 14px;">
  <div style="font-size: 32px; margin-bottom: 8px;">🗄️</div>
  <div style="font-weight: 600; color: #1f2937; font-size: 14px;">{{ label }}</div>
  {% if description %}
  <div style="font-size: 12px; color: #6b7280; margin-top: 6px;">{{ description }}</div>
  {% endif %}
  {% if properties and properties.databaseType %}
  <div style="font-size: 11px; color: #8b5cf6; margin-top: 4px; padding: 2px 8px; background: #f5f3ff; border-radius: 8px; display: inline-block;">{{ properties.databaseType | title }}</div>
  {% endif %}
</div>
`.trim();

/**
 * Jinja template for ServiceNode
 */
const SERVICE_NODE_JINJA = `
<div style="text-align: center; padding: 14px;">
  <div style="font-size: 28px; margin-bottom: 8px;">⚙️</div>
  <div style="font-weight: 600; color: #1f2937; font-size: 14px;">{{ label }}</div>
  {% if properties and properties.serviceType %}
  <div style="font-size: 10px; font-weight: 500; color: #10b981; background: #ecfdf5; padding: 2px 8px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 6px; display: inline-block;">{{ properties.serviceType }}</div>
  {% endif %}
  {% if description %}
  <div style="font-size: 12px; color: #6b7280; margin-top: 6px;">{{ description }}</div>
  {% endif %}
</div>
`.trim();

/**
 * Map node types to their default Jinja templates
 */
export const DEFAULT_JINJA_TEMPLATES: Record<string, string> = {
  custom: CUSTOM_NODE_JINJA,
  c4Person: C4_PERSON_JINJA,
  c4SoftwareSystem: C4_SOFTWARE_SYSTEM_JINJA,
  c4Container: C4_CONTAINER_JINJA,
  c4Component: C4_COMPONENT_JINJA,
  c4Database: C4_DATABASE_JINJA,
  c4Queue: C4_QUEUE_JINJA,
  database: DATABASE_NODE_JINJA,
  service: SERVICE_NODE_JINJA,
};

/**
 * Get default Jinja template for node type
 */
export function getDefaultJinjaTemplate(nodeType: string): string {
  return DEFAULT_JINJA_TEMPLATES[nodeType] || DEFAULT_JINJA_TEMPLATES.custom;
}

/**
 * Create system template from Jinja template
 */
export function createSystemTemplate(
  id: string,
  name: string,
  category: string,
  nodeType: string,
  author: string = 'System'
): Template {
  const now = new Date().toISOString();

  return {
    id,
    name,
    category: category as any,
    author,
    isPublic: true,
    isSystemTemplate: true,
    jinjaTemplate: getDefaultJinjaTemplate(nodeType),
    variables: [],
    data: {
      label: 'Sample',
    },
    style: {},
    tags: ['system', nodeType],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Seed default Jinja templates
 */
export function seedDefaultJinjaTemplates(): Template[] {
  const templates: Template[] = [];

  // C4 Model Templates
  templates.push(createSystemTemplate(
    'sys-template-c4-person',
    'C4 Person (Jinja)',
    'external',
    'c4Person'
  ));

  templates.push(createSystemTemplate(
    'sys-template-c4-system',
    'C4 Software System (Jinja)',
    'container',
    'c4SoftwareSystem'
  ));

  templates.push(createSystemTemplate(
    'sys-template-c4-container',
    'C4 Container (Jinja)',
    'container',
    'c4Container'
  ));

  templates.push(createSystemTemplate(
    'sys-template-c4-component',
    'C4 Component (Jinja)',
    'component',
    'c4Component'
  ));

  templates.push(createSystemTemplate(
    'sys-template-c4-database',
    'C4 Database (Jinja)',
    'database',
    'c4Database'
  ));

  templates.push(createSystemTemplate(
    'sys-template-c4-queue',
    'C4 Queue (Jinja)',
    'infrastructure',
    'c4Queue'
  ));

  // Generic Templates
  templates.push(createSystemTemplate(
    'sys-template-custom',
    'Custom Node (Jinja)',
    'custom',
    'custom'
  ));

  templates.push(createSystemTemplate(
    'sys-template-database',
    'Database Node (Jinja)',
    'database',
    'database'
  ));

  templates.push(createSystemTemplate(
    'sys-template-service',
    'Service Node (Jinja)',
    'service',
    'service'
  ));

  return templates;
}

/**
 * Sample template with variables (red-glowing cyber database)
 */
export function createSampleVariabledTemplate(): Template {
  const now = new Date().toISOString();

  // Template variables
  const variables: TemplateVariable[] = [
    {
      name: 'label',
      label: 'Label',
      type: 'text',
      description: 'Database name',
      required: true
    },
    {
      name: 'subtitle',
      label: 'Subtitle',
      type: 'text',
      description: 'Type text (e.g., "Database", "Cache")'
    },
    {
      name: 'icon',
      label: 'Icon',
      type: 'icon',
      description: 'Emoji or icon'
    },
    {
      name: 'width',
      label: 'Width',
      type: 'number',
      description: 'Box width in pixels',
      min: 100,
      max: 300
    },
    {
      name: 'background',
      label: 'Background Color',
      type: 'color'
    },
    {
      name: 'borderColor',
      label: 'Border Color',
      type: 'color'
    },
    {
      name: 'shadowColor',
      label: 'Shadow Color (RGB)',
      type: 'text',
      description: 'RGB values (e.g., "239, 68, 68")'
    },
    {
      name: 'labelColor',
      label: 'Label Color',
      type: 'color'
    },
    {
      name: 'labelSize',
      label: 'Label Font Size',
      type: 'number',
      min: 10,
      max: 32
    },
    {
      name: 'subtitleColor',
      label: 'Subtitle Color',
      type: 'color'
    },
    {
      name: 'subtitleSize',
      label: 'Subtitle Font Size',
      type: 'number',
      min: 8,
      max: 20
    },
    {
      name: 'iconSize',
      label: 'Icon Size',
      type: 'number',
      min: 20,
      max: 64
    }
  ];

  // Jinja template
  const jinjaTemplate = `
<div style="
  text-align: center;
  padding: 18px;
  width: {{ width or 170 }}px;
  border-radius: 14px;
  background: {{ background or '#000000' }};
  border: 1px solid {{ borderColor or '#7f1d1d' }};
  box-shadow:
    0 0 12px rgba({{ shadowColor or '239, 68, 68' }}, 0.8),
    0 0 28px rgba({{ shadowColor or '239, 68, 68' }}, 0.6),
    0 0 60px rgba({{ shadowColor or '239, 68, 68' }}, 0.4);
">
  <div style="font-size: {{ iconSize or 36 }}px; margin-bottom: 10px; filter: drop-shadow(0 0 6px rgba({{ shadowColor or '239, 68, 68' }}, 0.9));">
    {{ icon or '🗄️' }}
  </div>
  <div style="
    font-weight: 700;
    font-size: {{ labelSize or 16 }}px;
    color: {{ labelColor or '#f87171' }};
    text-shadow:
      0 0 6px rgba({{ shadowColor or '239, 68, 68' }}, 0.9),
      0 0 14px rgba({{ shadowColor or '239, 68, 68' }}, 0.7);
  ">
    {{ label }}
  </div>
  <div style="
    margin-top: 6px;
    font-size: {{ subtitleSize or 11 }}px;
    color: {{ subtitleColor or '#fecaca' }};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-shadow: 0 0 8px rgba({{ shadowColor or '239, 68, 68' }}, 0.8);
  ">
    {{ subtitle or 'Database' }}
  </div>
</div>
`.trim();

  return {
    id: 'sample-template-red-glow-db',
    name: 'Database (Red Glow)',
    description: 'Cyber-styled database node with customizable glowing effects',
    category: 'database',
    author: 'System',
    isPublic: true,
    isSystemTemplate: true,
    jinjaTemplate,
    variables,
    data: {
      label: 'PostgreSQL',
    },
    style: {},
    tags: ['sample', 'database', 'cyber'],
    createdAt: now,
    updatedAt: now,
  };
}
