/**
 * Storage Services Usage Examples
 *
 * This file demonstrates how to use the IndexedDB storage services.
 * These are examples for reference - not meant to be executed directly.
 */

import {
  diagramStorage,
  templateStorage,
  syncService,
  dbUtils,
  type CompleteDiagram,
} from '@/services/storage';
import type { Diagram, Template } from '@/types';

// ============================================================================
// DIAGRAM EXAMPLES
// ============================================================================

/**
 * Example: Create and save a new diagram
 */
export async function createExampleDiagram(): Promise<void> {
  const newDiagram: CompleteDiagram = {
    id: 'diagram-001',
    name: 'System Context Diagram',
    description: 'High-level system architecture',
    type: 'system-context',
    workspaceId: 'workspace-001',
    nodes: [
      {
        id: 'node-1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          label: 'User',
          htmlContent: '<div class="actor">👤 User</div>',
          cssClass: 'actor-node',
        },
      },
      {
        id: 'node-2',
        type: 'custom',
        position: { x: 400, y: 100 },
        data: {
          label: 'System',
          htmlContent: '<div class="system">🖥️ My System</div>',
          cssClass: 'system-node',
        },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'default',
        data: {
          label: 'Uses',
        },
      },
    ],
    customCSS: `
      .actor-node {
        background: #e1f5fe;
        border: 2px solid #0288d1;
        border-radius: 50%;
      }
      .system-node {
        background: #f3e5f5;
        border: 2px solid #7b1fa2;
        border-radius: 8px;
      }
    `,
    metadata: {
      version: 1,
      author: 'user-001',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await diagramStorage.save(newDiagram);
  console.log('Diagram saved successfully!');
}

/**
 * Example: Load and display a diagram
 */
export async function loadDiagram(diagramId: string): Promise<void> {
  const diagram = await diagramStorage.get(diagramId);

  if (!diagram) {
    console.log('Diagram not found');
    return;
  }

  console.log('Loaded diagram:', diagram.name);
  console.log('Nodes:', diagram.nodes.length);
  console.log('Edges:', diagram.edges.length);
}

/**
 * Example: Update an existing diagram
 */
export async function updateDiagram(diagramId: string): Promise<void> {
  const diagram = await diagramStorage.get(diagramId);

  if (!diagram) {
    console.log('Diagram not found');
    return;
  }

  // Add a new node
  diagram.nodes.push({
    id: `node-${Date.now()}`,
    type: 'custom',
    position: { x: 250, y: 300 },
    data: {
      label: 'Database',
      htmlContent: '<div class="database">🗄️ Database</div>',
    },
  });

  // Save changes
  await diagramStorage.save(diagram);
  console.log('Diagram updated successfully!');

  // Mark as pending for sync
  await syncService.markPending(diagramId, 'update');
}

/**
 * Example: List all diagrams in a workspace
 */
export async function listWorkspaceDiagrams(workspaceId: string): Promise<void> {
  const diagrams = await diagramStorage.listByWorkspace(workspaceId);

  console.log(`Found ${diagrams.length} diagrams:`);
  diagrams.forEach(diagram => {
    console.log(`- ${diagram.name} (${diagram.type})`);
  });
}

/**
 * Example: Search diagrams by name
 */
export async function searchDiagrams(searchTerm: string): Promise<void> {
  const results = await diagramStorage.searchByName(searchTerm);

  console.log(`Found ${results.length} matching diagrams:`);
  results.forEach(diagram => {
    console.log(`- ${diagram.name}`);
  });
}

// ============================================================================
// TEMPLATE EXAMPLES
// ============================================================================

/**
 * Example: Create and save a template
 */
export async function createExampleTemplate(): Promise<void> {
  const newTemplate: Template = {
    id: 'template-001',
    name: 'Web Service',
    description: 'A REST API service',
    category: 'service',
    author: 'user-001',
    isPublic: true,
    data: {
      label: 'Service',
      htmlContent: '<div class="service">🔌 API Service</div>',
      cssClass: 'service-template',
      icon: 'server',
    },
    style: {
      background: '#fff3e0',
      border: '2px solid #ff9800',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '500',
    },
    className: 'service-node',
    tags: ['api', 'rest', 'service'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await templateStorage.save(newTemplate);
  console.log('Template saved successfully!');
}

/**
 * Example: Filter templates by category
 */
export async function filterTemplatesByCategory(category: string): Promise<void> {
  const templates = await templateStorage.getByCategory(category as any);

  console.log(`Found ${templates.length} ${category} templates:`);
  templates.forEach(template => {
    console.log(`- ${template.name}: ${template.description}`);
  });
}

/**
 * Example: Search templates
 */
export async function searchTemplates(searchTerm: string): Promise<void> {
  const results = await templateStorage.search(searchTerm);

  console.log(`Found ${results.length} matching templates:`);
  results.forEach(template => {
    console.log(`- ${template.name}`);
  });
}

/**
 * Example: Get all public templates
 */
export async function getPublicTemplates(): Promise<void> {
  const templates = await templateStorage.getPublic();

  console.log(`Found ${templates.length} public templates:`);
  templates.forEach(template => {
    console.log(`- ${template.name} by ${template.author}`);
  });
}

// ============================================================================
// SYNC EXAMPLES
// ============================================================================

/**
 * Example: Sync with backend
 */
export async function performSync(): Promise<void> {
  // Check for pending changes
  const hasPending = await syncService.hasPendingChanges();

  if (hasPending) {
    console.log('Uploading pending changes...');
    const uploadResult = await syncService.uploadPendingChanges();
    console.log(`Uploaded ${uploadResult.uploaded} diagrams`);
  }

  // Download changes from backend
  console.log('Downloading changes from backend...');
  const downloadResult = await syncService.downloadFromBackend();
  console.log(`Downloaded ${downloadResult.downloaded} diagrams`);

  // Get last sync time
  const lastSync = syncService.getLastSyncTime();
  console.log('Last synced at:', lastSync);
}

/**
 * Example: Resolve sync conflicts
 */
export async function resolveSyncConflicts(): Promise<void> {
  // Get local and remote diagrams
  const localDiagrams = await diagramStorage.listAll();
  const remoteDiagrams: Diagram[] = []; // From API

  // Detect conflicts
  const conflicts = await syncService.detectConflicts(localDiagrams, remoteDiagrams);

  console.log(`Found ${conflicts.length} conflicts`);

  // Resolve each conflict
  for (const conflict of conflicts) {
    console.log(`Resolving conflict for diagram ${conflict.diagramId}`);

    // Choose resolution strategy: 'local-wins' | 'remote-wins' | 'manual'
    await syncService.resolveConflict(conflict, 'local-wins');
  }
}

// ============================================================================
// DATABASE UTILITIES EXAMPLES
// ============================================================================

/**
 * Example: Backup database
 */
export async function backupDatabase(): Promise<void> {
  const backupJson = await dbUtils.exportAll();

  // Create a blob and download
  const blob = new Blob([backupJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `architecture-platform-backup-${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);
  console.log('Database backed up successfully!');
}

/**
 * Example: Restore database
 */
export async function restoreDatabase(file: File): Promise<void> {
  const text = await file.text();
  await dbUtils.importAll(text);
  console.log('Database restored successfully!');
}

/**
 * Example: Get database size
 */
export async function checkDatabaseSize(): Promise<void> {
  const size = await dbUtils.getDbSize();
  const sizeMB = (size / (1024 * 1024)).toFixed(2);
  console.log(`Database size: ${sizeMB} MB`);
}

/**
 * Example: Reset database (for testing)
 */
export async function resetDatabase(): Promise<void> {
  if (confirm('Are you sure you want to clear all data?')) {
    await dbUtils.clearAll();
    await syncService.clearAllSyncStatus();
    console.log('Database reset successfully!');
  }
}

// ============================================================================
// WORKFLOW EXAMPLES
// ============================================================================

/**
 * Example: Complete workflow - create, edit, sync
 */
export async function completeWorkflow(): Promise<void> {
  try {
    // 1. Create a new diagram
    await createExampleDiagram();

    // 2. Load it
    const diagram = await diagramStorage.get('diagram-001');
    if (!diagram) {
      throw new Error('Diagram not found');
    }

    // 3. Make changes
    diagram.description = 'Updated description';
    await diagramStorage.save(diagram);

    // 4. Mark for sync
    await syncService.markPending('diagram-001', 'update');

    // 5. Sync with backend
    const syncResult = await syncService.uploadPendingChanges();
    console.log('Sync completed:', syncResult);

    console.log('Workflow completed successfully!');
  } catch (error) {
    console.error('Workflow failed:', error);
  }
}
