/**
 * Default Templates Library
 *
 * Built-in templates that ship with the platform.
 * All templates use Jinja2 templating with configurable variables.
 * These are automatically seeded into IndexedDB on first load.
 */

import type { Template, TemplateCategory, BuiltInTemplate, TemplateVariable } from '@/types';

/**
 * Helper function to create a Jinja template with variables
 */
function createJinjaTemplate(
  id: string,
  name: string,
  description: string,
  category: TemplateCategory,
  jinjaTemplate: string,
  variables: TemplateVariable[],
  defaultValues: Record<string, any>,
  tags: string[]
): BuiltInTemplate {
  return {
    id,
    name,
    category,
    template: {
      name,
      description,
      data: {
        label: defaultValues.label || name,
      },
      jinjaTemplate,
      variables,
      defaultValues,
      style: {},
      isPublic: true,
      tags,
    },
  };
}

/**
 * Default template definitions - ALL using Jinja with variables
 */
export const DEFAULT_TEMPLATES: BuiltInTemplate[] = [
  // ========================================
  // DATABASE TEMPLATES
  // ========================================

  createJinjaTemplate(
    'template-database-postgres',
    'PostgreSQL Database',
    'Cylinder-style database with stacked layers',
    'database',
    `
<div style="
  position: relative;
  display: flex;
  align-items: center;
  padding: 16px 20px;
  width: {{ width or 200 }}px;
  border-radius: {{ borderRadius or 16 }}px;
  background: linear-gradient(135deg, {{ bgStart or '#1e3a8a' }} 0%, {{ bgEnd or '#3b82f6' }} 100%);
  border: {{ borderWidth or 3 }}px solid {{ borderColor or '#60a5fa' }};
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  overflow: hidden;
">
  <!-- Cylinder effect on left -->
  <div style="
    position: absolute;
    left: -10px;
    top: 0;
    width: 60px;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      rgba(255,255,255,0.1) 0px,
      rgba(255,255,255,0.1) 8px,
      transparent 8px,
      transparent 16px
    );
    border-radius: 12px;
  "></div>

  <div style="
    position: relative;
    z-index: 1;
    margin-right: 16px;
    font-size: {{ iconSize or 42 }}px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  ">
    {{ icon or '🗄️' }}
  </div>

  <div style="position: relative; z-index: 1; flex: 1;">
    <div style="
      font-weight: 700;
      font-size: {{ labelSize or 16 }}px;
      color: {{ labelColor or '#ffffff' }};
      margin-bottom: 4px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    ">
      {{ label }}
    </div>
    {% if subtitle %}
    <div style="
      font-size: {{ subtitleSize or 11 }}px;
      color: {{ subtitleColor or '#dbeafe' }};
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    ">
      {{ subtitle }}
    </div>
    {% endif %}
  </div>
</div>
    `.trim(),
    [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        description: 'Database name',
        defaultValue: 'PostgreSQL',
        required: true
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        description: 'Type description',
        defaultValue: 'Relational DB'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '🗄️'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 160,
        min: 120,
        max: 250
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#dbeafe'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        defaultValue: '#3b82f6'
      },
      {
        name: 'borderWidth',
        label: 'Border Width',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'number',
        defaultValue: 8,
        min: 0,
        max: 20
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        defaultValue: '#1e40af'
      },
      {
        name: 'labelSize',
        label: 'Label Size',
        type: 'number',
        defaultValue: 14,
        min: 10,
        max: 24
      },
      {
        name: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'color',
        defaultValue: '#64748b'
      },
      {
        name: 'subtitleSize',
        label: 'Subtitle Size',
        type: 'number',
        defaultValue: 11,
        min: 8,
        max: 18
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        defaultValue: 32,
        min: 20,
        max: 64
      }
    ],
    {
      label: 'PostgreSQL',
      subtitle: 'Relational DB',
      icon: '🗄️',
      width: 160,
      backgroundColor: '#dbeafe',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 8,
      labelColor: '#1e40af',
      labelSize: 14,
      subtitleColor: '#64748b',
      subtitleSize: 11,
      iconSize: 32
    },
    ['database', 'sql', 'relational', 'postgres']
  ),

  createJinjaTemplate(
    'template-database-mongodb',
    'MongoDB Database',
    'Document-style database with card layout',
    'database',
    `
<div style="
  position: relative;
  width: {{ width or 180 }}px;
  background: {{ backgroundColor or '#f0fdf4' }};
  border-radius: {{ borderRadius or 12 }}px;
  border-left: {{ borderThickness or 6 }}px solid {{ borderColor or '#22c55e' }};
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);
">
  <!-- Header bar -->
  <div style="
    background: linear-gradient(90deg, {{ headerBg or '#22c55e' }} 0%, {{ headerBgEnd or '#16a34a' }} 100%);
    padding: 8px 12px;
    border-radius: {{ borderRadius or 12 }}px {{ borderRadius or 12 }}px 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  ">
    <span style="
      font-size: {{ iconSize or 24 }}px;
      filter: brightness(0) invert(1);
    ">{{ icon or '🍃' }}</span>
    <span style="
      font-size: {{ badgeSize or 9 }}px;
      color: white;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    ">NoSQL</span>
  </div>

  <!-- Content area -->
  <div style="padding: 12px;">
    <div style="
      font-weight: 700;
      font-size: {{ labelSize or 15 }}px;
      color: {{ labelColor or '#14532d' }};
      margin-bottom: 6px;
    ">
      {{ label }}
    </div>
    {% if subtitle %}
    <div style="
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: {{ subtitleSize or 11 }}px;
      color: {{ subtitleColor or '#166534' }};
      font-family: monospace;
    ">
      <span style="color: {{ iconColor or '#22c55e' }};">●</span>
      {{ subtitle }}
    </div>
    {% endif %}

    <!-- Document rows visual -->
    <div style="
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    ">
      <div style="
        height: 6px;
        background: {{ docBg or '#dcfce7' }};
        border-radius: 3px;
        width: 80%;
      "></div>
      <div style="
        height: 6px;
        background: {{ docBg or '#dcfce7' }};
        border-radius: 3px;
        width: 60%;
      "></div>
      <div style="
        height: 6px;
        background: {{ docBg or '#dcfce7' }};
        border-radius: 3px;
        width: 70%;
      "></div>
    </div>
  </div>
</div>
    `.trim(),
    [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        defaultValue: 'MongoDB',
        required: true
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        defaultValue: 'NoSQL Database'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '🍃'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 160,
        min: 120,
        max: 250
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#d1fae5'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        defaultValue: '#10b981'
      },
      {
        name: 'borderWidth',
        label: 'Border Width',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'number',
        defaultValue: 8,
        min: 0,
        max: 20
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        defaultValue: '#059669'
      },
      {
        name: 'labelSize',
        label: 'Label Size',
        type: 'number',
        defaultValue: 14,
        min: 10,
        max: 24
      },
      {
        name: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'color',
        defaultValue: '#64748b'
      },
      {
        name: 'subtitleSize',
        label: 'Subtitle Size',
        type: 'number',
        defaultValue: 11,
        min: 8,
        max: 18
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        defaultValue: 32,
        min: 20,
        max: 64
      }
    ],
    {
      label: 'MongoDB',
      subtitle: 'NoSQL Database',
      icon: '🍃',
      width: 160,
      backgroundColor: '#d1fae5',
      borderColor: '#10b981',
      borderWidth: 2,
      borderRadius: 8,
      labelColor: '#059669',
      labelSize: 14,
      subtitleColor: '#64748b',
      subtitleSize: 11,
      iconSize: 32
    },
    ['database', 'nosql', 'document', 'mongodb']
  ),

  // ========================================
  // SERVICE TEMPLATES
  // ========================================

  createJinjaTemplate(
    'template-service-rest',
    'REST API',
    'Code-terminal style API endpoint',
    'service',
    `
<div style="
  position: relative;
  background: {{ backgroundColor or '#1a1a2e' }};
  border-radius: {{ borderRadius or 10 }}px;
  overflow: hidden;
  width: {{ width or 220 }}px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
">
  <!-- Terminal header -->
  <div style="
    background: {{ headerColor or '#16213e' }};
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid {{ borderColor or '#0f3460' }};
  ">
    <div style="display: flex; gap: 6px;">
      <div style="width: 10px; height: 10px; border-radius: 50%; background: #ff5f56;"></div>
      <div style="width: 10px; height: 10px; border-radius: 50%; background: #ffbd2e;"></div>
      <div style="width: 10px; height: 10px; border-radius: 50%; background: #27ca40;"></div>
    </div>
    <span style="
      font-size: {{ iconSize or 18 }}px;
    ">{{ icon or '🔌' }}</span>
  </div>

  <!-- Terminal content -->
  <div style="padding: 12px; font-family: 'Courier New', monospace;">
    <div style="
      color: {{ methodColor or '#22c55e' }};
      font-size: {{ methodSize or 12 }}px;
      font-weight: 700;
      margin-bottom: 4px;
    ">{{ method or 'GET' }}</div>

    <div style="
      color: {{ labelColor or '#e2e8f0' }};
      font-size: {{ labelSize or 15 }}px;
      font-weight: 600;
      margin-bottom: 8px;
    ">{{ label }}</div>

    {% if path %}
    <div style="
      color: {{ pathColor or '#60a5fa' }};
      font-size: {{ pathSize or 12 }}px;
      background: {{ pathBg or '#0f3460' }};
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
    ">{{ path }}</div>
    {% endif %}
  </div>
</div>
    `.trim(),
    [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        defaultValue: 'REST API',
        required: true
      },
      {
        name: 'path',
        label: 'API Path',
        type: 'text',
        description: 'API endpoint path',
        defaultValue: '/api/v1'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '🔌'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 150,
        min: 120,
        max: 250
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#dcfce7'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        defaultValue: '#22c55e'
      },
      {
        name: 'borderWidth',
        label: 'Border Width',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'number',
        defaultValue: 12,
        min: 0,
        max: 20
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        defaultValue: '#166534'
      },
      {
        name: 'labelSize',
        label: 'Label Size',
        type: 'number',
        defaultValue: 14,
        min: 10,
        max: 24
      },
      {
        name: 'pathColor',
        label: 'Path Color',
        type: 'color',
        defaultValue: '#64748b'
      },
      {
        name: 'pathSize',
        label: 'Path Size',
        type: 'number',
        defaultValue: 11,
        min: 8,
        max: 16
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        defaultValue: 28,
        min: 20,
        max: 64
      }
    ],
    {
      label: 'REST API',
      path: '/api/v1',
      icon: '🔌',
      width: 150,
      backgroundColor: '#dcfce7',
      borderColor: '#22c55e',
      borderWidth: 2,
      borderRadius: 12,
      labelColor: '#166534',
      labelSize: 14,
      pathColor: '#64748b',
      pathSize: 11,
      iconSize: 28
    },
    ['api', 'rest', 'service', 'http']
  ),

  createJinjaTemplate(
    'template-service-microservice',
    'Microservice',
    'Hexagonal microservice with dual border',
    'service',
    `
<div style="
  position: relative;
  width: {{ width or 180 }}px;
  padding: 16px;
  text-align: center;
  background: {{ backgroundColor or '#faf5ff' }};
  clip-path: polygon(
    25% 0%, 75% 0%,
    100% 50%, 75% 100%,
    25% 100%, 0% 50%
  );
">
  <!-- Outer hexagon border -->
  <div style="
    position: absolute;
    inset: 3px;
    background: {{ innerBg or '#ffffff' }};
    clip-path: polygon(
      25% 0%, 75% 0%,
      100% 50%, 75% 100%,
      25% 100%, 0% 50%
    );
  "></div>

  <div style="position: relative; z-index: 1;">
    <div style="
      font-size: {{ iconSize or 38 }}px;
      margin-bottom: 8px;
    ">{{ icon or '⚙️' }}</div>

    <div style="
      font-weight: 700;
      font-size: {{ labelSize or 14 }}px;
      color: {{ labelColor or '#7c3aed' }};
      margin-bottom: 4px;
    ">{{ label }}</div>

    {% if subtitle %}
    <div style="
      font-size: {{ subtitleSize or 10 }}px;
      color: {{ subtitleColor or '#a78bfa' }};
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
    ">{{ subtitle }}</div>
    {% endif %}

    {% if port %}
    <div style="
      margin-top: 8px;
      font-size: {{ portSize or 11 }}px;
      color: {{ portColor or '#8b5cf6' }};
      font-family: monospace;
      font-weight: 700;
      background: {{ portBg or '#ede9fe' }};
      padding: 2px 8px;
      border-radius: 10px;
      display: inline-block;
    ">:{{ port }}</div>
    {% endif %}
  </div>
</div>
    `.trim(),
    [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        defaultValue: 'Service',
        required: true
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        defaultValue: 'Microservice'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '⚙️'
      },
      {
        name: 'port',
        label: 'Port',
        type: 'text',
        description: 'Service port number',
        defaultValue: '8080'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 150,
        min: 120,
        max: 250
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#ede9fe'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        defaultValue: '#8b5cf6'
      },
      {
        name: 'borderWidth',
        label: 'Border Width',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'number',
        defaultValue: 12,
        min: 0,
        max: 20
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        defaultValue: '#7c3aed'
      },
      {
        name: 'labelSize',
        label: 'Label Size',
        type: 'number',
        defaultValue: 14,
        min: 10,
        max: 24
      },
      {
        name: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'color',
        defaultValue: '#64748b'
      },
      {
        name: 'subtitleSize',
        label: 'Subtitle Size',
        type: 'number',
        defaultValue: 11,
        min: 8,
        max: 18
      },
      {
        name: 'portColor',
        label: 'Port Color',
        type: 'color',
        defaultValue: '#8b5cf6'
      },
      {
        name: 'portSize',
        label: 'Port Size',
        type: 'number',
        defaultValue: 10,
        min: 8,
        max: 14
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        defaultValue: 28,
        min: 20,
        max: 64
      }
    ],
    {
      label: 'Service',
      subtitle: 'Microservice',
      icon: '⚙️',
      port: '8080',
      width: 150,
      backgroundColor: '#ede9fe',
      borderColor: '#8b5cf6',
      borderWidth: 2,
      borderRadius: 12,
      labelColor: '#7c3aed',
      labelSize: 14,
      subtitleColor: '#64748b',
      subtitleSize: 11,
      portColor: '#8b5cf6',
      portSize: 10,
      iconSize: 28
    },
    ['service', 'microservice', 'backend']
  ),

  // ========================================
  // INFRASTRUCTURE TEMPLATES
  // ========================================

  createJinjaTemplate(
    'template-queue',
    'Message Queue',
    'Stacked message queue with depth visualization',
    'infrastructure',
    `
<div style="
  position: relative;
  width: {{ width or 160 }}px;
  padding: 14px;
  background: {{ backgroundColor or '#fff7ed' }};
  border: {{ borderWidth or 2 }}px solid {{ borderColor or '#f97316' }};
  border-radius: {{ borderRadius or 10 }}px;
">
  <!-- Icon and label row -->
  <div style="
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  ">
    <div style="
      font-size: {{ iconSize or 32 }}px;
    ">{{ icon or '📬' }}</div>

    <div style="flex: 1;">
      <div style="
        font-weight: 700;
        font-size: {{ labelSize or 15 }}px;
        color: {{ labelColor or '#c2410c' }};
      ">{{ label }}</div>
      {% if subtitle %}
      <div style="
        font-size: {{ subtitleSize or 10 }}px;
        color: {{ subtitleColor or '#ea580c' }};
      ">{{ subtitle }}</div>
      {% endif %}
    </div>
  </div>

  <!-- Stacked messages visual -->
  <div style="
    display: flex;
    flex-direction: column;
    gap: 4px;
  ">
    <div style="
      height: {{ messageHeight or 8 }}px;
      background: {{ msgColor1 or '#fdba74' }};
      border-radius: 4px;
      width: 100%;
    "></div>
    <div style="
      height: {{ messageHeight or 8 }}px;
      background: {{ msgColor2 or '#fb923c' }};
      border-radius: 4px;
      width: 90%;
      margin-left: auto;
    "></div>
    <div style="
      height: {{ messageHeight or 8 }}px;
      background: {{ msgColor3 or '#f97316' }};
      border-radius: 4px;
      width: 80%;
      margin-left: auto;
    "></div>
    <div style="
      height: {{ messageHeight or 8 }}px;
      background: {{ msgColor4 or '#ea580c' }};
      border-radius: 4px;
      width: 70%;
      margin-left: auto;
    "></div>
  </div>

  {% if badge %}
  <div style="
    position: absolute;
    top: -8px;
    right: -8px;
    background: {{ badgeBackground or '#f97316' }};
    color: {{ badgeColor or '#ffffff' }};
    font-size: {{ badgeSize or 9 }}px;
    padding: 3px 8px;
    border-radius: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  ">{{ badge }}</div>
  {% endif %}
</div>
    `.trim(),
    [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        defaultValue: 'Queue',
        required: true
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        defaultValue: 'Message Queue'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '📬'
      },
      {
        name: 'badge',
        label: 'Badge',
        type: 'text',
        description: 'Small badge text (e.g., "ASYNC")',
        defaultValue: ''
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 150,
        min: 120,
        max: 250
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#ffedd5'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        defaultValue: '#f97316'
      },
      {
        name: 'borderWidth',
        label: 'Border Width',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5
      },
      {
        name: 'borderStyle',
        label: 'Border Style',
        type: 'select',
        defaultValue: 'solid',
        options: [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' }
        ]
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'number',
        defaultValue: 8,
        min: 0,
        max: 20
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        defaultValue: '#ea580c'
      },
      {
        name: 'labelSize',
        label: 'Label Size',
        type: 'number',
        defaultValue: 14,
        min: 10,
        max: 24
      },
      {
        name: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'color',
        defaultValue: '#64748b'
      },
      {
        name: 'subtitleSize',
        label: 'Subtitle Size',
        type: 'number',
        defaultValue: 11,
        min: 8,
        max: 18
      },
      {
        name: 'badgeColor',
        label: 'Badge Color',
        type: 'color',
        defaultValue: '#f97316'
      },
      {
        name: 'badgeBackground',
        label: 'Badge Background',
        type: 'color',
        defaultValue: '#fff7ed'
      },
      {
        name: 'badgeSize',
        label: 'Badge Size',
        type: 'number',
        defaultValue: 9,
        min: 7,
        max: 14
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        defaultValue: 28,
        min: 20,
        max: 64
      }
    ],
    {
      label: 'Queue',
      subtitle: 'Message Queue',
      icon: '📬',
      badge: '',
      width: 150,
      backgroundColor: '#ffedd5',
      borderColor: '#f97316',
      borderWidth: 2,
      borderStyle: 'solid',
      borderRadius: 8,
      labelColor: '#ea580c',
      labelSize: 14,
      subtitleColor: '#64748b',
      subtitleSize: 11,
      badgeColor: '#f97316',
      badgeBackground: '#fff7ed',
      badgeSize: 9,
      iconSize: 28
    },
    ['queue', 'messaging', 'async', 'events']
  ),

  createJinjaTemplate(
    'template-cache',
    'Cache',
    'Lightning-style cache with speed lines',
    'infrastructure',
    `
<div style="
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  width: {{ width or 170 }}px;
  background: {{ backgroundColor or '#fefce8' }};
  border-radius: {{ borderRadius or 12 }}px;
  border: {{ borderWidth or 2 }}px solid {{ borderColor or '#eab308' }};
  overflow: hidden;
">
  <!-- Speed lines background -->
  <div style="
    position: absolute;
    right: -20px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
    width: 80px;
    height: 2px;
    background: linear-gradient(90deg, transparent, {{ speedColor or '#facc15' }});
    opacity: 0.6;
  "></div>
  <div style="
    position: absolute;
    right: -10px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, transparent, {{ speedColor or '#facc15' }});
    opacity: 0.4;
  "></div>

  <!-- Icon with glow -->
  <div style="
    position: relative;
    font-size: {{ iconSize or 36 }}px;
    filter: drop-shadow(0 0 8px {{ glowColor or '#facc15' }});
    z-index: 1;
  ">{{ icon or '⚡' }}</div>

  <!-- Text content -->
  <div style="position: relative; z-index: 1;">
    <div style="
      font-weight: 800;
      font-size: {{ labelSize or 16 }}px;
      color: {{ labelColor or '#a16207' }};
      line-height: 1.2;
    ">{{ label }}</div>

    {% if subtitle %}
    <div style="
      font-size: {{ subtitleSize or 10 }}px;
      color: {{ subtitleColor or '#ca8a04' }};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    ">{{ subtitle }}</div>
    {% endif %}

    <div style="
      margin-top: 4px;
      display: flex;
      gap: 3px;
    ">
      <div style="
        width: 8px;
        height: 3px;
        background: {{ indicatorColor or '#eab308' }};
        border-radius: 2px;
      "></div>
      <div style="
        width: 12px;
        height: 3px;
        background: {{ indicatorColor or '#eab308' }};
        border-radius: 2px;
      "></div>
      <div style="
        width: 6px;
        height: 3px;
        background: {{ indicatorColor or '#eab308' }};
        border-radius: 2px;
      "></div>
    </div>
  </div>
</div>
    `.trim(),
    [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        defaultValue: 'Cache',
        required: true
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        defaultValue: 'Redis/Memcached'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '⚡'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 150,
        min: 120,
        max: 250
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#fef9c3'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        defaultValue: '#eab308'
      },
      {
        name: 'borderWidth',
        label: 'Border Width',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'number',
        defaultValue: 8,
        min: 0,
        max: 20
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        defaultValue: '#ca8a04'
      },
      {
        name: 'labelSize',
        label: 'Label Size',
        type: 'number',
        defaultValue: 14,
        min: 10,
        max: 24
      },
      {
        name: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'color',
        defaultValue: '#64748b'
      },
      {
        name: 'subtitleSize',
        label: 'Subtitle Size',
        type: 'number',
        defaultValue: 11,
        min: 8,
        max: 18
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        defaultValue: 28,
        min: 20,
        max: 64
      }
    ],
    {
      label: 'Cache',
      subtitle: 'Redis/Memcached',
      icon: '⚡',
      width: 150,
      backgroundColor: '#fef9c3',
      borderColor: '#eab308',
      borderWidth: 2,
      borderRadius: 8,
      labelColor: '#ca8a04',
      labelSize: 14,
      subtitleColor: '#64748b',
      subtitleSize: 11,
      iconSize: 28
    },
    ['cache', 'redis', 'performance', 'memory']
  ),

  createJinjaTemplate(
    'template-storage',
    'Object Storage',
    'Nested box storage design',
    'infrastructure',
    `
<div style="
  position: relative;
  width: {{ width or 140 }}px;
  height: {{ height or 120 }}px;
  background: {{ backgroundColor or '#ecfeff' }};
  border: {{ borderOuter or 3 }}px solid {{ borderColor or '#06b6d4' }};
  border-radius: {{ borderRadius or 8 }}px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
">
  <!-- Inner box -->
  <div style="
    width: 100%;
    height: 100%;
    background: {{ innerBg or '#cffafe' }};
    border: {{ borderInner or 2 }}px dashed {{ borderColor or '#06b6d4' }};
    border-radius: {{ innerRadius or 6 }}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
  ">
    <!-- Inner inner box -->
    <div style="
      width: 70%;
      height: 60%;
      background: {{ coreBg or '#ffffff' }};
      border: {{ borderCore or 2 }}px solid {{ borderColor or '#06b6d4' }};
      border-radius: {{ coreRadius or 4 }}px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    ">
      <div style="font-size: {{ iconSize or 28 }}px; margin-bottom: 4px;">
        {{ icon or '📦' }}
      </div>
      <div style="
        font-weight: 700;
        font-size: {{ labelSize or 12 }}px;
        color: {{ labelColor or '#0e7490' }};
        text-align: center;
      ">{{ label }}</div>
      {% if subtitle %}
      <div style="
        font-size: {{ subtitleSize or 9 }}px;
        color: {{ subtitleColor or '#06b6d4' }};
        margin-top: 2px;
      ">{{ subtitle }}</div>
      {% endif %}
    </div>
  </div>
</div>
    `.trim(),
    [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        defaultValue: 'Storage',
        required: true
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        defaultValue: 'S3 / Blob'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '📦'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 150,
        min: 120,
        max: 250
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#cffafe'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        defaultValue: '#06b6d4'
      },
      {
        name: 'borderWidth',
        label: 'Border Width',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'number',
        defaultValue: 8,
        min: 0,
        max: 20
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        defaultValue: '#0891b2'
      },
      {
        name: 'labelSize',
        label: 'Label Size',
        type: 'number',
        defaultValue: 14,
        min: 10,
        max: 24
      },
      {
        name: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'color',
        defaultValue: '#64748b'
      },
      {
        name: 'subtitleSize',
        label: 'Subtitle Size',
        type: 'number',
        defaultValue: 11,
        min: 8,
        max: 18
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        defaultValue: 28,
        min: 20,
        max: 64
      }
    ],
    {
      label: 'Storage',
      subtitle: 'S3 / Blob',
      icon: '📦',
      width: 150,
      backgroundColor: '#cffafe',
      borderColor: '#06b6d4',
      borderWidth: 2,
      borderRadius: 8,
      labelColor: '#0891b2',
      labelSize: 14,
      subtitleColor: '#64748b',
      subtitleSize: 11,
      iconSize: 28
    },
    ['storage', 's3', 'blob', 'object']
  ),

  // ========================================
  // EXTERNAL SYSTEM TEMPLATES
  // ========================================

  createJinjaTemplate(
    'template-external-api',
    'External API',
    'Cloud-style external service',
    'external',
    `
<div style="
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  min-width: {{ width or 180 }}px;
  background: {{ backgroundColor or '#f9fafb' }};
  border-radius: 20px;
  border: {{ borderWidth or 2 }}px dashed {{ borderColor or '#9ca3af' }};
">
  <!-- Cloud icon circle -->
  <div style="
    position: relative;
    width: {{ iconCircle or 48 }}px;
    height: {{ iconCircle or 48 }}px;
    border-radius: 50%;
    background: {{ iconBg or '#e5e7eb' }};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: {{ iconSize or 24 }}px;
  ">{{ icon or '🌐' }}</div>

  <!-- Content -->
  <div style="flex: 1;">
    <div style="
      font-weight: 700;
      font-size: {{ labelSize or 14 }}px;
      color: {{ labelColor or '#374151' }};
      margin-bottom: 2px;
    ">{{ label }}</div>

    {% if subtitle %}
    <div style="
      font-size: {{ subtitleSize or 10 }}px;
      color: {{ subtitleColor or '#6b7280' }};
      font-weight: 500;
    ">{{ subtitle }}</div>
    {% endif %}

    <div style="
      margin-top: 4px;
      display: flex;
      gap: 4px;
    ">
      <div style="
        width: 20px;
        height: 2px;
        background: {{ dotColor or '#9ca3af' }};
        border-radius: 1px;
      "></div>
      <div style="
        width: 12px;
        height: 2px;
        background: {{ dotColor or '#9ca3af' }};
        border-radius: 1px;
      "></div>
      <div style="
        width: 16px;
        height: 2px;
        background: {{ dotColor or '#9ca3af' }};
        border-radius: 1px;
      "></div>
    </div>
  </div>

  {% if badge %}
  <div style="
    position: absolute;
    top: -6px;
    right: 12px;
    background: {{ badgeBg or '#9ca3af' }};
    color: {{ badgeColor or '#ffffff' }};
    font-size: {{ badgeSize or 8 }}px;
    padding: 2px 6px;
    border-radius: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  ">{{ badge }}</div>
  {% endif %}
</div>
    `.trim(),
    [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        defaultValue: 'External API',
        required: true
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        defaultValue: 'Third-party'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '🌐'
      },
      {
        name: 'badge',
        label: 'Badge',
        type: 'text',
        defaultValue: 'EXTERNAL'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 150,
        min: 120,
        max: 250
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#f3f4f6'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        defaultValue: '#9ca3af'
      },
      {
        name: 'borderWidth',
        label: 'Border Width',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5
      },
      {
        name: 'borderStyle',
        label: 'Border Style',
        type: 'select',
        defaultValue: 'dashed',
        options: [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' }
        ]
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'number',
        defaultValue: 8,
        min: 0,
        max: 20
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        defaultValue: '#4b5563'
      },
      {
        name: 'labelSize',
        label: 'Label Size',
        type: 'number',
        defaultValue: 14,
        min: 10,
        max: 24
      },
      {
        name: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'color',
        defaultValue: '#64748b'
      },
      {
        name: 'subtitleSize',
        label: 'Subtitle Size',
        type: 'number',
        defaultValue: 11,
        min: 8,
        max: 18
      },
      {
        name: 'badgeColor',
        label: 'Badge Color',
        type: 'color',
        defaultValue: '#6b7280'
      },
      {
        name: 'badgeBackground',
        label: 'Badge Background',
        type: 'color',
        defaultValue: '#e5e7eb'
      },
      {
        name: 'badgeSize',
        label: 'Badge Size',
        type: 'number',
        defaultValue: 9,
        min: 7,
        max: 14
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        defaultValue: 28,
        min: 20,
        max: 64
      }
    ],
    {
      label: 'External API',
      subtitle: 'Third-party',
      icon: '🌐',
      badge: 'EXTERNAL',
      width: 150,
      backgroundColor: '#f3f4f6',
      borderColor: '#9ca3af',
      borderWidth: 2,
      borderStyle: 'dashed',
      borderRadius: 8,
      labelColor: '#4b5563',
      labelSize: 14,
      subtitleColor: '#64748b',
      subtitleSize: 11,
      badgeColor: '#6b7280',
      badgeBackground: '#e5e7eb',
      badgeSize: 9,
      iconSize: 28
    },
    ['external', 'api', 'third-party']
  ),

  createJinjaTemplate(
    'template-external-system',
    'External System',
    'External system or service with gray dashed border',
    'external',
    `
<div style="
  text-align: center;
  padding: 12px;
  width: {{ width or 150 }}px;
  border-radius: {{ borderRadius or 8 }}px;
  background: {{ backgroundColor or '#f3f4f6' }};
  border: {{ borderWidth or 2 }}px {{ borderStyle or 'dashed' }} {{ borderColor or '#9ca3af' }};
">
  <div style="font-size: {{ iconSize or 28 }}px; margin-bottom: 8px;">
    {{ icon or '🔗' }}
  </div>
  <div style="
    font-weight: 600;
    font-size: {{ labelSize or 14 }}px;
    color: {{ labelColor or '#4b5563' }};
  ">
    {{ label }}
  </div>
  {% if subtitle %}
  <div style="
    font-size: {{ subtitleSize or 11 }}px;
    color: {{ subtitleColor or '#64748b' }};
    margin-top: 4px;
  ">
    {{ subtitle }}
  </div>
  {% endif %}
  {% if badge %}
  <div style="
    margin-top: 6px;
    font-size: {{ badgeSize or 9 }}px;
    color: {{ badgeColor or '#6b7280' }};
    background: {{ badgeBackground or '#e5e7eb' }};
    padding: 2px 8px;
    border-radius: 10px;
    display: inline-block;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  ">
    {{ badge }}
  </div>
  {% endif %}
</div>
    `.trim(),
    [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        defaultValue: 'External System',
        required: true
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        defaultValue: 'Third-party'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '🔗'
      },
      {
        name: 'badge',
        label: 'Badge',
        type: 'text',
        defaultValue: 'EXTERNAL'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 150,
        min: 120,
        max: 250
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#f3f4f6'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        defaultValue: '#9ca3af'
      },
      {
        name: 'borderWidth',
        label: 'Border Width',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5
      },
      {
        name: 'borderStyle',
        label: 'Border Style',
        type: 'select',
        defaultValue: 'dashed',
        options: [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' }
        ]
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'number',
        defaultValue: 8,
        min: 0,
        max: 20
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        defaultValue: '#4b5563'
      },
      {
        name: 'labelSize',
        label: 'Label Size',
        type: 'number',
        defaultValue: 14,
        min: 10,
        max: 24
      },
      {
        name: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'color',
        defaultValue: '#64748b'
      },
      {
        name: 'subtitleSize',
        label: 'Subtitle Size',
        type: 'number',
        defaultValue: 11,
        min: 8,
        max: 18
      },
      {
        name: 'badgeColor',
        label: 'Badge Color',
        type: 'color',
        defaultValue: '#6b7280'
      },
      {
        name: 'badgeBackground',
        label: 'Badge Background',
        type: 'color',
        defaultValue: '#e5e7eb'
      },
      {
        name: 'badgeSize',
        label: 'Badge Size',
        type: 'number',
        defaultValue: 9,
        min: 7,
        max: 14
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        defaultValue: 28,
        min: 20,
        max: 64
      }
    ],
    {
      label: 'External System',
      subtitle: 'Third-party',
      icon: '🔗',
      badge: 'EXTERNAL',
      width: 150,
      backgroundColor: '#f3f4f6',
      borderColor: '#9ca3af',
      borderWidth: 2,
      borderStyle: 'dashed',
      borderRadius: 8,
      labelColor: '#4b5563',
      labelSize: 14,
      subtitleColor: '#64748b',
      subtitleSize: 11,
      badgeColor: '#6b7280',
      badgeBackground: '#e5e7eb',
      badgeSize: 9,
      iconSize: 28
    },
    ['external', 'system', 'third-party']
  ),

  // ========================================
  // COMPONENT TEMPLATES
  // ========================================

  createJinjaTemplate(
    'template-component-ui',
    'UI Component',
    'Card-style component with decorative header',
    'component',
    `
<div style="
  position: relative;
  width: {{ width or 160 }}px;
  background: {{ backgroundColor or '#ffffff' }};
  border-radius: {{ borderRadius or 12 }}px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.15);
  border: {{ borderWidth or 1 }}px solid {{ borderColor or '#fbcfe8' }};
">
  <!-- Decorative header -->
  <div style="
    height: {{ headerHeight or 40 }}px;
    background: linear-gradient(135deg, {{ headerStart or '#ec4899' }} 0%, {{ headerEnd or '#db2777' }} 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: {{ iconSize or 24 }}px;
  ">{{ icon or '🎨' }}</div>

  <!-- Content -->
  <div style="padding: 12px; text-align: center;">
    <div style="
      font-weight: 700;
      font-size: {{ labelSize or 14 }}px;
      color: {{ labelColor or '#be185d' }};
      margin-bottom: 4px;
    ">{{ label }}</div>

    {% if subtitle %}
    <div style="
      font-size: {{ subtitleSize or 10 }}px;
      color: {{ subtitleColor or '#9d174d' }};
      margin-bottom: 8px;
    ">{{ subtitle }}</div>
    {% endif %}

    <!-- Component preview boxes -->
    <div style="
      display: flex;
      gap: 6px;
      justify-content: center;
      margin-top: 8px;
    ">
      <div style="
        width: {{ boxSize or 20 }}px;
        height: {{ boxSize or 20 }}px;
        background: {{ box1Color or '#fce7f3' }};
        border-radius: 4px;
      "></div>
      <div style="
        width: {{ boxSize or 20 }}px;
        height: {{ boxSize or 20 }}px;
        background: {{ box2Color or '#fbcfe8' }};
        border-radius: 4px;
      "></div>
      <div style="
        width: {{ boxSize or 20 }}px;
        height: {{ boxSize or 20 }}px;
        background: {{ box3Color or '#f9a8d4' }};
        border-radius: 4px;
      "></div>
    </div>

    {% if framework %}
    <div style="
      margin-top: 10px;
      font-size: {{ frameworkSize or 9 }}px;
      color: {{ frameworkColor or '#ec4899' }};
      background: {{ frameworkBg or '#fdf2f8' }};
      padding: 3px 8px;
      border-radius: 10px;
      display: inline-block;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    ">{{ framework }}</div>
    {% endif %}
  </div>
</div>
    `.trim(),
    [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        defaultValue: 'Component',
        required: true
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        defaultValue: 'UI Module'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '🎨'
      },
      {
        name: 'framework',
        label: 'Framework',
        type: 'text',
        description: 'Framework name (e.g., "React", "Vue")',
        defaultValue: ''
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 150,
        min: 120,
        max: 250
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#fce7f3'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        defaultValue: '#ec4899'
      },
      {
        name: 'borderWidth',
        label: 'Border Width',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'number',
        defaultValue: 12,
        min: 0,
        max: 20
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        defaultValue: '#be185d'
      },
      {
        name: 'labelSize',
        label: 'Label Size',
        type: 'number',
        defaultValue: 14,
        min: 10,
        max: 24
      },
      {
        name: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'color',
        defaultValue: '#64748b'
      },
      {
        name: 'subtitleSize',
        label: 'Subtitle Size',
        type: 'number',
        defaultValue: 11,
        min: 8,
        max: 18
      },
      {
        name: 'frameworkColor',
        label: 'Framework Color',
        type: 'color',
        defaultValue: '#ec4899'
      },
      {
        name: 'frameworkBackground',
        label: 'Framework Background',
        type: 'color',
        defaultValue: '#fdf2f8'
      },
      {
        name: 'frameworkSize',
        label: 'Framework Size',
        type: 'number',
        defaultValue: 10,
        min: 8,
        max: 14
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        defaultValue: 28,
        min: 20,
        max: 64
      }
    ],
    {
      label: 'Component',
      subtitle: 'UI Module',
      icon: '🎨',
      framework: '',
      width: 150,
      backgroundColor: '#fce7f3',
      borderColor: '#ec4899',
      borderWidth: 2,
      borderRadius: 12,
      labelColor: '#be185d',
      labelSize: 14,
      subtitleColor: '#64748b',
      subtitleSize: 11,
      frameworkColor: '#ec4899',
      frameworkBackground: '#fdf2f8',
      frameworkSize: 10,
      iconSize: 28
    },
    ['component', 'ui', 'frontend']
  ),

  createJinjaTemplate(
    'template-component-library',
    'Component Library',
    'Reusable component library with pink styling',
    'component',
    `
<div style="
  text-align: center;
  padding: 12px;
  width: {{ width or 150 }}px;
  border-radius: {{ borderRadius or 12 }}px;
  background: {{ backgroundColor or '#fce7f3' }};
  border: {{ borderWidth or 2 }}px solid {{ borderColor or '#ec4899' }};
">
  <div style="font-size: {{ iconSize or 28 }}px; margin-bottom: 8px;">
    {{ icon or '📚' }}
  </div>
  <div style="
    font-weight: 600;
    font-size: {{ labelSize or 14 }}px;
    color: {{ labelColor or '#be185d' }};
  ">
    {{ label }}
  </div>
  {% if subtitle %}
  <div style="
    font-size: {{ subtitleSize or 11 }}px;
    color: {{ subtitleColor or '#64748b' }};
    margin-top: 4px;
  ">
    {{ subtitle }}
  </div>
  {% endif %}
</div>
    `.trim(),
    [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        defaultValue: 'Component Library',
        required: true
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        defaultValue: 'Reusable'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '📚'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 150,
        min: 120,
        max: 250
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#fce7f3'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        defaultValue: '#ec4899'
      },
      {
        name: 'borderWidth',
        label: 'Border Width',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'number',
        defaultValue: 12,
        min: 0,
        max: 20
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        defaultValue: '#be185d'
      },
      {
        name: 'labelSize',
        label: 'Label Size',
        type: 'number',
        defaultValue: 14,
        min: 10,
        max: 24
      },
      {
        name: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'color',
        defaultValue: '#64748b'
      },
      {
        name: 'subtitleSize',
        label: 'Subtitle Size',
        type: 'number',
        defaultValue: 11,
        min: 8,
        max: 18
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        defaultValue: 28,
        min: 20,
        max: 64
      }
    ],
    {
      label: 'Component Library',
      subtitle: 'Reusable',
      icon: '📚',
      width: 150,
      backgroundColor: '#fce7f3',
      borderColor: '#ec4899',
      borderWidth: 2,
      borderRadius: 12,
      labelColor: '#be185d',
      labelSize: 14,
      subtitleColor: '#64748b',
      subtitleSize: 11,
      iconSize: 28
    },
    ['component', 'library', 'ui']
  ),

  // ========================================
  // CONTAINER TEMPLATES
  // ========================================

  createJinjaTemplate(
    'template-container-webapp',
    'Web Application',
    'Browser window frame design',
    'container',
    `
<div style="
  position: relative;
  width: {{ width or 200 }}px;
  background: {{ backgroundColor or '#f0f9ff' }};
  border-radius: {{ borderRadius or 12 }}px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
">
  <!-- Browser chrome/header -->
  <div style="
    background: linear-gradient(180deg, {{ headerStart or '#0ea5e9' }} 0%, {{ headerEnd or '#0284c7' }} 100%);
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  ">
    <!-- Window controls -->
    <div style="display: flex; gap: 6px;">
      <div style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></div>
      <div style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b;"></div>
      <div style="width: 10px; height: 10px; border-radius: 50%; background: #22c55e;"></div>
    </div>

    <!-- Address bar -->
    <div style="
      flex: 1;
      height: 18px;
      background: {{ addressBarBg or '#ffffff' }};
      border-radius: 4px;
      display: flex;
      align-items: center;
      padding: 0 8px;
      font-size: 9px;
      color: {{ addressBarColor or '#64748b' }};
      font-family: monospace;
    ">
      {{ addressBar or 'https://...' }}
    </div>

    <div style="font-size: {{ iconSize or 16 }}px;">{{ icon or '🌍' }}</div>
  </div>

  <!-- Content area -->
  <div style="padding: 14px; text-align: center;">
    <div style="
      font-weight: 700;
      font-size: {{ labelSize or 16 }}px;
      color: {{ labelColor or '#0369a1' }};
      margin-bottom: 4px;
    ">{{ label }}</div>

    {% if subtitle %}
    <div style="
      font-size: {{ subtitleSize or 11 }}px;
      color: {{ subtitleColor or '#0ea5e9' }};
      margin-bottom: 8px;
    ">{{ subtitle }}</div>
    {% endif %}

    {% if technology %}
    <div style="
      display: inline-block;
      font-size: {{ techSize or 10 }}px;
      color: {{ techColor or '#0284c7' }};
      background: {{ techBg or '#e0f2fe' }};
      padding: 3px 10px;
      border-radius: 12px;
      font-weight: 600;
    ">{{ technology }}</div>
    {% endif %}
  </div>
</div>
    `.trim(),
    [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        defaultValue: 'Web App',
        required: true
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        defaultValue: 'SPA / MPA'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '🌍'
      },
      {
        name: 'technology',
        label: 'Technology',
        type: 'text',
        description: 'Tech stack (e.g., "React", "Angular")',
        defaultValue: ''
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 170,
        min: 140,
        max: 280
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#e0f2fe'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        defaultValue: '#0ea5e9'
      },
      {
        name: 'borderWidth',
        label: 'Border Width',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'number',
        defaultValue: 12,
        min: 0,
        max: 20
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        defaultValue: '#0369a1'
      },
      {
        name: 'labelSize',
        label: 'Label Size',
        type: 'number',
        defaultValue: 14,
        min: 10,
        max: 24
      },
      {
        name: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'color',
        defaultValue: '#64748b'
      },
      {
        name: 'subtitleSize',
        label: 'Subtitle Size',
        type: 'number',
        defaultValue: 11,
        min: 8,
        max: 18
      },
      {
        name: 'techColor',
        label: 'Tech Color',
        type: 'color',
        defaultValue: '#0284c7'
      },
      {
        name: 'techBackground',
        label: 'Tech Background',
        type: 'color',
        defaultValue: '#f0f9ff'
      },
      {
        name: 'techSize',
        label: 'Tech Size',
        type: 'number',
        defaultValue: 10,
        min: 8,
        max: 14
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        defaultValue: 28,
        min: 20,
        max: 64
      }
    ],
    {
      label: 'Web App',
      subtitle: 'SPA / MPA',
      icon: '🌍',
      technology: '',
      width: 170,
      backgroundColor: '#e0f2fe',
      borderColor: '#0ea5e9',
      borderWidth: 2,
      borderRadius: 12,
      labelColor: '#0369a1',
      labelSize: 14,
      subtitleColor: '#64748b',
      subtitleSize: 11,
      techColor: '#0284c7',
      techBackground: '#f0f9ff',
      techSize: 10,
      iconSize: 28
    },
    ['container', 'web', 'application']
  ),

  createJinjaTemplate(
    'template-container-mobile',
    'Mobile App',
    'Phone frame design',
    'container',
    `
<div style="
  position: relative;
  width: {{ width or 110 }}px;
  height: {{ height or 180 }}px;
  background: {{ backgroundColor or '#1e293b' }};
  border-radius: 24px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
">
  <!-- Phone screen -->
  <div style="
    width: 100%;
    height: 100%;
    background: {{ screenBg or '#0ea5e9' }};
    border-radius: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px;
    text-align: center;
  ">
    <!-- Notch/camera -->
    <div style="
      position: absolute;
      top: 12px;
      width: 40px;
      height: 4px;
      background: {{ notchColor or '#0f172a' }};
      border-radius: 2px;
    "></div>

    <!-- Icon -->
    <div style="
      font-size: {{ iconSize or 32 }}px;
      margin-bottom: 8px;
      margin-top: 8px;
    ">{{ icon or '📱' }}</div>

    <!-- Label -->
    <div style="
      font-weight: 700;
      font-size: {{ labelSize or 13 }}px;
      color: {{ labelColor or '#ffffff' }};
      margin-bottom: 4px;
      line-height: 1.3;
    ">{{ label }}</div>

    {% if subtitle %}
    <div style="
      font-size: {{ subtitleSize or 9 }}px;
      color: {{ subtitleColor or '#bae6fd' }};
      font-weight: 500;
    ">{{ subtitle }}</div>
    {% endif %}

    <!-- Home indicator -->
    <div style="
      position: absolute;
      bottom: 8px;
      width: 30px;
      height: 3px;
      background: {{ homeIndicator or '#ffffff' }};
      border-radius: 2px;
      opacity: 0.8;
    "></div>
  </div>
</div>
    `.trim(),
    [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        defaultValue: 'Mobile App',
        required: true
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        defaultValue: 'iOS / Android'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '📱'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 150,
        min: 120,
        max: 250
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#e0f2fe'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        defaultValue: '#0ea5e9'
      },
      {
        name: 'borderWidth',
        label: 'Border Width',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'number',
        defaultValue: 16,
        min: 0,
        max: 25
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        defaultValue: '#0369a1'
      },
      {
        name: 'labelSize',
        label: 'Label Size',
        type: 'number',
        defaultValue: 14,
        min: 10,
        max: 24
      },
      {
        name: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'color',
        defaultValue: '#64748b'
      },
      {
        name: 'subtitleSize',
        label: 'Subtitle Size',
        type: 'number',
        defaultValue: 11,
        min: 8,
        max: 18
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        defaultValue: 28,
        min: 20,
        max: 64
      }
    ],
    {
      label: 'Mobile App',
      subtitle: 'iOS / Android',
      icon: '📱',
      width: 150,
      backgroundColor: '#e0f2fe',
      borderColor: '#0ea5e9',
      borderWidth: 2,
      borderRadius: 16,
      labelColor: '#0369a1',
      labelSize: 14,
      subtitleColor: '#64748b',
      subtitleSize: 11,
      iconSize: 28
    },
    ['container', 'mobile', 'app']
  ),

  // ========================================
  // USER TEMPLATES (C4 Model)
  // ========================================

  createJinjaTemplate(
    'template-user',
    'User',
    'Human user or actor with cyan styling',
    'external',
    `
<div style="
  text-align: center;
  padding: 14px;
  width: {{ width or 130 }}px;
  border-radius: {{ borderRadius or 20 }}px;
  background: {{ backgroundColor or '#ffffff' }};
  border: {{ borderWidth or 2 }}px solid {{ borderColor or '#9ca3af' }};
">
  <div style="
    width: {{ iconCircleSize or 50 }}px;
    height: {{ iconCircleSize or 50 }}px;
    border-radius: 50%;
    background: {{ iconBackground or '#ecfeff' }};
    margin: 0 auto 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: {{ iconColor or '#0891b2' }};
    font-size: {{ iconSize or 32 }}px;
  ">
    {{ icon or '👤' }}
  </div>
  <div style="
    font-weight: 600;
    font-size: {{ labelSize or 14 }}px;
    color: {{ labelColor or '#374151' }};
  ">
    {{ label }}
  </div>
  {% if subtitle %}
  <div style="
    font-size: {{ subtitleSize or 11 }}px;
    color: {{ subtitleColor or '#64748b' }};
    margin-top: 4px;
  ">
    {{ subtitle }}
  </div>
  {% endif %}
</div>
    `.trim(),
    [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        defaultValue: 'User',
        required: true
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        defaultValue: 'Person'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '👤'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 130,
        min: 100,
        max: 200
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#ffffff'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        defaultValue: '#9ca3af'
      },
      {
        name: 'borderWidth',
        label: 'Border Width',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'number',
        defaultValue: 20,
        min: 10,
        max: 30
      },
      {
        name: 'iconBackground',
        label: 'Icon Circle Background',
        type: 'color',
        defaultValue: '#ecfeff'
      },
      {
        name: 'iconColor',
        label: 'Icon Color',
        type: 'color',
        defaultValue: '#0891b2'
      },
      {
        name: 'iconCircleSize',
        label: 'Icon Circle Size',
        type: 'number',
        defaultValue: 50,
        min: 40,
        max: 70
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        defaultValue: 32,
        min: 20,
        max: 64
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        defaultValue: '#374151'
      },
      {
        name: 'labelSize',
        label: 'Label Size',
        type: 'number',
        defaultValue: 14,
        min: 10,
        max: 24
      },
      {
        name: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'color',
        defaultValue: '#64748b'
      },
      {
        name: 'subtitleSize',
        label: 'Subtitle Size',
        type: 'number',
        defaultValue: 11,
        min: 8,
        max: 18
      }
    ],
    {
      label: 'User',
      subtitle: 'Person',
      icon: '👤',
      width: 130,
      backgroundColor: '#ffffff',
      borderColor: '#9ca3af',
      borderWidth: 2,
      borderRadius: 20,
      iconBackground: '#ecfeff',
      iconColor: '#0891b2',
      iconCircleSize: 50,
      iconSize: 32,
      labelColor: '#374151',
      labelSize: 14,
      subtitleColor: '#64748b',
      subtitleSize: 11
    },
    ['user', 'person', 'actor']
  ),

  createJinjaTemplate(
    'template-admin',
    'Administrator',
    'System administrator with gray styling',
    'external',
    `
<div style="
  text-align: center;
  padding: 14px;
  width: {{ width or 130 }}px;
  border-radius: {{ borderRadius or 20 }}px;
  background: {{ backgroundColor or '#ffffff' }};
  border: {{ borderWidth or 2 }}px solid {{ borderColor or '#9ca3af' }};
">
  <div style="
    width: {{ iconCircleSize or 50 }}px;
    height: {{ iconCircleSize or 50 }}px;
    border-radius: 50%;
    background: {{ iconBackground or '#f3f4f6' }};
    margin: 0 auto 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: {{ iconColor or '#4b5563' }};
    font-size: {{ iconSize or 32 }}px;
  ">
    {{ icon or '👨‍💼' }}
  </div>
  <div style="
    font-weight: 600;
    font-size: {{ labelSize or 14 }}px;
    color: {{ labelColor or '#374151' }};
  ">
    {{ label }}
  </div>
  {% if subtitle %}
  <div style="
    font-size: {{ subtitleSize or 11 }}px;
    color: {{ subtitleColor or '#64748b' }};
    margin-top: 4px;
  ">
    {{ subtitle }}
  </div>
  {% endif %}
</div>
    `.trim(),
    [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        defaultValue: 'Admin',
        required: true
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        defaultValue: 'Administrator'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '👨‍💼'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 130,
        min: 100,
        max: 200
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#ffffff'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        defaultValue: '#9ca3af'
      },
      {
        name: 'borderWidth',
        label: 'Border Width',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'number',
        defaultValue: 20,
        min: 10,
        max: 30
      },
      {
        name: 'iconBackground',
        label: 'Icon Circle Background',
        type: 'color',
        defaultValue: '#f3f4f6'
      },
      {
        name: 'iconColor',
        label: 'Icon Color',
        type: 'color',
        defaultValue: '#4b5563'
      },
      {
        name: 'iconCircleSize',
        label: 'Icon Circle Size',
        type: 'number',
        defaultValue: 50,
        min: 40,
        max: 70
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        defaultValue: 32,
        min: 20,
        max: 64
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        defaultValue: '#374151'
      },
      {
        name: 'labelSize',
        label: 'Label Size',
        type: 'number',
        defaultValue: 14,
        min: 10,
        max: 24
      },
      {
        name: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'color',
        defaultValue: '#64748b'
      },
      {
        name: 'subtitleSize',
        label: 'Subtitle Size',
        type: 'number',
        defaultValue: 11,
        min: 8,
        max: 18
      }
    ],
    {
      label: 'Admin',
      subtitle: 'Administrator',
      icon: '👨‍💼',
      width: 130,
      backgroundColor: '#ffffff',
      borderColor: '#9ca3af',
      borderWidth: 2,
      borderRadius: 20,
      iconBackground: '#f3f4f6',
      iconColor: '#4b5563',
      iconCircleSize: 50,
      iconSize: 32,
      labelColor: '#374151',
      labelSize: 14,
      subtitleColor: '#64748b',
      subtitleSize: 11
    },
    ['user', 'admin', 'person']
  ),

  // ========================================
  // CUSTOM HTML NODE
  // ========================================

  {
    id: 'template-custom-html',
    name: 'Custom HTML',
    category: 'custom' as TemplateCategory,
    template: {
      name: 'Custom HTML',
      description: 'Full creative control with custom HTML, CSS, and styling',
      data: {
        label: 'Custom HTML',
      },
      jinjaTemplate: `
<div style="
  position: relative;
  width: {{ width or 180 }}px;
  min-height: {{ minHeight or 100 }}px;
  background: {{ backgroundColor or '#1f2937' }};
  border-radius: {{ borderRadius or 12 }}px;
  border: {{ borderWidth or 2 }}px solid {{ borderColor or '#8b5cf6' }};
  overflow: hidden;
">
  <!-- Header -->
  <div style="
    background: linear-gradient(135deg, {{ headerStart or '#8b5cf6' }} 0%, {{ headerEnd or '#7c3aed' }} 100%);
    padding: 12px;
    text-align: center;
  ">
    <div style="font-size: {{ iconSize or 28 }}px; margin-bottom: 4px;">
      {{ icon or '🎨' }}
    </div>
    <div style="
      font-weight: 700;
      font-size: {{ labelSize or 16 }}px;
      color: {{ labelColor or '#ffffff' }};
    ">
      {{ label }}
    </div>
  </div>

  <!-- Body -->
  <div style="padding: 12px;">
    <div style="
      font-size: {{ bodySize or 12 }}px;
      color: {{ bodyColor or '#d1d5db' }};
      line-height: 1.5;
      text-align: center;
    ">
      Edit HTML in Properties<br/>
      for full control!
    </div>

    <!-- Code decoration -->
    <div style="
      margin-top: 8px;
      padding: 6px;
      background: {{ codeBg or '#111827' }};
      border-radius: 6px;
      font-family: monospace;
      font-size: 10px;
      color: {{ codeColor or '#a78bfa' }};
      text-align: center;
    ">
      &lt;div&gt;Your HTML&lt;/div&gt;
    </div>
  </div>

  <!-- Status bar -->
  <div style="
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 6px 12px;
    background: {{ footerBg or '#111827' }};
    border-top: 1px solid {{ borderColor or '#8b5cf6' }};
    display: flex;
    justify-content: space-between;
    align-items: center;
  ">
    <span style="
      font-size: 9px;
      color: {{ footerText or '#9ca3af' }};
      text-transform: uppercase;
      letter-spacing: 0.1em;
    ">Custom HTML</span>
    <div style="
      width: 8px;
      height: 8px;
      background: {{ indicatorColor or '#8b5cf6' }};
      border-radius: 50%;
      box-shadow: 0 0 8px {{ indicatorColor or '#8b5cf6' }};
    "></div>
  </div>
</div>
      `.trim(),
      variables: [
        {
          name: 'label',
          label: 'Label',
          type: 'text',
          description: 'Node label',
          defaultValue: 'Custom HTML',
          required: true
        },
        {
          name: 'icon',
          label: 'Icon',
          type: 'icon',
          description: 'Emoji or icon',
          defaultValue: '🎨'
        },
        {
          name: 'width',
          label: 'Width',
          type: 'number',
          description: 'Node width in pixels',
          defaultValue: 180,
          min: 100,
          max: 400
        },
        {
          name: 'minHeight',
          label: 'Min Height',
          type: 'number',
          defaultValue: 100,
          min: 50,
          max: 500
        },
        {
          name: 'backgroundColor',
          label: 'Background Color',
          type: 'color',
          defaultValue: '#1f2937'
        },
        {
          name: 'borderColor',
          label: 'Border Color',
          type: 'color',
          defaultValue: '#8b5cf6'
        },
        {
          name: 'borderWidth',
          label: 'Border Width',
          type: 'number',
          defaultValue: 2,
          min: 1,
          max: 5
        },
        {
          name: 'borderRadius',
          label: 'Border Radius',
          type: 'number',
          defaultValue: 12,
          min: 0,
          max: 30
        },
        {
          name: 'headerStart',
          label: 'Header Start Color',
          type: 'color',
          defaultValue: '#8b5cf6'
        },
        {
          name: 'headerEnd',
          label: 'Header End Color',
          type: 'color',
          defaultValue: '#7c3aed'
        },
        {
          name: 'iconSize',
          label: 'Icon Size',
          type: 'number',
          defaultValue: 28,
          min: 16,
          max: 64
        },
        {
          name: 'labelColor',
          label: 'Label Color',
          type: 'color',
          defaultValue: '#ffffff'
        },
        {
          name: 'labelSize',
          label: 'Label Size',
          type: 'number',
          defaultValue: 16,
          min: 10,
          max: 32
        },
        {
          name: 'bodySize',
          label: 'Body Font Size',
          type: 'number',
          defaultValue: 12,
          min: 8,
          max: 24
        },
        {
          name: 'bodyColor',
          label: 'Body Text Color',
          type: 'color',
          defaultValue: '#d1d5db'
        },
        {
          name: 'codeBg',
          label: 'Code Block Background',
          type: 'color',
          defaultValue: '#111827'
        },
        {
          name: 'codeColor',
          label: 'Code Block Text',
          type: 'color',
          defaultValue: '#a78bfa'
        },
        {
          name: 'footerBg',
          label: 'Footer Background',
          type: 'color',
          defaultValue: '#111827'
        },
        {
          name: 'footerText',
          label: 'Footer Text Color',
          type: 'color',
          defaultValue: '#9ca3af'
        },
        {
          name: 'indicatorColor',
          label: 'Indicator Color',
          type: 'color',
          defaultValue: '#8b5cf6'
        }
      ],
      defaultValues: {
        label: 'Custom HTML',
        icon: '🎨',
        width: 180,
        minHeight: 100,
        backgroundColor: '#1f2937',
        borderColor: '#8b5cf6',
        borderWidth: 2,
        borderRadius: 12,
        headerStart: '#8b5cf6',
        headerEnd: '#7c3aed',
        iconSize: 28,
        labelColor: '#ffffff',
        labelSize: 16,
        bodySize: 12,
        bodyColor: '#d1d5db',
        codeBg: '#111827',
        codeColor: '#a78bfa',
        footerBg: '#111827',
        footerText: '#9ca3af',
        indicatorColor: '#8b5cf6'
      },
      style: {},
      isPublic: true,
      tags: ['custom', 'html', 'flexible', 'creative'],
    },
  },

  // ========================================
  // SAMPLE TEMPLATE (already had Jinja)
  // ========================================

  {
    id: 'sample-template-red-glow-db',
    name: 'Database (Red Glow)',
    category: 'database' as TemplateCategory,
    template: {
      name: 'Database (Red Glow)',
      description: 'Cyber-styled database node with customizable glowing effects',
      data: {
        label: 'PostgreSQL',
      },
      jinjaTemplate: `
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
      `.trim(),
      variables: [
        {
          name: 'label',
          label: 'Label',
          type: 'text' as const,
          description: 'Database name',
          defaultValue: 'PostgreSQL',
          required: true
        },
        {
          name: 'subtitle',
          label: 'Subtitle',
          type: 'text' as const,
          description: 'Type text (e.g., "Database", "Cache")',
          defaultValue: 'Database'
        },
        {
          name: 'icon',
          label: 'Icon',
          type: 'icon' as const,
          description: 'Emoji or icon',
          defaultValue: '🗄️'
        },
        {
          name: 'width',
          label: 'Width',
          type: 'number' as const,
          description: 'Box width in pixels',
          defaultValue: 170,
          min: 100,
          max: 300
        },
        {
          name: 'background',
          label: 'Background Color',
          type: 'color' as const,
          defaultValue: '#000000'
        },
        {
          name: 'borderColor',
          label: 'Border Color',
          type: 'color' as const,
          defaultValue: '#7f1d1d'
        },
        {
          name: 'shadowColor',
          label: 'Shadow Color (RGB)',
          type: 'text' as const,
          description: 'RGB values (e.g., "239, 68, 68")',
          defaultValue: '239, 68, 68'
        },
        {
          name: 'labelColor',
          label: 'Label Color',
          type: 'color' as const,
          defaultValue: '#f87171'
        },
        {
          name: 'labelSize',
          label: 'Label Font Size',
          type: 'number' as const,
          defaultValue: 16,
          min: 10,
          max: 32
        },
        {
          name: 'subtitleColor',
          label: 'Subtitle Color',
          type: 'color' as const,
          defaultValue: '#fecaca'
        },
        {
          name: 'subtitleSize',
          label: 'Subtitle Font Size',
          type: 'number' as const,
          defaultValue: 11,
          min: 8,
          max: 20
        },
        {
          name: 'iconSize',
          label: 'Icon Size',
          type: 'number' as const,
          defaultValue: 36,
          min: 20,
          max: 64
        }
      ],
      defaultValues: {
        label: 'PostgreSQL',
        subtitle: 'Database',
        icon: '🗄️',
        width: 170,
        background: '#000000',
        borderColor: '#7f1d1d',
        shadowColor: '239, 68, 68',
        labelColor: '#f87171',
        labelSize: 16,
        subtitleColor: '#fecaca',
        subtitleSize: 11,
        iconSize: 36
      },
      style: {},
      isPublic: true,
      tags: ['sample', 'database', 'cyber', 'glow'],
    },
  },
];

/**
 * Convert built-in template to full Template with timestamps
 */
export function createTemplateFromBuiltIn(
  builtIn: BuiltInTemplate,
  author: string = 'System'
): Template {
  const now = new Date().toISOString();

  return {
    id: builtIn.id,
    category: builtIn.category,
    author,
    ...builtIn.template,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Seed default templates to storage
 */
export async function seedDefaultTemplates(): Promise<Template[]> {
  const templates = DEFAULT_TEMPLATES.map((t) =>
    createTemplateFromBuiltIn(t, 'System')
  );

  return templates;
}
