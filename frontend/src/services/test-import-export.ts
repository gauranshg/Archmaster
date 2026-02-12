/**
 * Test suite for Import/Export functionality
 *
 * Run with: node --loader ts-node/esm test-import-export.ts
 */

import { exportService, importService, validateDiagram } from './index.js';
import type { Diagram } from '../types/diagram.js';

// Sample diagram for testing
const testDiagram: Diagram = {
  id: 'test-diagram-id',
  name: 'Test Diagram',
  description: 'A test diagram for import/export',
  type: 'system-context',
  workspaceId: 'test-workspace',
  nodes: [
    {
      id: 'node-1',
      diagramId: 'test-diagram-id',
      position: { x: 0, y: 0 },
      data: {
        label: 'Test Node',
        htmlContent: '<div>Test</div>',
      },
    },
  ],
  edges: [],
  metadata: {
    version: 1,
    author: 'Test Author',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Test 1: Export to JSON
console.log('Test 1: Export to JSON');
try {
  const jsonResult = exportService.exportDiagram(testDiagram, {
    format: 'json',
    pretty: true,
    includeMetadata: true,
  });
  console.log('✓ JSON export successful');
  console.log('  Output length:', jsonResult.data.length);
  console.log('  Preview:', jsonResult.data.substring(0, 100) + '...');
} catch (error) {
  console.error('✗ JSON export failed:', error);
}

// Test 2: Export to YAML
console.log('\nTest 2: Export to YAML');
try {
  const yamlResult = exportService.exportDiagram(testDiagram, {
    format: 'yaml',
    pretty: true,
  });
  console.log('✓ YAML export successful');
  console.log('  Output length:', yamlResult.data.length);
  console.log('  Preview:', yamlResult.data.substring(0, 100) + '...');
} catch (error) {
  console.error('✗ YAML export failed:', error);
}

// Test 3: Import from JSON
console.log('\nTest 3: Import from JSON');
try {
  const jsonResult = exportService.exportDiagram(testDiagram, { format: 'json', pretty: true });
  const importResult = importService.importFromJSON(jsonResult.data, { validate: true });

  if (importResult.success && importResult.diagram) {
    console.log('✓ JSON import successful');
    console.log('  Diagram name:', importResult.diagram.name);
    console.log('  Nodes:', importResult.diagram.nodes.length);
    console.log('  Edges:', importResult.diagram.edges.length);
  } else {
    console.error('✗ JSON import failed:', importResult.error);
  }
} catch (error) {
  console.error('✗ JSON import failed:', error);
}

// Test 4: Import from YAML
console.log('\nTest 4: Import from YAML');
try {
  const yamlResult = exportService.exportDiagram(testDiagram, { format: 'yaml', pretty: true });
  const importResult = importService.importFromYAML(yamlResult.data, { validate: true });

  if (importResult.success && importResult.diagram) {
    console.log('✓ YAML import successful');
    console.log('  Diagram name:', importResult.diagram.name);
    console.log('  Nodes:', importResult.diagram.nodes.length);
  } else {
    console.error('✗ YAML import failed:', importResult.error);
  }
} catch (error) {
  console.error('✗ YAML import failed:', error);
}

// Test 5: Validation
console.log('\nTest 5: Validation');
try {
  const validation = validateDiagram(testDiagram);
  if (validation.valid) {
    console.log('✓ Validation passed');
  } else {
    console.error('✗ Validation failed:', validation.errors);
  }
} catch (error) {
  console.error('✗ Validation failed:', error);
}

// Test 6: Invalid data validation
console.log('\nTest 6: Invalid data validation');
try {
  const invalidData = { name: 'Invalid' };
  const validation = validateDiagram(invalidData);
  if (!validation.valid) {
    console.log('✓ Invalid data correctly rejected');
    console.log('  Errors:', validation.errors.length);
  } else {
    console.error('✗ Invalid data incorrectly accepted');
  }
} catch (error) {
  console.error('✗ Validation test failed:', error);
}

// Test 7: Round-trip JSON
console.log('\nTest 7: Round-trip JSON');
try {
  const exported = exportService.exportDiagram(testDiagram, { format: 'json', pretty: true });
  const imported = importService.importFromJSON(exported.data, { validate: true, generateNewIds: true });

  if (imported.success && imported.diagram) {
    const hasSameStructure =
      imported.diagram.name === testDiagram.name &&
      imported.diagram.nodes.length === testDiagram.nodes.length &&
      imported.diagram.edges.length === testDiagram.edges.length;

    if (hasSameStructure) {
      console.log('✓ Round-trip successful (structure preserved)');
    } else {
      console.error('✗ Round-trip failed (structure changed)');
    }
  } else {
    console.error('✗ Round-trip failed:', imported.error);
  }
} catch (error) {
  console.error('✗ Round-trip failed:', error);
}

console.log('\n=== All tests completed ===');
