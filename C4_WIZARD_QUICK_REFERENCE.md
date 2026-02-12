# C4 Wizard - Quick Reference Guide

## What is the C4 Wizard?

The C4 Wizard is a 5-step guided interface for creating C4 architecture diagrams. It helps users choose the right diagram level, starting point, configuration, and initial elements.

## How to Use

### Opening the Wizard

1. Navigate to the Editor page
2. Click the "New C4 Diagram" button in the header (purple/pink gradient button)
3. The wizard modal will open

### Step 1: Choose C4 Level

**Options:**
- 🌍 **System Context** - Big picture view for non-technical stakeholders
- 📦 **Container** - High-level technical building blocks
- 🧩 **Component** - Internal structure design
- 💻 **Code** - Implementation details (rarely used)

**Guidance:** Each option shows:
- Description of what the level covers
- When to use it
- Example elements
- Scope badge

### Step 2: Select Starting Point

**Options:**
- **Blank Canvas** - Start from empty diagram
- **Architecture Template** - Use pre-built pattern (fastest)
- **Import Existing** - Load from JSON/YAML file

**If Template Selected:**
- Browse architecture templates
- Filter by category
- View template details (nodes, connections)
- Select a template

### Step 3: Configure Diagram

**Required Fields:**
- **Diagram Name** - Max 100 characters

**Optional Fields:**
- **Description** - Max 500 characters
- **Scope** - Enterprise / System / Container
- **Stakeholders** - Only for System Context diagrams

**Tips:**
- Use clear, descriptive names
- Include business context in description
- List all stakeholders for System Context diagrams

### Step 4: Add Initial Elements

**Features:**
- 🔍 **Search** - Find C4 elements by name
- 🏷️ **Filter** - Filter by category
- 👁️ **View Toggle** - Grid or List view
- ✨ **Add Recommended** - Quick-add common elements

**Categories:**
- 👤 People
- 🏢 Software Systems
- 📦 Containers
- 🧩 Components
- 🗄️ Infrastructure
- 🔧 Other

**Selection:**
- Click elements to add/remove
- Selected elements show green checkmark
- "Clear all" button to reset

### Step 5: Review and Create

**Review Summary Shows:**
- C4 Level with icon
- Starting Point selection
- Diagram Name and Description
- Scope
- Stakeholders (if any)
- Initial Elements count

**Before Creating:**
- Verify all selections are correct
- Read "What happens next" section
- Click "Create Diagram" button

## Keyboard Shortcuts

- **Enter** - Proceed to next step (or create on final step)
- **Escape** - Close wizard (with save prompt)
- **Tab** - Navigate between inputs

## Wizard State

The wizard auto-saves your progress to localStorage. If you close and reopen, you can resume from where you left off.

**Saved State Includes:**
- Selected C4 level
- Starting point and template
- Diagram name, description, scope
- Stakeholders list
- Selected elements
- Last visited step

## After Creation

Once you click "Create Diagram":

1. Diagram is created and saved to IndexedDB
2. You're automatically redirected to the Editor
3. Canvas opens with your new diagram
4. Initial elements are positioned in a grid
5. You can now:
   - Add more elements from C4 Preset Gallery
   - Connect elements by dragging
   - Customize styling with CSS editor
   - Arrange elements with Layout controls
   - Export as PNG/SVG

## Tips & Best Practices

### Choosing the Right C4 Level

| Use Case | Recommended Level |
|----------|------------------|
| Explaining system to executives | System Context |
| Design discussions with architects | Container |
| Implementation with developers | Component |
| Code reviews | Code (rare) |

### Naming Conventions

✅ **Good Names:**
- "E-Commerce System Context"
- "Payment Service Container View"
- "Order Processing Components"

❌ **Avoid:**
- "Diagram 1"
- "My Diagram"
- "Untitled"

### Common Workflows

**Workflow 1: Quick Start**
1. Select System Context
2. Choose "Blank Canvas"
3. Enter name: "My System Context"
4. Add 2-3 recommended elements
5. Create

**Workflow 2: Template-Based**
1. Select Container level
2. Choose "Architecture Template"
3. Select "Microservices API"
4. Customize name and description
5. Create

**Workflow 3: Detailed Design**
1. Select Component level
2. Choose "Blank Canvas"
3. Add comprehensive description
4. Select 10+ elements
5. Add stakeholders
6. Create

## Troubleshooting

### Wizard Won't Open
- Check browser console for errors
- Ensure Editor page is loaded
- Try refreshing the page

### Validation Errors
- **Step 1:** Must select a C4 level
- **Step 2:** Must select starting point; if template, must choose one
- **Step 3:** Diagram name is required (max 100 chars)
- **Step 4:** Always valid (elements are optional)
- **Step 5:** All previous steps must be valid

### Diagram Creation Fails
- Check browser console for error details
- Ensure IndexedDB is available
- Try clearing browser cache
- Check localStorage quota

### Resume Not Working
- Check localStorage is enabled
- Clear wizard state: `localStorage.removeItem('c4-wizard-state')`
- Restart wizard from beginning

## Component Locations

**Main Files:**
- Wizard: `frontend/src/components/c4/wizard/C4Wizard.tsx`
- Steps: `frontend/src/components/c4/wizard/C4WizardStep*.tsx`
- Service: `frontend/src/services/c4/wizard.ts`
- Types: `frontend/src/components/c4/wizard/types.ts`

**Integration:**
- Editor: `frontend/src/pages/Editor.tsx`
- C4 Index: `frontend/src/components/c4/index.ts`

## Related Features

- **C4 Preset Gallery** - Browse and add C4 elements
- **Architecture Templates** - Pre-built diagram patterns
- **Diagram Canvas** - Visual editing interface
- **CSS Editor** - Custom styling
- **Export Controls** - PNG/SVG export

## Technical Details

**State Management:**
- React useState for component state
- localStorage for persistence
- Auto-save with 500ms debounce

**Validation:**
- Per-step validation functions
- Real-time error messages
- Visual error states

**Navigation:**
- Step number (1-5)
- Back button (disabled on step 1)
- Next/Create button
- Click step indicators to jump

**Styling:**
- Tailwind CSS utilities
- Gradient backgrounds
- Responsive design
- Mobile-friendly

## Future Enhancements

- Import from file (actual implementation)
- Custom element creation
- Live diagram preview
- More architecture templates
- Collaborative sharing
- Analytics integration
- Advanced configuration options
