# UI/UX Design Specification

**Version**: 1.0
**Last Updated**: 2026-01-25
**Status**: Draft

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Layout Structure](#layout-structure)
3. [User Interface Components](#user-interface-components)
4. [Interaction Patterns](#interaction-patterns)
5. [Visual Design](#visual-design)
6. [Accessibility Requirements](#accessibility-requirements)
7. [Responsive Design Strategy](#responsive-design-strategy)

---

## Design Principles

### 1. Simplicity First

- **Clean Interface**: Minimal clutter, focus on content
- **Progressive Disclosure**: Show advanced features only when needed
- **Clear Hierarchy**: Visual hierarchy guides user attention

### 2. Efficiency

- **Keyboard Shortcuts**: Power user features for common actions
- **Quick Actions**: Right-click context menus
- **Drag-and-Drop**: Intuitive interactions throughout

### 3. Consistency

- **Predictable Layout**: Consistent component placement
- **Visual Language**: Unified color, typography, spacing
- **Interaction Patterns**: Same gestures work everywhere

### 4. Feedback

- **Immediate Response**: Visual feedback for all actions
- **Status Indicators**: Loading states, errors, success messages
- **Progress Indication**: Show progress for long operations

### 5. Accessibility

- **Keyboard Navigation**: All features accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: WCAG AA compliant contrast ratios

---

## Layout Structure

### Overall Layout: Web Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  Header (60px)                                                   │
│  ┌──────────┬─────────────────────────────────┬──────────────────┐
│  │ Logo     │  Search                         │  User Profile    │
│  └──────────┴─────────────────────────────────┴──────────────────┘
├──────────┬─────────────────────────────────────────┬──────────────┤
│          │                                         │              │
│  Sidebar │  Main Content Area                     │  Right Panel  │
│  (280px) │  (Flexible)                            │  (320px)      │
│          │                                         │              │
│  ┌──────┐│  ┌──────────────────────────────────┐ │  ┌──────────┐ │
│  │ Tree ││  │                                   │ │  │          │ │
│  │      ││  │       Canvas Area                 │ │  │  Props   │ │
│  │ Nav  ││  │       (React Flow)                │ │  │          │ │
│  │      ││  │                                   │ │  │          │ │
│  ├──────┤│  │   ┌─────┐    ┌─────┐              │ │  ├──────────┤ │
│  │Temp- ││  │   │     │    │     │              │ │  │          │ │
│  │lates ││  │   │ N1  │────│ N2  │              │ │  │  Styles  │ │
│  │      ││  │   └─────┘    └─────┘              │ │  │          │ │
│  │      ││  │                                   │ │  │          │ │
│  └──────┘│  └──────────────────────────────────┘ │  └──────────┘ │
│          │                                         │              │
│          │  Toolbar (48px)                         │  ┌──────────┐ │
│          │  ┌───┬───┬───┬───┬───┬───┐            │  │          │ │
│          │  │ + │ ↔ │ ⊞ │ △ │ ▽ │ ? │            │  │  Layers  │ │
│          │  └───┴───┴───┴───┴───┴───┘            │  │          │ │
│          │                                         │  └──────────┘ │
└──────────┴─────────────────────────────────────────┴──────────────┘
```

---

### Header (60px height, fixed)

**Purpose**: Global navigation and controls

**Components**:
- Logo (left): Platform name and icon
- Search (center-left): Search diagrams, templates, nodes
- Breadcrumb (center): Navigation path for drill-down
- Actions (right):
  - Theme toggle (light/dark mode)
  - Share button
  - Export button
  - User profile menu

**States**:
- Default: All controls visible
- Search focused: Search input expands
- Drill-down active: Breadcrumb shows hierarchy

---

### Sidebar (280px width, collapsible)

**Purpose**: Navigation and component library

**Tabs**:
1. **Diagram Tree** (default)
2. **Template Library**
3. **Component Palette** (drag-drop)

**Diagram Tree**:
- Hierarchical tree view of all diagrams
- Expandable/collapsible nodes
- Icons indicate diagram type
- Current diagram highlighted
- Drag-drop to reorder (future)

**Template Library**:
- Categorized template cards
- Thumbnail preview
- Template name and description
- Click to apply to selected node

**Component Palette**:
- Draggable node shapes
- Connection types
- Icons and symbols

---

### Main Content Area (flexible width)

**Purpose**: Diagram canvas and primary workspace

**Components**:
- **Canvas**: React Flow diagram area
- **Toolbar**: Quick actions for common operations
- **Minimap**: Navigation overview (bottom-right, draggable)

**Canvas Features**:
- Pan and zoom
- Node selection (single and multi-select)
- Connection creation
- Background grid (optional)
- Infinite canvas

**Toolbar** (48px height, horizontal):
- Add node
- Layout options
- Zoom in/out
- Fit to screen
- Undo/redo
- Help

---

### Right Panel (320px width, collapsible)

**Purpose**: Properties and styling controls

**Tabs**:
1. **Properties** (default)
2. **Styles**
3. **Layers**

**Properties Tab**:
- Selected item properties
- Node: label, type, icon, description
- Edge: label, type, arrowheads
- Position and size inputs
- Custom fields

**Styles Tab**:
- Visual style controls
- Color pickers (fill, stroke, text)
- Font controls (size, weight)
- Border controls (width, style, radius)
- Spacing controls (padding, margin)
- Custom CSS editor

**Layers Tab**:
- List of all nodes and edges
- Visibility toggles
- Lock/unlock items
- Layer ordering (z-index)

---

## User Interface Components

### 1. Canvas Component

**Responsibilities**:
- Render diagram using React Flow
- Handle pan and zoom
- Manage node selection
- Enable connection creation

**Visual Design**:
- Background: Light gray (#f8f9fa) with optional grid
- Grid pattern: Dots or lines (configurable)
- Selection highlight: Blue border (#2196f3, 2px)
- Connection points: Small circles (8px) on hover

**States**:
- **Idle**: Waiting for user interaction
- **Panning**: User dragging canvas
- **Connecting**: Creating new edge (showing preview line)
- **Selecting**: Dragging selection rectangle

---

### 2. Custom Node Component

**Structure**:
```
┌────────────────────────────┐
│  Selection Border          │
│  ┌──────────────────────┐  │
│  │  Drag Handle (top)   │  │
│  │  ┌────────────────┐  │  │
│  │  │                │  │  │
│  │  │  HTML Content  │  │  │
│  │  │                │  │  │
│  │  └────────────────┘  │  │
│  │                       │  │
│  │  Resize Handles ──────│  │
│  └──────────────────────┘  │
│  Connection Points (◉)     │
└────────────────────────────┘
```

**Visual Design**:
- Default: White background, gray border
- Selected: Blue highlight border
- Hover: Slightly expanded shadow
- Dragging: Elevated shadow (elevation)

**Resize Handles** (8px squares):
- Corners: Top-left, top-right, bottom-left, bottom-right
- Cursor changes to resize arrows
- Shift-drag: Maintain aspect ratio

**Connection Points** (8px circles):
- Position: Top, right, bottom, left edges
- Visible on hover or always (configurable)
- Color: Blue (#2196f3)
- Drag from point to create edge

---

### 3. Code Editor Component

**Layout**:
- Full editor when in "Code" view mode
- Split pane (50/50) in "Split" view mode
- Collapsible in "Visual" view mode

**Features**:
- Monaco editor integration
- Minimap (right side, collapsible)
- Line numbers (left gutter)
- Syntax highlighting
- Error squiggles (red underline)
- Autocomplete suggestions
- Multiple tabs for multiple files (future)

**Toolbar Actions**:
- Format document
- Validate
- Sync with visual view
- Copy to clipboard

---

### 4. Sidebar Tree Component

**Visual Design**:
- Tree structure with indentation (20px per level)
- Folder icons for expand/collapse
- Leaf icons for diagram types
- Current diagram: Bold text, blue highlight

**Interactions**:
- Click triangle: Expand/collapse
- Click label: Navigate to diagram
- Right-click: Context menu (rename, delete, duplicate)

**Icons**:
- System Context: 🌍
- Container: 📦
- Component: 🧩
- Generic: 📄
- Folder: 📁 (collapsed), 📂 (expanded)

---

### 5. Template Library Component

**Card Design**:
```
┌─────────────────────────┐
│  ┌───────────────────┐  │
│  │                   │  │
│  │   Thumbnail       │  │
│  │   (Preview)       │  │
│  │                   │  │
│  └───────────────────┘  │
│  Template Name          │
│  Category               │
│  [Apply] [Preview]      │
└─────────────────────────┘
```

**Layout**:
- Grid layout (2 columns)
- Scrollable vertically
- Search and filter bar (top)

**Card Actions**:
- Click: Apply to selected node
- Double-click: Preview in modal
- Right-click: Edit, delete, duplicate

---

### 6. Properties Panel

**Sections**:

**1. Basic Properties**
- Label (text input)
- Description (textarea)
- Type (dropdown: C4 types or custom)
- Icon (icon picker)

**2. Position & Size**
- X position (number input)
- Y position (number input)
- Width (number input)
- Height (number input)
- Lock position (checkbox)

**3. Hierarchy**
- Parent diagram (readonly, clickable)
- Child diagram (link to create or navigate)

**4. Custom Data**
- Key-value pairs (dynamic add/remove)
- JSON editor for advanced users

---

### 7. Styles Panel

**Visual Style Controls**:

**1. Colors**
- Fill color (color picker)
- Border color (color picker)
- Text color (color picker)
- Preset palettes (swatches)

**2. Typography**
- Font family (dropdown)
- Font size (number + unit)
- Font weight (dropdown: normal, bold, etc.)
- Text alignment (icon buttons)

**3. Border**
- Border width (slider: 0-10px)
- Border style (dropdown: solid, dashed, dotted)
- Border radius (slider: 0-50px)

**4. Spacing**
- Padding (number input or slider)
- Margin (number input or slider)

**5. Effects**
- Shadow (dropdown: none, small, medium, large)
- Opacity (slider: 0-100%)

**6. Custom CSS** (collapsible section)
- Textarea for raw CSS
- Syntax highlighting
- Live preview
- Validate button

---

## Interaction Patterns

### Navigation

#### Drill-Down Navigation

**Flow**:
1. User hovers over node with child diagram
2. Cursor changes to pointer
3. Tooltip shows "Click to view details"
4. User clicks node
5. Main canvas updates to show child diagram
6. Breadcrumb updates with new path

**Breadcrumb**:
```
Home > My Workspace > System Context > Web Application
```
- Each segment is clickable
- Current segment is bold
- Chevron separators (>)
- Hover: Blue underline

**Back Navigation**:
- Browser back button works
- Breadcrumb clicks
- Keyboard shortcut (Esc or Alt+Left)

---

#### Sidebar Tree Navigation

**Flow**:
1. User clicks tree node
2. Canvas updates to show selected diagram
3. Tree highlights current selection
4. Tree auto-expands to show current diagram

**Keyboard**:
- Arrow keys: Navigate up/down
- Enter: Open diagram
- Left/Right: Expand/collapse (on folders)
- Home/End: First/last item

---

### Editing

#### Add Node

**Methods**:
1. **Drag from Palette**: Drag node type to canvas
2. **Toolbar Button**: Click "Add Node" button
3. **Keyboard Shortcut**: Ctrl+N (Cmd+N)
4. **Double-Click Canvas**: Create node at position

**Behavior**:
- New node appears at center or clicked position
- Auto-selected after creation
- Default name: "Node N" (incrementing)
- Focus on label input in properties panel

---

#### Edit Node

**Methods**:
1. **Double-Click Node**: Open inline editor for label
2. **Properties Panel**: Edit all properties
3. **Code Editor**: Edit in JSON/YAML

**Inline Editor**:
- Text overlay on node
- Auto-focus on double-click
- Enter: Save, Esc: Cancel

---

#### Delete Node

**Methods**:
1. **Select + Delete Key**: Keyboard shortcut
2. **Right-Click Menu**: Context menu → Delete
3. **Properties Panel**: Delete button (bottom)

**Confirmation**:
- Single node: No confirmation
- Multiple nodes: Confirmation dialog
- Node with child diagram: Warning dialog

---

#### Connect Nodes

**Flow**:
1. Hover over source node
2. Connection points appear (4 points)
3. Drag from connection point
4. Preview line follows cursor
5. Release on target node
6. Edge created

**Keyboard Alternative**:
1. Select source node
2. Hold Shift
3. Click target node
4. Edge created

---

#### Select Multiple

**Methods**:
1. **Ctrl+Click**: Add to selection
2. **Shift+Click**: Range selection
3. **Drag Rectangle**: Select all within rectangle
4. **Ctrl+A**: Select all nodes

**Visual Feedback**:
- All selected nodes have blue border
- Selection rectangle appears while dragging

---

#### Move Nodes

**Flow**:
1. Click and drag node
2. Node follows cursor
3. Snapping to grid (if enabled)
4. Alignment guides appear (optional)
5. Release to place

**Keyboard**:
- Select node(s)
- Arrow keys: Move by 10px
- Shift+Arrow: Move by 1px
- Ctrl+Arrow: Move by 50px

---

#### Resize Nodes

**Flow**:
1. Hover over corner/edge
2. Cursor changes to resize arrows
3. Drag to resize
4. Shift+Drag: Maintain aspect ratio
5. Release to finish

**Constraints**:
- Minimum size: 50x50px
- Maximum size: Canvas limits
- Snap to grid (if enabled)

---

### Drag-and-Drop

#### From Palette to Canvas

**Flow**:
1. Drag item from component palette
2. Ghost preview follows cursor
3. Drop on canvas
4. Node created at drop position

---

#### From Template Library

**Flow**:
1. Drag template card
2. Ghost preview follows cursor
3. Drop on canvas
4. Node created with template applied

---

#### Reorder in Tree (Future)

**Flow**:
1. Drag tree node
2. Drop indicator shows new position
3. Release to reorder
4. Hierarchy updated

---

### Context Menus

#### Node Context Menu

**Options**:
- Edit
- Duplicate
- Delete
- Lock/Unlock
- Bring to Front/Send to Back
- Create Child Diagram
- Apply Template (submenu)

---

#### Canvas Context Menu

**Options**:
- Paste (if clipboard has content)
- Add Node
- Auto Layout (submenu)
- Fit View
- Zoom In/Out
- Reset View

---

#### Edge Context Menu

**Options**:
- Edit Label
- Delete
- Reverse Direction
- Change Type (submenu)
- Animate (toggle)

---

## Visual Design

### Color System

#### Light Theme

```css
/* Primary Colors */
--primary: #2196f3;          /* Blue - Primary actions */
--primary-hover: #1976d2;    /* Darker blue */
--primary-light: #bbdefb;    /* Light blue for backgrounds */

/* Neutral Colors */
--background: #ffffff;       /* White background */
--surface: #f8f9fa;         /* Light gray for panels */
--border: #e0e0e0;          /* Gray borders */
--text-primary: #212121;    /* Main text */
--text-secondary: #757575;  /* Secondary text */
--text-disabled: #bdbdbd;   /* Disabled text */

/* Status Colors */
--success: #4caf50;         /* Green */
--warning: #ff9800;         /* Orange */
--error: #f44336;           /* Red */
--info: #2196f3;            /* Blue */

/* Accent Colors */
--accent-purple: #9c27b0;
--accent-pink: #e91e63;
--accent-teal: #009688;
```

#### Dark Theme

```css
/* Primary Colors */
--primary: #64b5f6;         /* Lighter blue for dark mode */
--primary-hover: #42a5f5;
--primary-light: #1e88e5;

/* Neutral Colors */
--background: #121212;      /* Almost black */
--surface: #1e1e1e;         /* Dark gray for panels */
--border: #333333;          /* Darker gray borders */
--text-primary: #ffffff;    /* White text */
--text-secondary: #b0b0b0;  /* Light gray text */
--text-disabled: #666666;   /* Darker gray text */

/* Status Colors */
--success: #81c784;
--warning: #ffb74d;
--error: #e57373;
--info: #64b5f6;
```

---

### Typography

**Font Families**:
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

**Font Sizes**:
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

**Font Weights**:
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

### Spacing System

**Scale** (based on 4px grid):
```css
--spacing-0: 0;
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-5: 1.25rem;  /* 20px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-10: 2.5rem;  /* 40px */
--spacing-12: 3rem;    /* 48px */
--spacing-16: 4rem;    /* 64px */
```

---

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

---

### Border Radius

```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-full: 9999px;   /* Pill shape */
```

---

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance

#### Color Contrast

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text (18px+)**: Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

**Implementation**:
- Use color contrast checker tools
- Provide high contrast theme option
- Never rely on color alone to convey meaning

---

#### Keyboard Navigation

**Requirements**:
- All interactive elements accessible via keyboard
- Visible focus indicator (2px solid outline)
- Logical tab order
- Keyboard shortcuts documented

**Tab Order**:
1. Skip to main content link
2. Header (search, theme toggle, user menu)
3. Sidebar tree
4. Canvas
5. Right panel tabs
6. Panel controls
7. Footer (if present)

**Focus Indicators**:
```css
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

---

#### Screen Reader Support

**ARIA Labels**:
```html
<!-- Button with icon -->
<button aria-label="Add new node">
  <Icon name="plus" />
</button>

<!-- Diagram tree -->
<ul role="tree">
  <li role="treeitem" aria-expanded="true">
    System Context
  </li>
</ul>

<!-- Canvas -->
<div role="application" aria-label="Diagram canvas">
  <!-- Nodes and edges -->
</div>
```

**Live Regions**:
- Error messages: `role="alert"`
- Success messages: `role="status"`
- Loading indicators: `aria-busy="true"`

---

#### Semantic HTML

- Use proper heading hierarchy (h1-h6)
- Use `<nav>` for navigation areas
- Use `<main>` for primary content
- Use `<aside>` for sidebars
- Use `<button>` for actions, `<a>` for links

---

### Reduced Motion

**Respect User Preferences**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Design Strategy

### Breakpoints

```css
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Small desktop */
--breakpoint-xl: 1280px;  /* Desktop (primary target) */
--breakpoint-2xl: 1536px; /* Large desktop */
```

---

### Layout Adaptations

#### Desktop (1280px+)
- Full layout with sidebar and right panel
- Optimal viewing experience

#### Small Desktop (1024px - 1279px)
- Both panels collapsible
- Sidebar width: 240px (reduced from 280px)
- Right panel width: 280px (reduced from 320px)

#### Tablet (768px - 1023px)
- Sidebar: Off-canvas slide-in
- Right panel: Modal overlay
- Toolbar moves to bottom
- Touch-optimized interactions

#### Mobile (< 768px)
- **Not supported** (out of scope for MVP)
- Future: Consider separate mobile app or responsive redesign

---

### Touch Optimizations (Tableat)

**Minimum Touch Target**: 44x44px (Apple HIG)

**Gestures**:
- Single tap: Select
- Double tap: Edit
- Long press: Context menu
- Pinch: Zoom in/out
- Two-finger drag: Pan

---

## Animation & Transitions

### Duration

```css
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### Easing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Transitions

```css
/* Hover effects */
.button {
  transition: background-color var(--duration-fast) var(--ease-in-out);
}

/* Panel slide */
.sidebar {
  transition: transform var(--duration-base) var(--ease-out);
}

/* Fade in */
.modal {
  animation: fadeIn var(--duration-base) var(--ease-out);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## Icons

### Icon Library: Lucide React

**Rationale**:
- Tree-shakeable (import only used icons)
- Consistent 24x24px design
- Stroke-based (easily customizable)
- Covers all needed icons

**Common Icons**:
- Navigation: `chevron-right`, `chevron-down`, `home`, `menu`
- Actions: `plus`, `trash`, `edit`, `copy`, `save`
- File: `file`, `folder`, `download`, `upload`
- View: `eye`, `eye-off`, `zoom-in`, `zoom-out`
- Diagram: `box`, `circle`, `database`, `server`, `user`

---

## Summary

This UI/UX specification provides:

1. **Clear layout structure** with dashboard-style interface
2. **Detailed component designs** for all major UI elements
3. **Comprehensive interaction patterns** for common user actions
4. **Visual design system** with colors, typography, and spacing
5. **Accessibility requirements** meeting WCAG AA standards
6. **Responsive strategy** for different screen sizes

The design prioritizes:
- **Simplicity** and ease of use
- **Efficiency** for power users
- **Consistency** across the application
- **Accessibility** for all users

---

**End of UI/UX Design Specification v1.0**
