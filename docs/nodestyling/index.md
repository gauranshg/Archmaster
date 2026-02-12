# Node Styling Documentation

Complete guide to styling nodes in the Custom Architecture Platform.

## Quick Navigation

- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Examples](#examples)
- [API Reference](#api-reference)

---

## Getting Started

### New to Node Styling?

Start here:

1. **[Overview](./overview.md)** - Complete overview of the styling system
   - Architecture and layers
   - Quick start examples
   - Styling methods comparison
   - Best practices

2. **[Node Types Reference](./node-types.md)** - Learn about each node type
   - C4 model nodes (Person, System, Container, etc.)
   - Generic nodes (Custom, Database, Service)
   - Visual states and color schemes
   - Usage examples

3. **[Quick Examples](#quick-examples)** - Copy-paste examples
   - Basic styling
   - Common patterns
   - Custom templates

### Experienced Developer?

Jump to advanced topics:

- **[Custom Styling](./custom-styling.md)** - Advanced techniques
  - Jinja templates with conditionals and loops
  - Dynamic styling based on data
  - Complex CSS animations

- **[CSS System](./css-system.md)** - Security and scoping
  - CSS validation and sanitization
  - Automatic scoping
  - Security best practices

- **[C4 Styling](./c4-styling.md)** - C4 model specifics
  - Official C4 notation
  - Hierarchy levels
  - C4 color palette

---

## Documentation

### Core Documentation

#### [Overview](./overview.md)
**Comprehensive guide to the node styling system**

- Styling architecture and layers
- Available styling methods (Inline, CSS Classes, Jinja, Custom CSS)
- Quick start examples
- Security features
- Performance considerations
- Troubleshooting

**Read this first** to understand the complete styling system.

#### [Node Types Reference](./node-types.md)
**Complete reference for all node types**

- C4 Model nodes (Person, Software System, Container, Component, Database, Queue)
- Generic nodes (Custom, Database, Service)
- Visual states and colors
- Features and capabilities
- Usage examples for each type

**Use this** to understand each node type's styling options.

#### [CSS System](./css-system.md)
**CSS service and security validation**

- CSS service API (validateCSS, sanitizeCSS, scopeCSS)
- Security features (pattern detection, sanitization)
- CSS scoping mechanism
- Validation rules
- Best practices
- Troubleshooting

**Use this** when working with custom CSS to ensure security.

#### [Themes](./themes.md)
**Theme system and customization**

- Built-in themes (Light, Dark, Blue, Green, High-Contrast)
- Theme structure and API
- CSS variables
- Creating custom themes
- Theme switching
- System theme detection

**Use this** to customize the overall appearance or create themes.

### Advanced Documentation

#### [Custom Styling](./custom-styling.md)
**Advanced custom styling techniques**

- CSS classes and IDs
- Jinja templates (variables, conditionals, loops, filters)
- Dynamic styling based on data
- Advanced CSS (gradients, animations, glassmorphism)
- Styling workflows (inline, classes, templates, combo)
- Real-world examples

**Use this** for complex, data-driven styling.

#### [C4 Styling](./c4-styling.md)
**C4 model specific styling**

- C4 notation basics
- Element types and their styling
- Official C4 color palette
- Styling rules (external/internal, hierarchy)
- C4 diagram examples (System Context, Container, Component)
- C4 presets

**Use this** when creating C4 model diagrams.

#### [Style Properties](./style-properties.md)
**Complete property reference**

- All available style properties
- Property types and defaults
- Usage examples
- Common style patterns
- Performance considerations
- Style inheritance

**Use this** as a reference for available styling options.

---

## Quick Examples

### Basic Node Styling

```typescript
// Simple styled node
const node: Node = {
  id: 'node-1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    label: 'My Node',
    cssClass: 'highlighted'
  },
  style: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16
  }
};
```

### C4 Node with Jinja Template

```typescript
// C4 person with dynamic template
const person: Node = {
  id: 'person-1',
  type: 'c4Person',
  position: { x: 100, y: 100 },
  data: {
    label: 'User',
    description: 'Application user',
    icon: '👤',
    properties: {
      role: 'Admin',
      department: 'Engineering'
    },
    c4Metadata: {
      isExternal: false,
      technology: 'Web Browser'
    },
    jinjaTemplate: `
      <div style="padding: 12px; text-align: center;">
        <div style="font-size: 28px;">{{ icon }}</div>
        <h3 style="font-weight: 600;">{{ label }}</h3>
        {% if description %}
        <p style="font-size: 11px; color: #6b7280;">{{ description }}</p>
        {% endif %}
        {% if properties %}
        <div style="margin-top: 8px; font-size: 10px;">
          {% for key, value in properties.items() %}
          <div>{{ key }}: {{ value }}</div>
          {% endfor %}
        </div>
        {% endif %}
      </div>
    `
  }
};
```

### Custom CSS with Scoping

```typescript
// Add custom CSS to diagram
const diagram: Diagram = {
  id: 'diagram-1',
  customCSS: `
    /* Scoped to this diagram */
    .highlighted {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #f59e0b;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
  `
};

// Apply class to node
const node: Node = {
  id: 'node-1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    label: 'Important Node',
    cssClass: 'highlighted'
  }
};
```

---

## Examples by Use Case

### 1. Status Indicators

Show node status with visual indicators:

```jinja
<div class="status-card" data-status="{{ properties.status }}">
  <h3>{{ label }}</h3>
  <div class="status-indicator"></div>
</div>
```

```css
.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

[data-status="healthy"] .status-indicator {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

[data-status="error"] .status-indicator {
  background: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}
```

### 2. Technology Badges

Display technology with styled badges:

```jinja
<div class="service-card">
  <h3>{{ label }}</h3>
  <div class="tech-badge">{{ technology }}</div>
</div>
```

```css
.tech-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--diagram-primary-light);
  color: var(--diagram-primary-dark);
}
```

### 3. Properties Display

Show node properties as key-value pairs:

```jinja
{% if properties %}
<div class="properties-section">
  {% for key, value in properties.items() %}
  <div class="property-item">
    <span class="property-key">{{ key }}:</span>
    <span class="property-value">{{ value }}</span>
  </div>
  {% endfor %}
</div>
{% endif %}
```

### 4. Drill-Down Indicators

Show which nodes have child diagrams:

```jinja
<div class="node-wrapper">
  {{ content }}

  {% if childDiagramId %}
  <div class="drill-down-indicator"
       title="Double-click to view details"
       onclick="navigateToDiagram('{{ childDiagramId }}')">
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M12 4l-8 8m0 0l8 8" stroke="currentColor" fill="none" stroke-width="2"/>
    </svg>
  </div>
  {% endif %}
</div>
```

---

## Common Patterns

### Gradient Backgrounds

```typescript
// Linear gradient
const gradientNode: Node = {
  style: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
};
```

### Glassmorphism

```jinja
<div style="
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 16px;
">
  {{ label }}
</div>
```

### Hover Effects

```css
.my-node {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.my-node:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}
```

---

## API Reference

### TypeScript Interfaces

```typescript
// Node interface
interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
  style?: NodeStyle;
}

// NodeData interface
interface NodeData {
  label: string;
  description?: string;
  icon?: string;
  image?: string;
  cssClass?: string;
  cssId?: string;
  jinjaTemplate?: string;
  properties?: Record<string, unknown>;
  [key: string]: any;
}

// NodeStyle interface
interface NodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  padding?: number;
  margin?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  boxShadow?: string;
  opacity?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  customCSS?: Record<string, string>;
}
```

### CSS Service API

```typescript
// Validate CSS
cssService.validateCSS(css: string): ValidationResult;

// Sanitize CSS
cssService.sanitizeCSS(css: string): string;

// Scope CSS to diagram
cssService.scopeCSS(css: string, scopeId: string): string;

// Extract CSS classes
cssService.extractClassNames(css: string): string[];

// Generate style element ID
cssService.generateStyleId(prefix?: string): string;
```

### Jinja Service API

```typescript
// Render Jinja template
renderJinjaTemplate(
  templateString: string,
  context: JinjaTemplateContext
): TemplateRenderResult;

// Validate Jinja template
validateJinjaTemplate(templateString: string): TemplateValidationResult;

// Build context from node data
buildTemplateContext(nodeData: NodeData): JinjaTemplateContext;

// Get built-in filters
getBuiltinFilters(): JinjaFilter[];
```

---

## Learning Path

### Beginner

1. Start with **[Overview](./overview.md)**
2. Try basic examples in **[Node Types](./node-types.md)**
3. Learn about inline styles

### Intermediate

4. Explore **[Themes](./themes.md)**
5. Learn CSS classes and IDs
6. Understand **[CSS System](./css-system.md)** security

### Advanced

7. Master **[Custom Styling](./custom-styling.md)**
8. Learn Jinja templates
9. Study **[C4 Styling](./c4-styling.md)** notation
10. Reference **[Style Properties](./style-properties.md)**

---

## Tips & Tricks

### 1. Use Theme Variables

```css
/* Good - Theme-aware */
.my-node {
  background: var(--diagram-node-background);
  border-color: var(--diagram-node-border);
}
```

### 2. Leverage Templates

```typescript
// Create reusable templates
const databaseTemplate = `
  <div class="database-template">
    <h3>{{ label }}</h3>
    <div class="type">{{ properties.databaseType }}</div>
  </div>
`;

// Apply to multiple nodes
nodes.forEach(node => {
  node.data.jinjaTemplate = databaseTemplate;
});
```

### 3. Validate CSS

```typescript
// Always validate before applying
const validation = cssService.validateCSS(customCSS);
if (!validation.isValid) {
  console.error('Invalid CSS:', validation.errors);
  return;
}
```

### 4. Use Meaningful Classes

```css
/* Good - Semantic */
.database-primary { }
.service-rest-api { }
.node-external { }

/* Avoid - Presentational */
.red-node { }
.big-node { }
.styled-node { }
```

---

## Troubleshooting

### Common Issues

**Issue**: Styles not applying
- **Solution**: Check CSS specificity and scoping

**Issue**: Template not rendering
- **Solution**: Validate Jinja syntax and check context variables

**Issue**: Colors looking wrong
- **Solution**: Verify theme CSS variables are loaded

**Issue**: Performance problems
- **Solution**: Reduce template complexity, limit CSS animations

---

## Related Documentation

- **[Functional Requirements](../functional-requirements.md)** - Feature specifications
- **[UI/UX Specification](../ui-ux-specification.md)** - UI guidelines
- **[Data Model Specification](../data-model-specification.md)** - Data structures

---

## Changelog

### Version 1.0.0 (2026-01-27)

- Initial documentation release
- Complete node styling system documentation
- C4 model styling guide
- CSS system and security guide
- Theme system documentation

---

## Contributing

Found a documentation issue? Want to improve the styling system?

1. Check existing documentation
2. Make your improvements
3. Test thoroughly
4. Submit a pull request

---

## Support

For questions or issues:
- Check troubleshooting sections
- Review API reference
- See example code
- Check the main documentation

**Happy styling! 🎨**
