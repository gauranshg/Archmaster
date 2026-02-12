# Claude Agents - Custom Architecture Platform

This directory contains specialized subagents for building the Custom Architecture Platform, following Claude's recommended agent specification format with YAML frontmatter.

## Agent Overview

| Agent | Specialization | File |
|-------|---------------|------|
| **diagram-developer** | React Flow, canvas, nodes, edges, layouts | `agents/diagram-developer.md` |
| **editor-developer** | Monaco, JSON/YAML, bidirectional sync | `agents/editor-developer.md` |
| **ui-developer** | Navigation, properties, dialogs, theming | `agents/ui-developer.md` |
| **backend-developer** | Azure Functions, APIs, Cosmos DB | `agents/backend-developer.md` |
| **platform-developer** | Azure AD, deployment, infrastructure | `agents/platform-developer.md` |

## When to Use Each Agent

### diagram-developer
**Use for:**
- Canvas and viewport work
- Node creation, positioning, styling
- Edge routing and labeling
- Layout algorithms (Dagre, ELK)
- Export to PNG/SVG
- Template-based nodes

**Example prompts:**
- "Add resize handles to nodes"
- "Implement Dagre auto-layout"
- "Export current diagram as PNG"
- "Create a database icon node type"

### editor-developer
**Use for:**
- Monaco editor setup
- JSON/YAML parsing and validation
- Bidirectional sync logic
- Schema validation
- Code formatting

**Example prompts:**
- "Set up Monaco with YAML syntax highlighting"
- "Implement YAML to diagram parsing"
- "Add JSON schema validation with error markers"
- "Sync visual changes to code with debouncing"

### ui-developer
**Use for:**
- App layout and shell
- Sidebar navigation
- Properties panel
- Dialogs and modals
- Theming (light/dark mode)
- Responsive design

**Example prompts:**
- "Create properties panel for selected nodes"
- "Build sidebar tree with diagram hierarchy"
- "Add theme toggle with light/dark modes"
- "Create new diagram dialog"

### backend-developer
**Use for:**
- Azure Functions endpoints
- Pydantic models
- Cosmos DB operations
- Blob Storage (exports)
- Business logic and validation

**Example prompts:**
- "Create GET /diagrams endpoint"
- "Implement diagram save with Pydantic validation"
- "Add PNG export to Blob Storage"
- "Validate node/edge references before save"

### platform-developer
**Use for:**
- Azure AD authentication
- RBAC and authorization
- Azure Static Web Apps deployment
- Docker configuration
- CI/CD pipelines
- Infrastructure as Code (Bicep/Terraform)

**Example prompts:**
- "Set up Azure AD login with MSAL"
- "Configure RBAC roles (viewer, editor, admin)"
- "Create Azure Static Web Apps deployment"
- "Write Bicep for Cosmos DB infrastructure"

## Agent Collaboration

The agents are designed to minimize delegation while maintaining clear boundaries:

```
User Request
    ↓
[ui-developer] receives action
    ↓ (if diagram-related)
[diagram-developer] updates canvas
    ↓ (needs sync)
[editor-developer] updates code
    ↓ (needs save)
[backend-developer] persists to DB
    ↑ (requires auth)
[platform-developer] validates token
```

## Typical Workflows

### Creating a New Diagram
1. **ui-developer**: Create new diagram dialog
2. **diagram-developer**: Initialize empty canvas
3. **editor-developer**: Initialize empty JSON/YAML
4. **backend-developer**: Save to Cosmos DB

### Editing a Node
1. **ui-developer**: User selects node in properties panel
2. **diagram-developer**: Render node selection on canvas
3. **editor-developer**: Update JSON representation
4. **diagram-developer**: Re-render node with changes

### Auto-Layout
1. **ui-developer**: User clicks "Auto Layout" button
2. **diagram-developer**: Apply Dagre/ELK algorithm
3. **editor-developer**: Sync new positions to code
4. **backend-developer**: Save updated diagram

### Exporting to PNG
1. **ui-developer**: User clicks export dropdown
2. **diagram-developer**: Generate PNG from canvas
3. **backend-developer**: Upload to Blob Storage
4. **ui-developer**: Display download link

## Best Practices

1. **Start with the right agent** - Match your request to the specialist
2. **Let agents coordinate** - They know when to involve other agents
3. **Provide context** - Reference related files or previous work
4. **Test incrementally** - Each agent should validate their work

## File Structure Reference

```
custom-platform/
├── frontend/src/
│   ├── components/diagram/    → diagram-developer
│   ├── components/editor/     → editor-developer
│   ├── components/layout/     → ui-developer
│   ├── components/properties/ → ui-developer
│   ├── services/auth.ts       → platform-developer
│   └── services/api.ts        → ui-developer (client)
└── api/
    ├── functions/             → backend-developer
    ├── model/                 → backend-developer
    ├── db/                    → backend-developer
    └── utils/auth.py          → platform-developer
```

## Agent Specification Format

All agents follow Claude's recommended specification format with YAML frontmatter:

```yaml
---
name: agent-name
description: "Multi-line description with examples and use cases"
model: sonnet
color: color-name
---

# Agent content follows...
```

### Frontmatter Fields:
- **name**: Agent identifier (used for invocation)
- **description**: Detailed description with trigger examples and proactive use cases
- **model**: Default Claude model (sonnet, haiku, or opus)
- **color**: Visual identifier for the agent

### Agent Content:
Each agent file includes:
- Core responsibilities
- Technical standards with code examples
- Security priorities
- Code quality standards
- Workflow patterns
- Collaboration boundaries
- Decision-making framework

---

**Total Agents**: 5
**Delegation Depth**: Max 2-3 hops per task
**Philosophy**: Specialized enough for expertise, general enough to avoid delegation chains
