/**
 * Diagram Storage Service
 *
 * Provides CRUD operations for diagrams stored in IndexedDB.
 * Handles transactions for multi-table operations (diagrams, nodes, edges).
 */

import { db, type StoredNode, type StoredEdge } from './db';
import type { Diagram, Node, Edge } from '@/types';

/**
 * Error class for diagram storage operations
 */
export class DiagramStorageError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'DiagramStorageError';
  }
}

/**
 * Complete diagram with all related data
 */
export interface CompleteDiagram extends Diagram {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Diagram storage service
 */
export const diagramStorage = {
  /**
   * Get a complete diagram by ID with all nodes and edges
   *
   * @param diagramId - The diagram ID to fetch
   * @returns The complete diagram or null if not found
   */
  async get(diagramId: string): Promise<CompleteDiagram | null> {
    try {
      const diagram = await db.diagrams.get(diagramId);

      if (!diagram) {
        return null;
      }

      // Fetch all nodes and edges for this diagram
      const nodes = await db.nodes.where('diagramId').equals(diagramId).toArray();
      const edges = await db.edges.where('diagramId').equals(diagramId).toArray();

      return {
        ...diagram,
        nodes: nodes as unknown as Node[],
        edges: edges as unknown as Edge[],
      };
    } catch (error) {
      throw new DiagramStorageError(`Failed to get diagram ${diagramId}`, error);
    }
  },

  /**
   * Save a complete diagram (diagram, nodes, and edges) in a transaction
   *
   * @param diagram - The complete diagram to save
   */
  async save(diagram: CompleteDiagram): Promise<void> {
    try {
      await db.transaction('rw', db.diagrams, db.nodes, db.edges, async () => {
        // Create mutable copies to avoid "object is not extensible" errors
        const now = new Date().toISOString();
        const metadata = diagram.metadata || {};

        // Ensure metadata has all required fields
        const updatedMetadata: Required<typeof metadata> = {
          version: (metadata.version || 0) + 1,
          author: metadata.author || 'user',
          createdAt: metadata.createdAt || now,
          modifiedAt: now,
          parentDiagramId: metadata.parentDiagramId,
          childDiagramIds: metadata.childDiagramIds,
        };

        const diagramToSave = {
          ...diagram,
          updatedAt: now,
          metadata: updatedMetadata,
        };

        await db.diagrams.put(diagramToSave);

        // Delete existing nodes and edges
        await db.nodes.where('diagramId').equals(diagram.id).delete();
        await db.edges.where('diagramId').equals(diagram.id).delete();

        // Insert new nodes and edges
        const nodesToStore: StoredNode[] = diagram.nodes.map(node => ({
          ...node,
          diagramId: diagram.id,
        })) as unknown as StoredNode[];

        const edgesToStore: StoredEdge[] = diagram.edges.map(edge => ({
          ...edge,
          diagramId: diagram.id,
        })) as unknown as StoredEdge[];

        if (nodesToStore.length > 0) {
          await db.nodes.bulkAdd(nodesToStore);
        }

        if (edgesToStore.length > 0) {
          await db.edges.bulkAdd(edgesToStore);
        }
      });
    } catch (error) {
      throw new DiagramStorageError(`Failed to save diagram ${diagram.id}`, error);
    }
  },

  /**
   * Delete a diagram and all its nodes and edges
   *
   * @param diagramId - The diagram ID to delete
   */
  async delete(diagramId: string): Promise<void> {
    try {
      await db.transaction('rw', db.diagrams, db.nodes, db.edges, db.syncStatus, async () => {
        await db.diagrams.delete(diagramId);
        await db.nodes.where('diagramId').equals(diagramId).delete();
        await db.edges.where('diagramId').equals(diagramId).delete();
        await db.syncStatus.where('diagramId').equals(diagramId).delete();
      });
    } catch (error) {
      throw new DiagramStorageError(`Failed to delete diagram ${diagramId}`, error);
    }
  },

  /**
   * List all diagrams in a workspace
   *
   * @param workspaceId - The workspace ID
   * @returns Array of diagrams (without nodes and edges)
   */
  async listByWorkspace(workspaceId: string): Promise<Diagram[]> {
    try {
      return await db.diagrams
        .where('workspaceId')
        .equals(workspaceId)
        .toArray();
    } catch (error) {
      throw new DiagramStorageError(`Failed to list diagrams for workspace ${workspaceId}`, error);
    }
  },

  /**
   * List all diagrams (for all workspaces)
   *
   * @returns Array of all diagrams
   */
  async listAll(): Promise<Diagram[]> {
    try {
      return await db.diagrams.toArray();
    } catch (error) {
      throw new DiagramStorageError('Failed to list all diagrams', error);
    }
  },

  /**
   * Bulk save multiple diagrams in a transaction
   *
   * @param diagrams - Array of complete diagrams to save
   */
  async bulkPut(diagrams: CompleteDiagram[]): Promise<void> {
    try {
      await db.transaction('rw', db.diagrams, db.nodes, db.edges, async () => {
        for (const diagram of diagrams) {
          await this.save(diagram);
        }
      });
    } catch (error) {
      throw new DiagramStorageError('Failed to bulk save diagrams', error);
    }
  },

  /**
   * Get child diagrams of a parent diagram
   *
   * @param parentId - The parent diagram ID
   * @returns Array of child diagrams
   */
  async getChildren(parentId: string): Promise<Diagram[]> {
    try {
      return await db.diagrams
        .where('parentId')
        .equals(parentId)
        .toArray();
    } catch (error) {
      throw new DiagramStorageError(`Failed to get children of diagram ${parentId}`, error);
    }
  },

  /**
   * Get diagrams by type
   *
   * @param type - The diagram type
   * @param workspaceId - Optional workspace ID filter
   * @returns Array of diagrams of the specified type
   */
  async getByType(type: string, workspaceId?: string): Promise<Diagram[]> {
    try {
      let query = db.diagrams.where('type').equals(type);

      if (workspaceId) {
        query = query.and(diagram => diagram.workspaceId === workspaceId) as any;
      }

      return await query.toArray();
    } catch (error) {
      throw new DiagramStorageError(`Failed to get diagrams of type ${type}`, error);
    }
  },

  /**
   * Search diagrams by name
   *
   * @param searchTerm - The search term
   * @param workspaceId - Optional workspace ID filter
   * @returns Array of matching diagrams
   */
  async searchByName(searchTerm: string, workspaceId?: string): Promise<Diagram[]> {
    try {
      const term = searchTerm.toLowerCase();

      if (workspaceId) {
        return await db.diagrams
          .where('workspaceId')
          .equals(workspaceId)
          .filter(diagram => diagram.name.toLowerCase().includes(term))
          .toArray();
      }

      return await db.diagrams
        .filter(diagram => diagram.name.toLowerCase().includes(term))
        .toArray();
    } catch (error) {
      throw new DiagramStorageError(`Failed to search diagrams with term ${searchTerm}`, error);
    }
  },

  /**
   * Count diagrams in a workspace
   *
   * @param workspaceId - The workspace ID
   * @returns Number of diagrams
   */
  async countByWorkspace(workspaceId: string): Promise<number> {
    try {
      return await db.diagrams
        .where('workspaceId')
        .equals(workspaceId)
        .count();
    } catch (error) {
      throw new DiagramStorageError(`Failed to count diagrams for workspace ${workspaceId}`, error);
    }
  },
};
