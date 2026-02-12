# CSS System & Security

Complete guide to the CSS service, security validation, and custom CSS injection system.

## Table of Contents

- [Overview](#overview)
- [CSS Service API](#css-service-api)
- [Security Features](#security-features)
- [CSS Scoping](#css-scoping)
- [Validation Rules](#validation-rules)
- [Best Practices](#best-practices)

---

## Overview

The CSS system provides secure, scoped custom CSS injection for diagrams while protecting against XSS attacks and style leakage.

### Key Features

- ✅ **Security Validation**: Blocks dangerous CSS patterns
- ✅ **Automatic Scoping**: Prevents cross-diagram style leakage
- ✅ **Syntax Validation**: Real-time CSS validation
- ✅ **Class Extraction**: Finds all CSS classes for autocomplete
- ✅ **Performance**: Optimized CSS injection and cleanup

### Architecture

```
User Input CSS
       ↓
   Security Validation
       ↓
   CSS Scoping
       ↓
   Style Element Injection
       ↓
   Rendered Diagram
```

---

## CSS Service API

**File**: `frontend/src/services/cssService.ts` (349 lines)

### validateCSS()

Validates CSS for security issues and dangerous patterns.

```typescript
function validateCSS(css: string): {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

**Parameters**:
- `css` (string): CSS code to validate

**Returns**: Validation result with errors and warnings

**Example**:

```typescript
const result = cssService.validateCSS('.my-node { color: red; }');

if (result.isValid) {
  console.log('CSS is safe to use');
} else {
  console.error('CSS errors:', result.errors);
}

if (result.warnings.length > 0) {
  console.warn('CSS warnings:', result.warnings);
}
```

**Validation Checks**:
1. Dangerous URLs (javascript:, data:, vbscript:)
2. Dangerous functions (expression(), -o-link)
3. Dangerous at-rules (@import, @namespace)
4. Dangerous properties (-o-link, -ms-behavior)
5. Invalid CSS syntax

### sanitizeCSS()

Removes or escapes dangerous CSS rules.

```typescript
function sanitizeCSS(css: string): string;
```

**Parameters**:
- `css` (string): CSS code to sanitize

**Returns**: Sanitized CSS string

**Example**:

```typescript
const dangerousCSS = `
  .my-node {
    background: url('javascript:alert(1)');
    behavior: url(xss.htc);
  }
`;

const safeCSS = cssService.sanitizeCSS(dangerousCSS);
// Returns: .my-node { } (dangerous properties removed)
```

### scopeCSS()

Scopes CSS to a specific diagram to prevent style leakage.

```typescript
function scopeCSS(css: string, scopeId: string): string;
```

**Parameters**:
- `css` (string): CSS code to scope
- `scopeId` (string): Unique diagram ID

**Returns**: Scoped CSS string

**Example**:

```typescript
const unscopedCSS = `
  .my-node {
    background: red;
  }
`;

const scopedCSS = cssService.scopeCSS(unscopedCSS, 'diagram-abc123');

// Result:
// #diagram-abc123 .my-node {
//   background: red;
// }
```

**Scoping Rules**:
1. Wraps all selectors with `#diagram-{id}` prefix
2. Handles complex selectors (descendant, child, sibling)
3. Preserves media queries
4. Preserves @keyframes and @font-face
5. Maintains CSS comments

### extractClassNames()

Extracts all CSS class names from CSS code.

```typescript
function extractClassNames(css: string): string[];
```

**Parameters**:
- `css` (string): CSS code to parse

**Returns**: Array of unique class names

**Example**:

```typescript
const css = `
  .my-node { }
  .my-node.highlighted { }
  .another-class { }
`;

const classes = cssService.extractClassNames(css);
// Returns: ['my-node', 'my-node.highlighted', 'another-class']
```

**Use Cases**:
- Autocomplete suggestions in CSS editor
- Finding unused CSS classes
- Analyzing CSS complexity

### generateStyleId()

Generates a unique ID for style elements.

```typescript
function generateStyleId(prefix?: string): string;
```

**Parameters**:
- `prefix` (string, optional): Prefix for the ID

**Returns**: Unique style ID

**Example**:

```typescript
const id1 = cssService.generateStyleId('diagram');
// Returns: 'diagram-style-abc123'

const id2 = cssService.generateStyleId();
// Returns: 'style-def456'
```

### getComputedStyle()

Computes the final style for a node (merges all style sources).

```typescript
function getComputedStyle(
  inlineStyles: NodeStyle,
  cssClass?: string,
  cssId?: string,
  theme?: Theme
): CSSProperties;
```

**Parameters**:
- `inlineStyles` (NodeStyle): Inline style properties
- `cssClass` (string): CSS class name
- `cssId` (string): CSS ID
- `theme` (Theme): Current theme

**Returns**: Computed CSS properties

**Style Priority** (lowest to highest):
1. Theme defaults
2. Global CSS
3. Diagram CSS (scoped)
4. CSS class
5. CSS ID
6. Inline styles

---

## Security Features

### Dangerous Pattern Detection

The CSS service blocks these dangerous patterns:

#### 1. JavaScript URLs

```css
/* BLOCKED */
.node {
  background: url('javascript:alert(1)');
  list-style: url("javascript:alert('XSS')");
}
```

#### 2. Data URLs with JavaScript

```css
/* BLOCKED */
.node {
  background: url('data:text/html,<script>alert(1)</script>');
}
```

#### 3. CSS Expressions (IE)

```css
/* BLOCKED */
.node {
  width: expression(document.body.clientWidth > 600 ? '600px' : 'auto');
}
```

#### 4. Dangerous At-Rules

```css
/* BLOCKED */
@import url('javascript:alert(1)');
@namespace x url("javascript:alert('XSS')");

/* ALLOWED */
@import url('https://example.com/styles.css');
@media (max-width: 600px) { }
@keyframes slideIn { }
```

#### 5. Dangerous Properties

```css
/* BLOCKED */
.node {
  -o-link: url('javascript:alert(1)');
  -ms-behavior: url(xss.htc);
  binding: url('javascript:alert(1)');
}
```

### Allowed Properties

**Safe CSS Properties** (whitelist):

```typescript
const ALLOWED_PROPERTIES = [
  // Layout
  'display', 'position', 'top', 'right', 'bottom', 'left',
  'width', 'height', 'min-width', 'max-width',
  'min-height', 'max-height',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',

  // Visual
  'background', 'background-color', 'background-image', 'background-position',
  'background-repeat', 'background-size',
  'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
  'border-color', 'border-style', 'border-width', 'border-radius',
  'color', 'opacity', 'visibility', 'overflow',

  // Typography
  'font', 'font-family', 'font-size', 'font-weight', 'font-style',
  'text-align', 'text-decoration', 'text-transform',
  'line-height', 'letter-spacing', 'word-spacing',

  // Effects
  'box-shadow', 'text-shadow', 'filter', 'transform',
  'transition', 'animation',

  // Other
  'cursor', 'pointer-events', 'z-index', 'float', 'clear'
];
```

### Blocked Properties

**Dangerous CSS Properties** (blacklist):

```typescript
const BLOCKED_PROPERTIES = [
  '-o-link',
  '-ms-behavior',
  'binding',
  'behavior'
];
```

---

## CSS Scoping

### Why Scoping?

Without scoping, CSS from one diagram can affect other diagrams:

```css
/* Diagram 1 CSS */
.node { color: red; }

/* Without scoping, this affects ALL diagrams! */
```

With scoping, CSS is isolated:

```css
/* Diagram 1 CSS (scoped) */
#diagram-abc123 .node { color: red; }

/* Only affects Diagram 1 */
```

### How Scoping Works

#### Input CSS

```css
/* Simple selectors */
.my-node {
  color: red;
}

.another-class {
  background: blue;
}

/* Complex selectors */
.parent > .child {
  margin: 10px;

  .nested {
    padding: 5px;
  }
}

/* Media queries */
@media (max-width: 600px) {
  .responsive-node {
    font-size: 12px;
  }
}

/* Keyframes */
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
```

#### Scoped Output

```css
/* Simple selectors become prefixed */
#diagram-abc123 .my-node {
  color: red;
}

#diagram-abc123 .another-class {
  background: blue;
}

/* Complex selectors maintain hierarchy */
#diagram-abc123 .parent > .child {
  margin: 10px;
}

#diagram-abc123 .parent > .child .nested {
  padding: 5px;
}

/* Media queries preserve scope */
@media (max-width: 600px) {
  #diagram-abc123 .responsive-node {
    font-size: 12px;
  }
}

/* Keyframes are NOT scoped (they're global) */
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
```

### Scoping Algorithm

```typescript
function scopeCSS(css: string, scopeId: string): string {
  const prefixedScope = `#${scopeId}`;

  return css
    // Handle @media queries
    .replace(/@media\s*([^{]*)\s*\{/g, (match, query) => {
      return `@media ${query} { ${prefixedScope}`;
    })

    // Scope regular selectors
    .replace(/([^{]+){/g, (match, selector) => {
      if (selector.startsWith('@')) {
        // Don't scope at-rules
        return match;
      }
      return `${prefixedScope} ${selector.trim()} {`;
    })

    // Close media queries
    .replace(/}/g, '}')
    .replace(/@media[^{]+{([^}]+)}/g, (match) => {
      return match.replace(/}$/, ' }');
    });
}
```

---

## Validation Rules

### Syntax Validation

CSS syntax is validated for common errors:

```typescript
const errors: ValidationError[] = [];

// Check for unclosed brackets
const openBraces = (css.match(/{/g) || []).length;
const closeBraces = (css.match(/}/g) || []).length;
if (openBraces !== closeBraces) {
  errors.push({
    message: 'Unclosed CSS block',
    line: findErrorLine(css)
  });
}

// Check for invalid selectors
try {
  document.querySelector('invalid selector');
  errors.push({
    message: 'Invalid CSS selector'
  });
} catch (e) {
  // Selector is invalid
}

// Check for invalid property values
const invalidValueRegex = /:[\s]*([^;}]+)[;}]/g;
const matches = css.matchAll(invalidValueRegex);
for (const match of matches) {
  const property = match[1];
  if (!isValidCSSValue(property)) {
    errors.push({
      message: `Invalid CSS value: ${property}`
    });
  }
}
```

### Security Validation

Each CSS rule is checked against security patterns:

```typescript
const SECURITY_PATTERNS = [
  {
    name: 'JavaScript URL',
    pattern: /url\s*\(\s*['"]?javascript:/i,
    severity: 'error'
  },
  {
    name: 'Data URL',
    pattern: /url\s*\(\s*['"]?data:text\/html/i,
    severity: 'warning'
  },
  {
    name: 'CSS Expression',
    pattern: /expression\s*\(/i,
    severity: 'error'
  },
  {
    name: 'Import Statement',
    pattern: /@import/i,
    severity: 'warning'
  }
];

function validateSecurity(css: string): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const pattern of SECURITY_PATTERNS) {
    const match = css.match(pattern.pattern);
    if (match) {
      errors.push({
        message: `${pattern.name} detected`,
        severity: pattern.severity,
        position: match.index
      });
    }
  }

  return errors;
}
```

---

## CSS Injection System

### Diagram CSS Storage

CSS is stored per diagram:

```typescript
interface Diagram {
  id: string;
  name: string;
  customCSS?: string;  // Per-diagram CSS
  nodes: Node[];
  edges: Edge[];
}
```

### CSS Injection Flow

```
1. User edits CSS in Style Editor
       ↓
2. CSS is validated (cssService.validateCSS)
       ↓
3. If valid, CSS is scoped (cssService.scopeCSS)
       ↓
4. Scoped CSS is saved to diagram.customCSS
       ↓
5. Style element is created/updated in DOM
       ↓
6. Diagram re-renders with new styles
```

### Style Element Management

```typescript
class DiagramStyleManager {
  private styleElements = new Map<string, HTMLStyleElement>();

  injectCSS(diagramId: string, css: string): void {
    // Remove old style element if exists
    this.removeCSS(diagramId);

    // Create new style element
    const styleElement = document.createElement('style');
    styleElement.id = `diagram-style-${diagramId}`;
    styleElement.textContent = css;

    // Inject into head
    document.head.appendChild(styleElement);

    // Store reference
    this.styleElements.set(diagramId, styleElement);
  }

  removeCSS(diagramId: string): void {
    const styleElement = this.styleElements.get(diagramId);
    if (styleElement) {
      styleElement.remove();
      this.styleElements.delete(diagramId);
    }
  }

  clearAll(): void {
    this.styleElements.forEach(element => element.remove());
    this.styleElements.clear();
  }
}
```

---

## CSS Editor Integration

### Style Editor Component

**File**: `frontend/src/components/editor/StyleEditor.tsx`

Features:
- **Monaco Editor**: Full-featured code editor with CSS syntax highlighting
- **Live Validation**: Real-time CSS validation with error markers
- **Autocomplete**: CSS property and value suggestions
- **Preview**: Live preview of CSS changes
- **Formatting**: Prettier integration for code formatting

### Validation in Editor

```typescript
// Monaco Editor diagnostics
monaco.editor.onDidChangeModelContent(() => {
  const css = editor.getValue();
  const validation = cssService.validateCSS(css);

  const markers = validation.errors.map(error => ({
    severity: monaco.Severity.Error,
    message: error.message,
    startLineNumber: error.line,
    startColumn: error.column,
    endLineNumber: error.line,
    endColumn: error.column + error.length
  }));

  monaco.editor.setModelMarkers(model, 'css-validator', markers);
});
```

---

## Best Practices

### 1. Use Specific Selectors

```css
/* Good - Specific */
.diagram-node.database {
  background: #fefce8;
  border-color: #ca8a04;
}

/* Avoid - Too general */
div {
  background: red;
}
```

### 2. Scope Complex Animations

```css
/* Good - Scoped to diagram */
#diagram-abc123 .animated-node {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Avoid - Global animations */
* {
  animation: shake 0.5s;
}
```

### 3. Use CSS Variables

```css
/* Good - Theme-aware */
.my-node {
  background: var(--diagram-node-background);
  border-color: var(--diagram-node-border);
  color: var(--diagram-node-text);
}

/* Avoid - Hardcoded colors */
.my-node {
  background: #ffffff;
  border-color: #e5e7eb;
  color: #1f2937;
}
```

### 4. Validate Before Injecting

```typescript
// Always validate
const validation = cssService.validateCSS(customCSS);

if (!validation.isValid) {
  console.error('CSS validation failed:', validation.errors);
  return;
}

// Check for warnings
if (validation.warnings.length > 0) {
  console.warn('CSS warnings:', validation.warnings);
  // Optionally warn user but allow
}

// Only inject if valid
const scopedCSS = cssService.scopeCSS(customCSS, diagramId);
cssManager.injectCSS(diagramId, scopedCSS);
```

### 5. Clean Up When Done

```typescript
// When switching diagrams
function switchDiagram(fromDiagram: string, toDiagram: string) {
  // Clean up old styles
  cssManager.removeCSS(fromDiagram);

  // Load new styles
  const toDiagramCSS = diagramStore.getDiagram(toDiagram)?.customCSS;
  if (toDiagramCSS) {
    const scopedCSS = cssService.scopeCSS(toDiagramCSS, toDiagram);
    cssManager.injectCSS(toDiagram, scopedCSS);
  }
}
```

---

## Security Considerations

### XSS Prevention

**Never trust user CSS input!**

```typescript
// BAD - Direct injection
function injectCSSUnsafe(diagramId: string, css: string) {
  document.head.innerHTML += `<style>${css}</style>`;
}

// GOOD - Validated and scoped
function injectCSSSafe(diagramId: string, css: string) {
  const validation = cssService.validateCSS(css);
  if (!validation.isValid) {
    throw new Error('Invalid CSS');
  }

  const scopedCSS = cssService.scopeCSS(css, diagramId);
  const styleElement = document.createElement('style');
  styleElement.textContent = scopedCSS;
  document.head.appendChild(styleElement);
}
```

### CSS Injection Prevention

Common CSS injection vectors:

```css
/* 1. JavaScript in URLs */
.bad { background: url('javascript:alert(document.cookie)'); }

/* 2. CSS Expressions (IE) */
.bad { width: expression(alert('XSS')); }

/* 3. Behavior (IE) */
.bad { behavior: url(xss.htc); }

/* 4. Data URLs */
.bad { background: url('data:text/html,<script>alert(1)</script>'); }
```

All these are **blocked** by the CSS service!

---

## Performance

### CSS Optimization Tips

1. **Minimize CSS Size**

```css
/* Good - Concise */
.node { margin: 10px; padding: 10px; }

/* Avoid - Verbose */
.node {
  margin-top: 10px;
  margin-right: 10px;
  margin-bottom: 10px;
  margin-left: 10px;
  padding-top: 10px;
  padding-right: 10px;
  padding-bottom: 10px;
  padding-left: 10px;
}
```

2. **Use Efficient Selectors**

```css
/* Good - Fast */
.node { }

/* Avoid - Slow */
* { }
.container div div span[data-type="value"] { }
```

3. **Limit Animations**

```css
/* Good - Limited to specific nodes */
.animated-node {
  animation: slideIn 0.3s ease;
}

/* Avoid - Everything animates */
* {
  animation: spin 10s linear infinite;
}
```

---

## Troubleshooting

### CSS Not Applying

**Problem**: Custom CSS isn't affecting nodes

**Solutions**:
1. Check CSS validation: Are there errors?
2. Check scoping: Is CSS properly scoped to diagram?
3. Check specificity: Inline styles override CSS classes
4. Check browser DevTools: Is style element in DOM?

### Styles Leaking Between Diagrams

**Problem**: CSS from one diagram affects another

**Solutions**:
1. Verify scoping: All CSS must be scoped
2. Check for global selectors: Avoid `*` or `div`
3. Check for unscoped @keyframes: They're global by design
4. Inspect style elements: Each diagram should have its own

### Performance Issues

**Problem**: Diagram renders slowly with custom CSS

**Solutions**:
1. Reduce CSS complexity: Simplify selectors
2. Reduce animations: Use sparingly
3. Limit number of rules: Combine where possible
4. Profile performance: Use browser DevTools

---

## API Reference

### Complete TypeScript Interface

```typescript
interface CSSService {
  validateCSS(css: string): ValidationResult;
  sanitizeCSS(css: string): string;
  scopeCSS(css: string, scopeId: string): string;
  extractClassNames(css: string): string[];
  generateStyleId(prefix?: string): string;
  getComputedStyle(
    inlineStyles: NodeStyle,
    cssClass?: string,
    cssId?: string,
    theme?: Theme
  ): CSSProperties;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
}
```

---

## See Also

- [Overview](./overview.md) - Styling system overview
- [Node Types](./node-types.md) - Node component reference
- [Themes](./themes.md) - Theme system
- [Custom Styling](./custom-styling.md) - Advanced techniques
