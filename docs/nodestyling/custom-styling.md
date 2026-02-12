# Custom Styling Techniques

Advanced techniques for customizing node appearance using CSS classes, IDs, Jinja templates, and more.

## Table of Contents

- [CSS Classes & IDs](#css-classes--ids)
- [Jinja Templates](#jinja-templates)
- [Dynamic Styling](#dynamic-styling)
- [Advanced CSS Techniques](#advanced-css-techniques)
- [Styling Workflows](#styling-workflows)

---

## CSS Classes & IDs

### CSS Class Customization

Nodes support custom CSS classes via the `cssClass` property:

```typescript
const node: Node = {
  id: 'node-1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    label: 'My Node',
    cssClass: 'special-node highlighted'  // Sanitized automatically
  }
};
```

**CSS Classes are Sanitized**:

```typescript
// Input
cssClass: 'script <script>alert(1)</script> node'

// Sanitized output (safe)
'script-node'  // Special characters removed
```

**Sanitization Rules**:
- Only alphanumeric characters, hyphens, and underscores allowed
- Multiple classes separated by spaces
- Leading/trailing spaces trimmed
- Consecutive spaces collapsed to single space

### CSS ID Customization

Nodes support custom CSS IDs via the `cssId` property:

```typescript
const node: Node = {
  id: 'node-1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    label: 'My Node',
    cssId: 'unique-node-id'  // Must be unique, sanitized
  }
};
```

**Using CSS IDs**:

```css
/* Style specific node by ID */
#unique-node-id {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
}

/* More specific selector */
#diagram-abc123 #unique-node-id {
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}
```

### Best Practices for Classes & IDs

```css
/* GOOD - Semantic class names */
.database-primary { }
.service-microservice { }
.node-external { }

/* AVOID - Generic/presentational names */
.red-node { }
.big-node { }
.styled-node { }

/* GOOD - Specific IDs */
#user-service-node { }
#database-prod { }

/* AVOID - Generic IDs */
#node1 { }
#custom-node { }
```

---

## Jinja Templates

### Template Basics

Jinja templates provide dynamic HTML rendering with variables, conditionals, and loops.

```typescript
const node: Node = {
  id: 'node-1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    label: 'Web Server',
    description: 'Nginx web server',
    icon: '🖥️',
    properties: {
      port: 80,
      ssl: true,
      version: '1.18.0'
    },
    jinjaTemplate: `
      <div class="custom-card" style="padding: 16px; text-align: center;">
        {% if icon %}
        <div class="icon" style="font-size: 32px; margin-bottom: 8px;">{{ icon }}</div>
        {% endif %}
        <h3 style="font-weight: 600; color: #1f2937;">{{ label }}</h3>
        {% if description %}
        <p style="font-size: 12px; color: #6b7280; margin-top: 4px;">{{ description }}</p>
        {% endif %}
        {% if properties %}
        <div class="properties" style="margin-top: 12px; font-size: 11px; color: #9ca3af;">
          {% for key, value in properties.items() %}
          <div style="padding: 2px 0;">{{ key }}: {{ value }}</div>
          {% endfor %}
        </div>
        {% endif %}
      </div>
    `
  }
};
```

### Available Template Variables

```typescript
interface JinjaTemplateContext {
  // Basic fields
  label: string;
  description?: string;
  icon?: string;
  image?: string;
  cssClass?: string;
  cssId?: string;
  width?: number;
  height?: number;
  childDiagramId?: string;
  properties?: Record<string, unknown>;

  // Style object
  style: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    // ... all NodeStyle properties
  };

  // Computed values
  hasDescription: boolean;
  hasIcon: boolean;
  hasImage: boolean;
  hasProperties: boolean;
}
```

### Conditional Rendering

```jinja
<!-- Show icon if exists -->
{% if icon %}
<div class="icon">{{ icon }}</div>
{% endif %}

<!-- Show description if exists -->
{% if description %}
<p>{{ description }}</p>
{% endif %}

<!-- Multiple conditions -->
{% if icon and not image %}
<div class="icon">{{ icon }}</div>
{% elif image %}
<img src="{{ image }}" alt="{{ label }}" />
{% endif %}

<!-- Negation -->
{% if not properties %}
<div class="no-data">No properties available</div>
{% endif %}
```

### Loops

```jinja
<!-- Loop over properties -->
{% if properties %}
<div class="properties">
  {% for key, value in properties.items() %}
  <div class="property">
    <span class="key">{{ key }}:</span>
    <span class="value">{{ value }}</span>
  </div>
  {% endfor %}
</div>
{% endif %}

<!-- Loop with index -->
{% if tags %}
<div class="tags">
  {% for tag in tags %}
  <span class="tag">{{ tag }}</span>
  {% endfor %}
</div>
{% endif %}

<!-- Loop with conditionals -->
{% for item in items %}
  <div class="item {{ 'active' if item.active else '' }}">
    {{ item.name }}
  </div>
{% endfor %}
```

### Filters

```jinja
<!-- String filters -->
{{ label | upper }}           {# Convert to uppercase #}
{{ description | lower }}      {# Convert to lowercase #}
{{ label | capitalize }}        {# Capitalize first letter #}
{{ label | title }}             {# Title Case #}
{{ description | trim }}         {# Remove whitespace #}
{{ description | truncate(50) }} {# Truncate to 50 chars #}

<!-- Default values -->
{{ description | default("No description") }}

<!-- Array filters -->
{{ tags | length }}             {# Get array length #}
{{ tags | first }}              {# Get first item #}
{{ tags | last }}               {# Get last item #}
{{ tags | join(", ") }}         {# Join with comma #}
{{ tags | sort }}               {# Sort array #}

<!-- Replace -->
{{ label | replace("old", "new") }}

<!-- JSON output -->
{{ properties | json }}          {# Convert to JSON #}
```

### Advanced Templates

```jinja
<!-- Nested conditionals -->
<div class="node-card {{ 'external' if isExternal else 'internal' }}">
  {% if icon %}
    <div class="icon {{ 'large' if size == 'lg' else 'small' }}">
      {{ icon }}
    </div>
  {% endif %}

  <h3>{{ label | title }}</h3>

  {% if description %}
    <p class="description">
      {{ description | truncate(100) }}
      {% if description | length > 100 %}
        <a href="#" title="{{ description }}">…</a>
      {% endif %}
    </p>
  {% endif %}

  {% if properties %}
    <div class="properties">
      {% for key, value in properties.items() %}
        <div class="property" style="
          {% if key == 'status' and value == 'error' %}
            color: #ef4444;
            font-weight: 600;
          {% endif %}
        ">
          <strong>{{ key | title }}:</strong> {{ value }}
        </div>
      {% endfor %}
    </div>
  {% endif %}

  {% if hasProperties %}
    <div class="metadata">
      {{ properties | length }} properties defined
    </div>
  {% endif %}
</div>
```

---

## Dynamic Styling

### Conditional Styling Based on Data

```typescript
const node: Node = {
  id: 'node-1',
  type: 'service',
  position: { x: 100, y: 100 },
  data: {
    label: 'API Service',
    serviceType: 'rest',  // rest, graphql, grpc, websocket
    properties: {
      status: 'healthy',  // healthy, degraded, error
      version: 'v2.0'
    },
    jinjaTemplate: `
      <div class="service-card" style="
        padding: 16px;
        border-radius: 8px;
        text-align: center;
        {% if properties.status == 'error' %}
          background: #fef2f2;
          border: 2px solid #ef4444;
        {% elif properties.status == 'healthy' %}
          background: #f0fdf4;
          border: 2px solid #10b981;
        {% else %}
          background: #fef3c7;
          border: 2px solid #f59e0b;
        {% endif %}
      ">
        <div style="font-size: 28px;">⚙️</div>
        <h3 style="font-weight: 600; margin: 8px 0;">{{ label }}</h3>
        <div style="
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 8px;
          border-radius: 12px;
          display: inline-block;
          background: var(--diagram-primary-light);
          color: var(--diagram-primary-dark);
        ">
          {{ serviceType }}
        </div>
        {% if properties.status %}
        <div class="status-badge" style="
          margin-top: 8px;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
          {% if properties.status == 'healthy' %}
            background: #ecfdf5;
            color: #059669;
          {% elif properties.status == 'error' %}
            background: #fef2f2;
            color: #dc2626;
          {% endif %}
        ">
          {{ properties.status | title }}
        </div>
        {% endif %}
      </div>
    `
  }
};
```

### Dynamic Icons

```jinja
<!-- Icon based on type -->
{% if nodeType == 'database' %}
  <div style="font-size: 32px;">🗄️</div>
{% elif nodeType == 'service' %}
  <div style="font-size: 32px;">⚙️</div>
{% elif nodeType == 'queue' %}
  <div style="font-size: 32px;">📬</div>
{% else %}
  <div style="font-size: 32px;">📦</div>
{% endif %}

<!-- Icon from properties -->
{% if properties.icon %}
  <div style="font-size: 32px;">{{ properties.icon }}</div>
{% else %}
  <div style="font-size: 32px;">📦</div>
{% endif %}

<!-- Conditional icon background -->
<div style="
  padding: 12px;
  border-radius: 8px;
  {% if isExternal %}
    background: #fef2f2;
    border: 2px dashed #ef4444;
  {% else %}
    background: #eff6ff;
    border: 2px solid #3b82f6;
  {% endif %}
">
  {{ icon }}
</div>
```

---

## Advanced CSS Techniques

### Gradients

```css
/* Linear gradient */
.gradient-node {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Multiple gradients */
.multi-gradient {
  background:
    linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%,
    rgba(118, 75, 162, 0.9) 100%),
    url('pattern.png');
}

/* Conic gradient */
.conic-gradient-node {
  background: conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6);
}
```

### Box Shadows

```css
/* Layered shadows for depth */
.depth-node {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 4px 6px rgba(0, 0, 0, 0.08),
    0 10px 20px rgba(0, 0, 0, 0.04);
}

/* Colored shadow */
.colored-shadow-node {
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
}

/* Inner shadow */
.inset-shadow-node {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### Animations

```css
/* Keyframe animation */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.pulse-node {
  animation: pulse 2s infinite;
}

/* Hover transition */
.smooth-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.smooth-transition:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}
```

### Responsive Nodes

```css
/* Responsive font sizes */
.responsive-node {
  font-size: clamp(12px, 2vw, 16px);
}

/* Conditional styling */
@media (max-width: 600px) {
  .responsive-node {
    padding: 8px;
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .animated-node {
    animation: none;
  }
}
```

### Glassmorphism

```css
/* Glass effect */
.glass-node {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Glass with gradient */
.glass-gradient-node {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
```

---

## Styling Workflows

### Workflow 1: Quick Styling with Inline Styles

**Best for**: Simple, one-off customizations

```typescript
// Step 1: Create node with inline styles
const node: Node = {
  id: 'node-1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    label: 'My Node'
  },
  style: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderRadius: 12,
    padding: 16
  }
};
```

### Workflow 2: Reusable Styles with CSS Classes

**Best for**: Reusable styling across multiple nodes

```typescript
// Step 1: Define CSS class
const customCSS = `
.prod-node {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  padding: 16px;
  color: white;
}

.prod-node::before {
  content: 'PROD';
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
}
`;

// Step 2: Add CSS to diagram
diagram.customCSS = customCSS;

// Step 3: Apply class to nodes
const node: Node = {
  id: 'node-1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    label: 'Production DB',
    cssClass: 'prod-node'
  }
};
```

### Workflow 3: Dynamic Templates

**Best for**: Complex, data-driven styling

```typescript
// Step 1: Define template
const template = `
  <div class="service-status-card" style="
    padding: 16px;
    border-radius: 12px;
    text-align: center;
    background: var(--diagram-surface);
    border: 2px solid var(--diagram-border);
  ">
    {% if icon %}
    <div style="font-size: 32px; margin-bottom: 8px;">{{ icon }}</div>
    {% endif %}
    <h3 style="font-weight: 600; margin: 8px 0;">{{ label }}</h3>

    {% if properties.status %}
    <div class="status-indicator" style="
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin: 8px auto;
      {% if properties.status == 'healthy' %}
        background: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3);
      {% elif properties.status == 'error' %}
        background: #ef4444;
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3);
      {% else %}
        background: #f59e0b;
        box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.3);
      {% endif %}
    "></div>
    {% endif %}

    {% if properties.version %}
    <div style="font-size: 11px; color: var(--diagram-text-muted);">
      v{{ properties.version }}
    </div>
    {% endif %}
  </div>
`;

// Step 2: Apply template
const node: Node = {
  id: 'node-1',
  type: 'service',
  position: { x: 100, y: 100 },
  data: {
    label: 'API Service',
    icon: '⚙️',
    properties: {
      status: 'healthy',
      version: '2.0.0'
    },
    jinjaTemplate: template
  }
};
```

### Workflow 4: Template + CSS Combo

**Best for**: Maximum flexibility

```typescript
// Step 1: Define template (structure only)
const template = `
  <div class="service-card">
    <div class="icon">{{ icon }}</div>
    <h3 class="title">{{ label }}</h3>
    <div class="status-badge">{{ properties.status }}</div>
  </div>
`;

// Step 2: Define CSS (styling only)
const css = `
.service-card {
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  border: 2px solid var(--diagram-border);
  background: var(--diagram-background);
  transition: all 0.2s ease;
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.service-card .icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.service-card .title {
  font-weight: 600;
  color: var(--diagram-text);
  margin: 8px 0;
}

.service-card .status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.service-card[data-status="healthy"] .status-badge {
  background: var(--diagram-success);
  color: white;
}

.service-card[data-status="error"] .status-badge {
  background: var(--diagram-error);
  color: white;
}
`;

// Step 3: Apply to diagram and node
diagram.customCSS = css;

const node: Node = {
  id: 'node-1',
  type: 'service',
  position: { x: 100, y: 100 },
  data: {
    label: 'API Service',
    icon: '⚙️',
    properties: {
      status: 'healthy'
    },
    jinjaTemplate: template,
    cssClass: 'service-card',
    // Pass properties as data attributes for CSS
    cssId: undefined  // Could set dynamically
  }
};
```

---

## Advanced Examples

### Database Node with Visual Properties

```jinja
<div class="database-node" style="
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  border: 3px solid {{ style.borderColor or '#ca8a04' }};
  background: {{ style.backgroundColor or '#ffffff' }};
">
  <!-- Icon with cylinder effect -->
  <div style="
    position: relative;
    width: 60px;
    height: 40px;
    margin: 0 auto 12px;
    background: linear-gradient(180deg,
      {{ style.borderColor or '#ca8a04' }} 0%,
      {{ lighten(style.borderColor or '#ca8a04', 20) }} 50%,
      {{ style.borderColor or '#ca8a04' }} 100%
    );
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  ">
    <div style="
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 20px;
      color: white;
    ">
      {{ icon or '🗄️' }}
    </div>
  </div>

  <!-- Label -->
  <h3 style="
    font-weight: 600;
    color: {{ style.color or '#1f2937' }};
    margin: 8px 0;
  ">{{ label }}</h3>

  <!-- Database type badge -->
  {% if properties.databaseType %}
  <div style="
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: #fef3c7;
    color: #d97706;
    margin-top: 4px;
  ">
    {{ properties.databaseType }}
  </div>
  {% endif %}

  <!-- Properties -->
  {% if properties %}
  <div style="
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid {{ style.borderColor or '#e5e7eb' }};
    font-size: 11px;
    color: #6b7280;
  ">
    {% if properties.version %}
    <div>Version: {{ properties.version }}</div>
    {% endif %}
    {% if properties.host %}
    <div>Host: {{ properties.host }}</div>
    {% endif %}
  </div>
  {% endif %}
</div>
```

### Microservice Node with Health Status

```jinja
<div class="microservice" data-health="{{ properties.health or 'unknown' }}" style="
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid {% if properties.health == 'healthy' %}#10b981{% elif properties.health == 'degraded' %}#f59e0b{% else %}#ef4444{% endif %};
  background: var(--diagram-surface);
  min-width: 180px;
">
  <!-- Header -->
  <div style="
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  ">
    <div style="font-size: 24px;">{{ icon or '⚙️' }}</div>
    <div class="health-indicator" style="
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: {% if properties.health == 'healthy' %}#10b981{% elif properties.health == 'degraded' %}#f59e0b{% else %}#ef4444{% endif %};
      box-shadow: 0 0 8px {% if properties.health == 'healthy' %}rgba(16, 185, 129, 0.5){% elif properties.health == 'degraded' %}rgba(245, 158, 11, 0.5){% else %}rgba(239, 68, 68, 0.5){% endif %};
      animation: pulse 2s infinite;
    "></div>
  </div>

  <!-- Title -->
  <h3 style="
    font-weight: 600;
    font-size: 14px;
    color: var(--diagram-text);
    margin: 0 0 4px 0;
  ">{{ label }}</h3>

  <!-- Description -->
  {% if description %}
  <p style="
    font-size: 12px;
    color: var(--diagram-text-secondary);
    margin: 0 0 8px 0;
    line-height: 1.4;
  ">{{ description | truncate(60) }}</p>
  {% endif %}

  <!-- Metrics -->
  {% if properties %}
  <div class="metrics" style="
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  ">
    {% if properties.requests %}
    <div class="metric" style="
      padding: 4px 8px;
      background: var(--diagram-background);
      border-radius: 6px;
      font-size: 10px;
      color: var(--diagram-text-secondary);
    ">
      <span style="font-weight: 600;">{{ properties.requests }}</span> req/s
    </div>
    {% endif %}
    {% if properties.latency %}
    <div class="metric" style="
      padding: 4px 8px;
      background: var(--diagram-background);
      border-radius: 6px;
      font-size: 10px;
      color: {{ properties.latency | int > 100 ? '#ef4444' : '#10b981' }};
    ">
      {{ properties.latency }}ms
    </div>
    {% endif %}
  </div>
  {% endif %}

  <!-- Tags -->
  {% if properties.tags %}
  <div style="
    margin-top: 8px;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  ">
    {% for tag in properties.tags %}
    <span class="tag" style="
      padding: 2px 6px;
      background: var(--diagram-primary-light);
      color: var(--diagram-primary-dark);
      border-radius: 4px;
      font-size: 9px;
      font-weight: 500;
    ">{{ tag }}</span>
    {% endfor %}
  </div>
  {% endif %}
</div>
```

---

## See Also

- [Overview](./overview.md) - Styling system overview
- [Node Types](./node-types.md) - Node component reference
- [CSS System](./css-system.md) - CSS service and security
- [Themes](./themes.md) - Theme system
- [C4 Styling](./c4-styling.md) - C4 model specific styling
