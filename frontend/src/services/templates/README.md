# Template System

## Overview

The Template System provides a powerful way to create, manage, and reuse node templates in diagrams. Users can save any node as a template, organize them into categories, and quickly add them to diagrams via drag-and-drop.

## Features

- **15+ Built-in Templates**: Pre-configured templates for databases, services, APIs, infrastructure, and more
- **Custom Templates**: Create your own templates from any node
- **Template Library UI**: Beautiful sidebar with grid/list views, search, and category filtering
- **Drag & Drop**: Drag templates from library to canvas
- **Thumbnails**: Auto-generated preview images for templates
- **Categories**: Organize templates by category (database, service, infrastructure, etc.)
- **Tags**: Add custom tags for better searchability
- **IndexedDB Storage**: Templates persist locally in the browser
- **C4 Model Support**: Native support for C4 architecture diagram elements

## Architecture

### Core Components

```
frontend/src/
├── components/
│   ├── sidebar/
│   │   ├── TemplateLibrary.tsx      # Template library sidebar component
│   │   └── SaveTemplateDialog.tsx   # Modal for saving nodes as templates
│   └── diagram/
│       └── Canvas.tsx                # Updated to support template drag-drop
├── services/
│   ├── templates/
│   │   ├── defaultTemplates.ts      # Built-in template definitions
│   │   ├── templateUtils.ts         # Template conversion utilities
│   │   ├── thumbnailGenerator.ts    # Thumbnail generation with html-to-image
│   │   └── index.ts
│   └── storage/
│       └── templateStorage.ts       # IndexedDB CRUD operations (existing)
├── store/
│   └── templateStore.ts             # Zustand store for template state
└── types/
    └── template.ts                  # TypeScript type definitions (existing)
```

## Usage

### 1. Using Built-in Templates

Templates are automatically seeded into IndexedDB on first load:

```typescript
import { useTemplateStore } from '@/store/templateStore';

function MyComponent() {
  const { templates, loadTemplates } = useTemplateStore();

  useEffect(() => {
    loadTemplates();
  }, []);

  return <div>Loaded {templates.length} templates</div>;
}
```

### 2. Displaying Template Library

```typescript
import { TemplateLibrary } from '@/components/sidebar';

function MyDiagramPage() {
  const handleTemplateSelect = (template: Template) => {
    console.log('Selected:', template.name);
  };

  return (
    <TemplateLibrary
      onTemplateSelect={handleTemplateSelect}
      canDelete={true}
    />
  );
}
```

### 3. Dragging Templates to Canvas

The canvas automatically handles template drops. Just drag from the library:

```typescript
// Canvas component handles this automatically
<DiagramCanvas
  diagram={diagram}
  onSelectionChange={handleSelectionChange}
/>
```

### 4. Saving Nodes as Templates

```typescript
import { SaveTemplateDialog } from '@/components/sidebar';

function MyPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

  return (
    <>
      <button onClick={() => setShowDialog(true)}>
        Save as Template
      </button>

      <SaveTemplateDialog
        nodes={selectedNodes}
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSave={(template) => console.log('Saved:', template.name)}
        author="User Name"
      />
    </>
  );
}
```

## Built-in Templates

### Database Category
- **PostgreSQL Database** - Relational database with cylinder icon
- **MongoDB Database** - NoSQL document database

### Service Category
- **REST API** - RESTful API service
- **Microservice** - Generic microservice component

### Infrastructure Category
- **Message Queue** - Queue for async messaging
- **Cache** - In-memory cache layer (Redis, Memcached)
- **Object Storage** - S3/Blob storage

### External Category
- **External API** - Third-party API service
- **External System** - External system or service
- **User** - Human user/actor (C4)
- **Administrator** - System admin (C4)

### Component Category
- **UI Component** - Frontend UI component
- **Component Library** - Reusable component library

### Container Category
- **Web Application** - Web app container
- **Mobile App** - Mobile application

## Template Data Structure

```typescript
interface Template {
  id: string;                    // Unique ID
  name: string;                  // Template name
  description?: string;          // Optional description
  category: TemplateCategory;    // Category (database, service, etc.)
  author: string;                // Creator
  isPublic: boolean;             // Shared with all users
  data: NodeData;                // Node data (label, icon, htmlContent)
  style: NodeStyle;              // CSS styles
  className?: string;            // CSS class
  thumbnail?: string;            // Base64 or URL
  tags?: string[];               // Search tags
  constraints?: NodeConstraints; // Size constraints
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

## Utility Functions

### Template to Node Conversion

```typescript
import { templateToNode } from '@/services/templates';

const template = await getTemplateById('template-database-postgres');
const node = templateToNode(template, { x: 100, y: 100 });

// Result: React Flow Node ready to add to canvas
```

### Node to Template Conversion

```typescript
import { nodeToTemplate, validateTemplate } from '@/services/templates';

const templateData = nodeToTemplate(
  selectedNode,
  'My Template',
  'User',
  'database',
  'Description here'
);

const validation = validateTemplate(templateData);
if (validation.valid) {
  await createTemplate(templateData);
}
```

### Thumbnail Generation

```typescript
import { generateThumbnailFromElement } from '@/services/templates';

const element = document.getElementById('my-node');
const thumbnail = await generateThumbnailFromElement(element, {
  width: 200,
  height: 150,
  quality: 0.9,
});

// thumbnail is base64 data URL
```

## Store Actions

```typescript
const {
  // State
  templates,
  selectedTemplate,
  isLoading,
  error,
  searchQuery,
  activeCategory,

  // Actions
  loadTemplates,
  seedTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  setSelectedTemplate,
  setSearchQuery,
  setActiveCategory,
  getFilteredTemplates,
  getTemplatesByCategory,
  getTemplateById,
  clearError,
  refresh,
} = useTemplateStore();
```

## Customization

### Adding Custom Built-in Templates

Edit `defaultTemplates.ts`:

```typescript
export const DEFAULT_TEMPLATES: BuiltInTemplate[] = [
  {
    id: 'template-my-custom',
    name: 'My Custom Template',
    category: 'custom',
    template: {
      name: 'My Custom Template',
      description: 'Custom template description',
      data: {
        label: 'Custom',
        icon: '🎯',
        htmlContent: '<div>Custom HTML</div>',
      },
      style: {
        backgroundColor: '#f0f0f0',
        borderColor: '#333',
        borderWidth: 2,
        borderRadius: 8,
      },
      isPublic: true,
      tags: ['custom', 'special'],
    },
  },
  // ... more templates
];
```

### Adding New Categories

Update `template.ts` types:

```typescript
export type TemplateCategory =
  | 'database'
  | 'service'
  | 'infrastructure'
  | 'external'
  | 'component'
  | 'container'
  | 'custom'
  | 'my-new-category'; // Add here
```

Update `TemplateLibrary.tsx` category config:

```typescript
const CATEGORY_CONFIG: Record<...> = {
  // ...
  'my-new-category': { label: 'My Category', icon: '🎯', color: '#ff0000' },
};
```

## Performance Considerations

1. **Thumbnails**: Generated thumbnails are base64-encoded. Keep them under 50KB for optimal IndexedDB performance.

2. **Lazy Loading**: The template library only renders visible templates. For large template collections, consider virtualization.

3. **IndexedDB Queries**: Uses indexed fields for fast filtering by category and author.

4. **React Flow Optimization**: Template nodes use `memo()` to prevent unnecessary re-renders.

## Security

1. **HTML Sanitization**: All template HTML content is sanitized with DOMPurify before rendering.

2. **CSS Injection**: CSS classes are validated before application.

3. **Data Validation**: Template data is validated before saving to storage.

## Future Enhancements

- [ ] Template versioning
- [ ] Template import/export (JSON)
- [ ] Template sharing between users
- [ ] Template marketplace
- [ ] Custom template icons
- [ ] Template folders/collections
- [ ] Bulk template operations
- [ ] Template usage analytics
- [ ] AI-powered template suggestions

## Troubleshooting

### Templates not loading

Check IndexedDB is accessible:
```javascript
// Open DevTools Console
indexedDB.open('ArchitecturePlatformDB', 1).onsuccess = (e) => {
  console.log('DB opened:', e.target.result);
};
```

### Thumbnails not generating

Ensure `html-to-image` is installed and the DOM element has dimensions:
```typescript
console.log('Element dimensions:', element.offsetWidth, element.offsetHeight);
```

### Drag-and-drop not working

Check React Flow drag data:
```typescript
onDragStart={(e) => {
  console.log('Drag data:', e.dataTransfer.getData('application/reactflow'));
}}
```

## Related Files

- **Types**: `frontend/src/types/template.ts`
- **Storage**: `frontend/src/services/storage/templateStorage.ts`
- **Store**: `frontend/src/store/templateStore.ts`
- **Demo**: `frontend/src/pages/TemplateDemo.tsx`
