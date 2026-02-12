# Functional Requirements Specification

**Version**: 1.0
**Last Updated**: 2026-01-25
**Status**: Draft

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [User Personas](#user-personas)
3. [Functional Requirements](#functional-requirements)
4. [Use Cases and User Stories](#use-cases-and-user-stories)
5. [Business Rules](#business-rules)
6. [Constraints and Assumptions](#constraints-and-assumptions)

---

## Executive Summary

The Custom Architecture Platform is a web-based tool for creating, visualizing, and managing software architecture diagrams. It provides a hybrid approach combining both visual drag-and-drop editing and code-based diagram definitions, with full CSS customization capabilities for every element.

### Key Differentiators

- **Full HTML/CSS Customization**: Each node is a customizable `<div>` that can contain any HTML content
- **Template System**: Reusable node templates for consistent design
- **Hybrid Editing**: Visual and code editors that sync bidirectionally
- **Hierarchical Navigation**: Drill-down into child diagrams via sidebar tree navigation
- **C4 Model Support**: Native support for C4 architecture diagrams plus generic diagram types

---

## User Personas

### 1. Architecture Author (Primary User)
**Role**: Software Architect, Technical Lead, System Designer

**Goals**:
- Create clear architecture diagrams to communicate system design
- Document software systems at multiple levels of abstraction
- Maintain consistent visual standards across diagrams
- Drill down from high-level views to detailed implementation

**Pain Points**:
- Existing tools limit customization
- Difficulty maintaining consistency across diagrams
- Hard to represent complex system relationships
- Limited ability to show hierarchical drill-down

### 2. Architecture Reviewer (Secondary User)
**Role**: Developer, Stakeholder, Technical Manager

**Goals**:
- Understand system architecture through diagrams
- Navigate from high-level context to detailed components
- Review and provide feedback on designs
- Access diagrams via version history

### 3. Template Designer (Advanced User)
**Role**: UX Designer, Architecture Standards Lead

**Goals**:
- Create consistent visual templates for team use
- Define CSS themes for organization branding
- Establish diagramming standards and best practices

---

## Functional Requirements

### Priority Legend
- **Must Have (MVP)**: Required for initial release
- **Should Have (Phase 2)**: Important but can be deferred
- **Could Have (Phase 3+)**: Nice to have, lower priority
- **Won't Have**: Explicitly out of scope

---

### 1. Diagram Creation & Editing (Must Have)

#### FR-1.1: Visual Diagram Editor
The system SHALL provide a drag-and-drop visual editor for creating diagrams.

**Acceptance Criteria**:
- Users can drag nodes from a palette onto the canvas
- Users can move nodes by dragging to reposition
- Users can resize nodes by dragging corner handles
- Users can create connections between nodes by dragging from one node to another
- Users can select multiple nodes for batch operations
- Users can delete selected nodes and connections

#### FR-1.2: Code-Based Diagram Definition
The system SHALL provide a code editor for defining diagrams programmatically.

**Acceptance Criteria**:
- Code editor with syntax highlighting and autocomplete
- Support for JSON and YAML formats
- Real-time validation of diagram definitions
- Error messages with line numbers and descriptions
- Code examples and templates available

#### FR-1.3: Bidirectional Sync
The system SHALL synchronize changes between visual and code editors automatically.

**Acceptance Criteria**:
- Changes in visual editor immediately update code editor
- Changes in code editor immediately update visual canvas
- Both editors remain in consistent state
- Conflict resolution if both editors change simultaneously

#### FR-1.4: Diagram Types
The system SHALL support multiple diagram types.

**Acceptance Criteria**:
- System Context diagrams
- Container diagrams
- Component diagrams
- Generic/flexible diagram types
- Users can select diagram type when creating new diagram

---

### 2. Node Customization (Must Have)

#### FR-2.1: HTML Content Nodes
Each node SHALL be a customizable HTML container.

**Acceptance Criteria**:
- Nodes can contain any valid HTML content
- Support for text, images, lists, tables
- Support for nested HTML elements
- Sanitization to prevent security issues (XSS)
- HTML content renders correctly in visual editor

#### FR-2.2: Custom CSS Styling
The system SHALL allow custom CSS styling for individual nodes.

**Acceptance Criteria**:
- Each node has unique `id` attribute
- Each node can have multiple `class` attributes
- Custom CSS can target nodes by `id` or `class`
- CSS supports all standard properties (color, font, spacing, borders, etc.)
- CSS changes apply immediately with live preview

#### FR-2.3: Template System
The system SHALL support creation and reuse of node templates.

**Acceptance Criteria**:
- Users can create templates from existing nodes
- Templates can include HTML content and CSS styling
- Templates can be saved with descriptive names
- Users can browse and select from template library
- Applying a template copies all properties to target node
- Templates are stored per-user or globally (configurable)

---

### 3. Layout & Navigation (Must Have)

#### FR-3.1: Manual Positioning
The system SHALL allow users to manually position nodes.

**Acceptance Criteria**:
- Users can drag nodes to any position on canvas
- Positions are saved and restored
- Snap-to-grid option available
- Alignment guides when moving nodes
- Undo/redo for position changes

#### FR-3.2: Automatic Layout
The system SHALL provide automatic layout algorithms.

**Acceptance Criteria**:
- Auto-layout button available in toolbar
- Multiple layout algorithms available (hierarchical, force-directed, etc.)
- Configurable layout parameters (spacing, direction, alignment)
- Can apply to entire diagram or selected subset
- Users can switch between manual and auto layout

#### FR-3.3: Hierarchical Drill-Down Navigation
The system SHALL support hierarchical navigation between diagrams.

**Acceptance Criteria**:
- Nodes can link to child diagrams
- Clicking a linked node navigates to child diagram
- Breadcrumb trail shows navigation path
- Users can navigate back to parent diagram
- Visual indication when node has child diagram

#### FR-3.4: Sidebar Tree Navigation
The system SHALL provide a sidebar tree view of diagram hierarchy.

**Acceptance Criteria**:
- Tree shows all diagrams in hierarchical structure
- Tree is expandable/collapsible
- Clicking tree node navigates to that diagram
- Current diagram highlighted in tree
- Tree updates when diagrams are added/removed

---

### 4. Connections & Relationships (Must Have)

#### FR-4.1: Connection Creation
The system SHALL allow users to create connections between nodes.

**Acceptance Criteria**:
- Drag from source node to target node to create connection
- Connections snap to node edges
- Visual feedback during connection creation
- Connections route automatically around nodes
- Can delete connections by selecting and pressing Delete

#### FR-4.2: Connection Styling
The system SHALL support multiple connection styles.

**Acceptance Criteria**:
- Solid lines
- Dashed lines
- Dotted lines
- Arrowheads (start, end, both)
- Custom line thickness
- Custom line color
- Labels on connections

---

### 5. Import & Export (Must Have)

#### FR-5.1: JSON Export
The system SHALL allow users to export diagrams as JSON.

**Acceptance Criteria**:
- Export option in File menu
- Export includes all diagram data (nodes, edges, styles, metadata)
- JSON follows defined schema
- File download triggers automatically

#### FR-5.2: JSON Import
The system SHALL allow users to import diagrams from JSON.

**Acceptance Criteria**:
- Import option in File menu
- File browser for selecting JSON file
- Validation of imported JSON against schema
- Error messages if JSON is invalid
- Imported diagram opens in editor

#### FR-5.3: YAML Support
The system SHALL support YAML format for import/export.

**Acceptance Criteria**:
- YAML export option
- YAML import option
- Conversion between JSON and YAML
- Validation of YAML structure

#### FR-5.4: Image Export
The system SHALL allow users to export diagrams as images.

**Acceptance Criteria**:
- Export as PNG
- Export as SVG (vector format)
- Export entire canvas or selected area
- Configurable resolution/DPI
- Transparent or colored background options

---

### 6. Themes & Styling (Must Have)

#### FR-6.1: Theme System
The system SHALL provide multiple pre-built themes.

**Acceptance Criteria**:
- Light theme
- Dark theme
- Additional color scheme themes
- Theme switcher in UI
- Themes affect entire application
- User's theme preference is saved

#### FR-6.2: Custom CSS Per Diagram
The system SHALL allow users to add custom CSS to individual diagrams.

**Acceptance Criteria**:
- CSS editor panel available
- CSS applies to current diagram only
- Standard CSS syntax supported
- Live preview of CSS changes
- CSS saved with diagram

---

### 7. Code Editor (Should Have)

#### FR-7.1: Monaco Editor Integration
The system SHALL provide a full-featured code editor.

**Acceptance Criteria**:
- Monaco Editor (VS Code's editor) integration
- Syntax highlighting for JSON and YAML
- Autocomplete for diagram properties
- Error checking and validation
- Minimap for code navigation
- Multiple cursors and selections

#### FR-7.2: Split View
The system SHALL support split-view editing.

**Acceptance Criteria**:
- Side-by-side visual and code editors
- Adjustable split ratio
- Collapse/expand either panel
- Synchronized scrolling

---

### 8. Version Control (Should Have)

#### FR-8.1: Version History
The system SHALL track diagram version history.

**Acceptance Criteria**:
- Each save creates a new version
- Version list shows timestamp and author
- Users can view previous versions
- Users can restore previous versions
- Version comparison shows differences

#### FR-8.2: Git Integration
The system SHALL integrate with git for version control.

**Acceptance Criteria**:
- Each diagram save creates a git commit
- Commit messages include diagram name and change summary
- Git history viewable in application
- Branch and merge support (optional)

---

### 9. Collaboration Features (Could Have)

#### FR-9.1: Comments
The system SHALL allow users to add comments to diagrams.

**Acceptance Criteria**:
- Comments can be added to diagrams
- Comments can be added to specific nodes
- Comments show author and timestamp
- Comments can be edited and deleted
- Comment threads for discussions

#### FR-9.2: Shareable Links
The system SHALL allow users to share diagrams via links.

**Acceptance Criteria**:
- Generate shareable URL for diagram
- URL contains embedded diagram data
- View-only mode for shared links
- Optional password protection
- Expiration dates for links (optional)

---

### 10. C4 Model Support (Should Have)

#### FR-10.1: C4 Diagram Types
The system SHALL provide native support for C4 model diagrams.

**Acceptance Criteria**:
- System Context diagram preset
- Container diagram preset
- Component diagram preset
- Code diagram preset (optional)
- Appropriate shapes and icons for each level

#### FR-10.2: Architecture Templates
The system SHALL provide templates for common architecture patterns.

**Acceptance Criteria**:
- Microservices architecture template
- Monolithic architecture template
- Event-driven architecture template
- Layered architecture template
- Serverless architecture template

---

## Use Cases and User Stories

### UC-1: Create System Context Diagram

**As an** Architecture Author
**I want to** create a System Context diagram
**So that** I can show my system and its external dependencies

**Scenario**:
1. User creates new diagram
2. Selects "System Context" type
3. Uses template library to add system node
4. Adds external system nodes
5. Creates connections between nodes
6. Adds descriptions and labels
7. Exports diagram as PNG for documentation

### UC-2: Drill Down to Container Diagram

**As an** Architecture Reviewer
**I want to** click on a system node to see its containers
**So that** I can understand the internal structure

**Scenario**:
1. User views System Context diagram
2. Hovering over system node shows it has children
3. Clicking node navigates to Container diagram
4. Breadcrumb shows path: Context → Container
5. User clicks breadcrumb to return to Context

### UC-3: Create Reusable Component Template

**As an** Template Designer
**I want to** create a template for database nodes
**So that** all database nodes look consistent

**Scenario**:
1. User creates a node with database icon
2. Adds HTML content with database name and type
3. Writes custom CSS for styling (blue border, cylinder icon)
4. Saves node as "Database Node" template
5. Other users can now apply this template

### UC-4: Define Diagram in Code

**As an** Architecture Author
**I want to** define my diagram using YAML
**So that** I can version control it easily

**Scenario**:
1. User opens code editor
2. Writes YAML defining nodes and connections
3. Editor validates syntax and shows errors
4. Visual canvas updates in real-time
5. User saves diagram

### UC-5: Export Diagram for Documentation

**As an** Architecture Author
**I want to** export my diagram as SVG
**So that** I can include it in technical documentation

**Scenario**:
1. User completes diagram
2. Selects "Export as SVG"
3. Chooses transparent background
4. Downloads SVG file
5. Includes SVG in Markdown documentation

---

## Business Rules

### BR-1: Node Constraints
- Nodes must have unique IDs within a diagram
- Nodes must have at least a label
- Nodes cannot be larger than canvas size
- Minimum node size: 50x50 pixels

### BR-2: Connection Constraints
- Connections must link two valid nodes
- Nodes cannot connect to themselves
- Multiple connections can exist between same nodes
- Connections must have unique IDs

### BR-3: Diagram Hierarchy
- Maximum nesting depth: 5 levels
- Each diagram can have multiple child diagrams
- Circular references are not allowed
- Parent diagram must exist before creating child

### BR-4: CSS Constraints
- Custom CSS is scoped to current diagram canvas
- CSS cannot modify application UI (only diagram elements)
- **Dangerous CSS properties are blocked**:
  - `position` (fixed, absolute) - can break UI layout
  - `z-index` - can interfere with app UI layers
  - `pointer-events` - can block user interactions
  - `display: none/contents` - can hide essential elements
  - `opacity` - can make elements invisible
  - `overflow` - can cause scroll issues
  - `javascript:`, `expression()`, `behavior` - XSS vectors
  - `@import` - can load malicious stylesheets
  - `<script>`, `onerror=`, `onload=` - script injection
- CSS properties are validated against allowlist before application
- Maximum CSS size: 64KB per diagram

### BR-5: File Size Limits
- Maximum diagram JSON size: 5MB
- Maximum template size: 1MB
- Maximum total workspace size: 100MB

---

## Constraints and Assumptions

### Technical Constraints

1. **Browser Support**: Modern browsers with ES2020+ support
2. **Screen Size**: Minimum 1280x720 resolution
3. **JavaScript**: Must be enabled
4. **Local Storage**: Used for caching and preferences

### Security Constraints

1. **XSS Prevention**: All HTML content must be sanitized
2. **CSS Injection**: Filter dangerous CSS properties
3. **File Upload**: Validate all imported files
4. **Authentication**: Azure AD integration required for multi-user

### Performance Constraints

1. **Rendering**: Diagram must render within 2 seconds for 100 nodes
2. **Response Time**: UI actions must respond within 100ms
3. **Memory**: Maximum 500MB memory usage
4. **File Size**: Individual diagrams limited to 5MB

### Assumptions

1. **Users**: Technical users familiar with architecture diagrams
2. **Network**: Stable internet connection for cloud deployment
3. **Training**: Minimal training required due to intuitive UI
4. **Data Loss**: Auto-save every 30 seconds to prevent data loss

---

## Out of Scope (Won't Have)

The following features are explicitly out of scope for initial releases:

1. **Real-time Collaboration**: Multiple users editing simultaneously (Phase 6)
2. **Mobile Support**: Native mobile apps (responsive web only)
3. **Offline Mode**: Application requires internet connection
4. **Video/Audio**: No multimedia content in diagrams
5. **3D Diagrams**: Only 2D diagrams supported
6. **AI Generation**: No AI-assisted diagram generation
7. **Database**: No backend database in MVP (file-based storage)
8. **Public Gallery**: No shared diagram gallery
9. **Payment Processing**: Free tool, no payments needed

---

## Glossary

- **Node**: A visual element in a diagram representing a component
- **Edge/Connection**: A line connecting two nodes showing a relationship
- **Canvas**: The editable area where diagrams are created
- **Diagram**: A complete visual representation with nodes and connections
- **Template**: A reusable configuration for nodes
- **C4 Model**: An architectural model for software systems (Context, Container, Component, Code)
- **Drill-Down**: Navigation from high-level to detailed diagrams
- **Hierarchy**: Tree structure of related diagrams

---

**End of Functional Requirements Specification v1.0**
