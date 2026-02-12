# Import/Export Service Documentation

## Overview

The Import/Export service provides functionality to serialize and deserialize diagrams to and from JSON and YAML formats. This enables users to save, share, and version control their architecture diagrams.

## Features

- **Multiple Formats**: Support for both JSON and YAML formats
- **Schema Validation**: Comprehensive validation of diagram structure
- **File Operations**: Built-in file download and upload handlers
- **Error Handling**: Graceful error handling with user-friendly messages
- **Flexible Options**: Configurable export/import options
- **Type Safety**: Full TypeScript support with strict type checking

## Installation

The required dependencies are already installed:

```bash
npm install js-yaml @types/js-yaml
```

## Usage

### Basic Export

```typescript
import { exportService, defaultExportOptions } from '@/services';
import type { Diagram } from '@/types';

const diagram: Diagram = {
  // ... your diagram data
};

// Export to JSON string
const result = exportService.exportDiagram(diagram, {
  ...defaultExportOptions,
  format: 'json',
  pretty: true,
});

console.log(result.data); // JSON string
```

### Export to File

```typescript
// Trigger file download
exportService.exportAsFile(diagram, 'my-diagram', {
  format: 'json',
  pretty: true,
  includeMetadata: true,
  includeCustomCSS: true,
  includeLayout: true,
});
```

### Export to YAML

```typescript
const result = exportService.exportDiagram(diagram, {
  format: 'yaml',
  pretty: true,
  indent: 2,
});

console.log(result.data); // YAML string
```

### Basic Import

```typescript
import { importService, defaultImportOptions } from '@/services';

const jsonString = '{"id": "...", "name": "...", ...}';

const result = importService.importFromJSON(jsonString, defaultImportOptions);

if (result.success) {
  const diagram = result.diagram;
  console.log('Imported:', diagram?.name);

  if (result.warnings) {
    console.warn('Warnings:', result.warnings);
  }
} else {
  console.error('Import failed:', result.error);
}
```

### Import from YAML

```typescript
const yamlString = `
id: "550e8400-e29b-41d4-a716-446655440000"
name: "My Diagram"
type: "system-context"
...
`;

const result = importService.importFromYAML(yamlString, defaultImportOptions);
```

### Import from File

```typescript
// Method 1: Using file input
const fileInput = document.querySelector('input[type="file"]');

fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    const result = await importService.importFromFile(file, defaultImportOptions);

    if (result.success) {
      console.log('Imported:', result.diagram);
    }
  }
});

// Method 2: Using trigger file upload
const cleanup = importService.triggerFileUpload(defaultImportOptions, (result) => {
  if (result.success) {
    console.log('Imported:', result.diagram);
  }
});
```

## API Reference

### Export Options

```typescript
interface ExportOptions {
  format: 'json' | 'yaml';
  includeMetadata?: boolean;
  includeCustomCSS?: boolean;
  includeLayout?: boolean;
  pretty?: boolean;
  indent?: number;
}
```

### Export Result

```typescript
interface ExportResult {
  data: string;
  extension: string;
  mimeType: string;
  format: ExportFormat;
}
```

### Import Options

```typescript
interface ImportOptions {
  validate?: boolean;
  throwOnError?: boolean;
  defaultWorkspaceId?: string;
  generateNewIds?: boolean;
}
```

### Import Result

```typescript
interface ImportResult {
  success: boolean;
  diagram?: Diagram;
  diagrams?: Diagram[];
  error?: string;
  warnings?: string[];
  validation?: ValidationResult;
}
```

## Validation

The service includes comprehensive validation:

### Validate Diagram

```typescript
import { validateDiagram, formatValidationErrors } from '@/services';

const result = validateDiagram(data);

if (!result.valid) {
  console.error('Validation errors:', formatValidationErrors(result));
}

if (result.warnings) {
  console.warn('Warnings:', result.warnings);
}
```

### Validation Checks

**Diagram validation:**
- Required fields (id, name, type, workspaceId, nodes, edges, metadata)
- UUID format validation
- Diagram type validation
- Node and edge validation
- Metadata structure validation
- Custom CSS format validation
- Layout configuration validation

**Node validation:**
- Required fields (id, diagramId, position, data)
- Position coordinates validation
- Size validation (if provided)
- Data label validation

**Edge validation:**
- Required fields (id, diagramId, source, target)
- Source and target validation
- Self-loop detection (warning)
- Edge type validation

## Examples

### Example 1: Export and Import Round-trip

```typescript
// Export
const diagram = await diagramStorage.get('diagram-id');
const exported = exportService.exportDiagram(diagram, {
  format: 'json',
  pretty: true,
});

// Import
const imported = importService.importFromJSON(exported.data, {
  validate: true,
  generateNewIds: false,
});

if (imported.success) {
  console.log('Round-trip successful!');
}
```

### Example 2: Export Multiple Diagrams

```typescript
const diagrams = await diagramStorage.list();

const result = exportService.exportMultiple(diagrams, {
  format: 'json',
  pretty: true,
});

exportService.exportMultipleAsFile(diagrams, 'all-diagrams', {
  format: 'json',
});
```

### Example 3: Import with Custom Options

```typescript
const result = await importService.importFromFile(file, {
  validate: true,
  throwOnError: false,
  defaultWorkspaceId: 'my-workspace',
  generateNewIds: true, // Create new IDs to avoid conflicts
});

if (result.success && result.diagram) {
  await diagramStorage.create(result.diagram);
}
```

## File Format

### JSON Format

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "System Architecture",
  "description": "High-level system architecture",
  "type": "system-context",
  "workspaceId": "default-workspace",
  "nodes": [
    {
      "id": "node-1",
      "diagramId": "550e8400-e29b-41d4-a716-446655440000",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "User",
        "htmlContent": "<div>User</div>"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "diagramId": "550e8400-e29b-41d4-a716-446655440000",
      "source": "node-1",
      "target": "node-2",
      "label": "Uses"
    }
  ],
  "customCSS": ".node { padding: 10px; }",
  "layout": {
    "type": "manual"
  },
  "metadata": {
    "version": 1,
    "author": "John Doe",
    "createdAt": "2024-01-26T10:00:00Z",
    "modifiedAt": "2024-01-26T10:00:00Z"
  },
  "createdAt": "2024-01-26T10:00:00Z",
  "updatedAt": "2024-01-26T10:00:00Z"
}
```

### YAML Format

```yaml
id: 550e8400-e29b-41d4-a716-446655440000
name: System Architecture
description: High-level system architecture
type: system-context
workspaceId: default-workspace
nodes:
  - id: node-1
    diagramId: 550e8400-e29b-41d4-a716-446655440000
    position:
      x: 100
      y: 100
    data:
      label: User
      htmlContent: <div>User</div>
edges:
  - id: edge-1
    diagramId: 550e8400-e29b-41d4-a716-446655440000
    source: node-1
    target: node-2
    label: Uses
customCSS: ".node { padding: 10px; }"
layout:
  type: manual
metadata:
  version: 1
  author: John Doe
  createdAt: "2024-01-26T10:00:00Z"
  modifiedAt: "2024-01-26T10:00:00Z"
createdAt: "2024-01-26T10:00:00Z"
updatedAt: "2024-01-26T10:00:00Z"
```

## Error Handling

The service provides detailed error messages:

```typescript
const result = importService.importFromJSON(invalidJson);

if (!result.success) {
  // User-friendly error message
  console.error(result.error);
  // "Invalid JSON: Unexpected token at position 15"

  // Validation errors
  if (result.validation) {
    console.error(formatValidationErrors(result.validation));
    /*
    ❌ id: Required field 'id' is missing (REQUIRED)
    ❌ name: Required field 'name' is missing (REQUIRED)
    ⚠️  metadata.version: Version should be at least 1 (INVALID_VALUE)
    */
  }
}
```

## Best Practices

1. **Always Validate**: Enable validation when importing user-provided data
2. **Handle Errors**: Always check `success` flag and handle errors gracefully
3. **Use Pretty Print**: Enable `pretty` option for human-readable exports
4. **Generate New IDs**: Use `generateNewIds: true` when importing to avoid ID conflicts
5. **Check Warnings**: Review validation warnings even if import succeeds
6. **File Size Limits**: The import service limits files to 10MB for performance

## Demo

A demo page is available at `/import-export` to test the functionality:

- Export diagrams to JSON/YAML
- Export to file downloads
- Import from string input
- Import from file upload
- View validation results

## Testing

To test the import/export functionality:

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:5173/import-export`
3. Use the interface to test export/import operations

## Future Enhancements

- [ ] Support for additional formats (XML, TOML)
- [ ] Compression for large diagrams
- [ ] Incremental export (diagram changes only)
- [ ] Export to image formats (PNG, SVG)
- [ ] Batch import from multiple files
- [ ] Import from other diagram tools (Draw.io, Lucidchart)
