/**
 * Import Service
 *
 * Handles importing diagrams from various formats (JSON, YAML).
 * Provides validation, error handling, and file upload support.
 */

import type { Diagram } from '../types/diagram.js';
import type { ValidationResult } from '../types/common.js';
import yaml from 'js-yaml';
import { validateDiagram, validateDiagrams, formatValidationErrors } from './validation.js';

/**
 * Import result
 */
export interface ImportResult {
  /** Whether import was successful */
  success: boolean;

  /** Imported diagram (single import) */
  diagram?: Diagram;

  /** Imported diagrams (multiple import) */
  diagrams?: Diagram[];

  /** Error message if failed */
  error?: string;

  /** Validation warnings */
  warnings?: string[];

  /** Validation result (for debugging) */
  validation?: ValidationResult;
}

/**
 * Import options
 */
export interface ImportOptions {
  /** Whether to validate the data */
  validate?: boolean;

  /** Whether to throw on validation errors */
  throwOnError?: boolean;

  /** Default workspace ID to assign if missing */
  defaultWorkspaceId?: string;

  /** Whether to generate new IDs for imported diagrams */
  generateNewIds?: boolean;
}

/**
 * Parses JSON string to diagram
 *
 * @param json - JSON string
 * @returns Parsed diagram or diagrams
 */
const parseFromJSON = (json: string): unknown => {
  try {
    return JSON.parse(json);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Parses YAML string to diagram
 *
 * @param yamlString - YAML string
 * @returns Parsed diagram or diagrams
 */
const parseFromYAML = (yamlString: string): unknown => {
  try {
    return yaml.load(yamlString);
  } catch (error) {
    throw new Error(`Invalid YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Checks if parsed data is a single diagram
 *
 * @param data - Parsed data
 * @returns Whether data is a single diagram
 */
const isSingleDiagram = (data: unknown): boolean => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return 'id' in obj && 'name' in obj && 'type' in obj;
};

/**
 * Checks if parsed data is an array of diagrams
 *
 * @param data - Parsed data
 * @returns Whether data is an array of diagrams
 */
const isDiagramArray = (data: unknown): boolean => {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.length > 0 && isSingleDiagram(data[0]);
};

/**
 * Generates a new UUID
 *
 * @returns New UUID string
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Recursively generates new IDs for a diagram and its elements
 *
 * @param diagram - The diagram to process
 * @returns Diagram with new IDs
 */
const regenerateIds = (diagram: Diagram): Diagram => {
  const idMap = new Map<string, string>();

  // Generate new diagram ID
  const newDiagramId = generateUUID();
  idMap.set(diagram.id, newDiagramId);

  // Create new diagram with updated IDs
  const newDiagram: Diagram = {
    ...diagram,
    id: newDiagramId,
    nodes: diagram.nodes.map((node) => {
      const newNodeId = generateUUID();
      idMap.set(node.id, newNodeId);

      return {
        ...node,
        id: newNodeId,
        diagramId: newDiagramId,
      };
    }),
    edges: diagram.edges.map((edge) => {
      const newEdgeId = generateUUID();
      const sourceId = idMap.get(edge.source) || edge.source;
      const targetId = idMap.get(edge.target) || edge.target;

      return {
        ...edge,
        id: newEdgeId,
        diagramId: newDiagramId,
        source: sourceId,
        target: targetId,
      };
    }),
  };

  // Update parent and child diagram IDs
  if (newDiagram.parentId) {
    newDiagram.parentId = idMap.get(newDiagram.parentId) || newDiagram.parentId;
  }

  if (newDiagram.metadata.parentDiagramId) {
    newDiagram.metadata.parentDiagramId = idMap.get(newDiagram.metadata.parentDiagramId) || newDiagram.metadata.parentDiagramId;
  }

  if (newDiagram.metadata.childDiagramIds) {
    newDiagram.metadata.childDiagramIds = newDiagram.metadata.childDiagramIds.map((id) => idMap.get(id) || id);
  }

  return newDiagram;
};

/**
 * Ensures required fields have default values
 *
 * @param diagram - The diagram to process
 * @param defaultWorkspaceId - Default workspace ID
 * @returns Diagram with defaults applied
 */
const applyDefaults = (diagram: Diagram, defaultWorkspaceId?: string): Diagram => {
  const result = { ...diagram };

  // Set default workspace ID
  if (!result.workspaceId && defaultWorkspaceId) {
    result.workspaceId = defaultWorkspaceId;
  }

  // Ensure metadata exists
  if (!result.metadata) {
    result.metadata = {
      version: 1,
      author: 'imported',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
  }

  // Ensure nodes and edges arrays exist
  if (!result.nodes) {
    result.nodes = [];
  }

  if (!result.edges) {
    result.edges = [];
  }

  // Set default timestamps
  if (!result.createdAt) {
    result.createdAt = new Date().toISOString();
  }

  if (!result.updatedAt) {
    result.updatedAt = new Date().toISOString();
  }

  return result;
};

/**
 * Import service
 */
export const importService = {
  /**
   * Imports a diagram from JSON string
   *
   * @param json - JSON string
   * @param options - Import options
   * @returns Import result
   */
  importFromJSON(json: string, options?: ImportOptions): ImportResult {
    try {
      // Parse JSON
      const data = parseFromJSON(json);

      // Validate if requested
      let validation: ValidationResult | undefined;
      if (options?.validate !== false) {
        validation = isSingleDiagram(data) ? validateDiagram(data) : validateDiagrams(data);

        if (!validation.valid && options?.throwOnError) {
          return {
            success: false,
            error: formatValidationErrors(validation),
            validation,
          };
        }
      }

      // Handle single diagram
      if (isSingleDiagram(data)) {
        let diagram = data as Diagram;

        // Apply defaults
        diagram = applyDefaults(diagram, options?.defaultWorkspaceId);

        // Generate new IDs if requested
        if (options?.generateNewIds) {
          diagram = regenerateIds(diagram);
        }

        return {
          success: true,
          diagram,
          warnings: validation?.warnings?.map((w) => w.message),
          validation,
        };
      }

      // Handle multiple diagrams
      if (isDiagramArray(data)) {
        let diagrams = (data as Diagram[]).map((d) => applyDefaults(d, options?.defaultWorkspaceId));

        // Generate new IDs if requested
        if (options?.generateNewIds) {
          diagrams = diagrams.map((d) => regenerateIds(d));
        }

        return {
          success: true,
          diagrams,
          warnings: validation?.warnings?.map((w) => w.message),
          validation,
        };
      }

      return {
        success: false,
        error: 'Data is not a valid diagram or array of diagrams',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Imports a diagram from YAML string
   *
   * @param yamlString - YAML string
   * @param options - Import options
   * @returns Import result
   */
  importFromYAML(yamlString: string, options?: ImportOptions): ImportResult {
    try {
      // Parse YAML
      const data = parseFromYAML(yamlString);

      // Validate if requested
      let validation: ValidationResult | undefined;
      if (options?.validate !== false) {
        validation = isSingleDiagram(data) ? validateDiagram(data) : validateDiagrams(data);

        if (!validation.valid && options?.throwOnError) {
          return {
            success: false,
            error: formatValidationErrors(validation),
            validation,
          };
        }
      }

      // Handle single diagram
      if (isSingleDiagram(data)) {
        let diagram = data as Diagram;

        // Apply defaults
        diagram = applyDefaults(diagram, options?.defaultWorkspaceId);

        // Generate new IDs if requested
        if (options?.generateNewIds) {
          diagram = regenerateIds(diagram);
        }

        return {
          success: true,
          diagram,
          warnings: validation?.warnings?.map((w) => w.message),
          validation,
        };
      }

      // Handle multiple diagrams
      if (isDiagramArray(data)) {
        let diagrams = (data as Diagram[]).map((d) => applyDefaults(d, options?.defaultWorkspaceId));

        // Generate new IDs if requested
        if (options?.generateNewIds) {
          diagrams = diagrams.map((d) => regenerateIds(d));
        }

        return {
          success: true,
          diagrams,
          warnings: validation?.warnings?.map((w) => w.message),
          validation,
        };
      }

      return {
        success: false,
        error: 'Data is not a valid diagram or array of diagrams',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Imports a diagram from a file
   *
   * @param file - File to import
   * @param options - Import options
   * @returns Promise that resolves to import result
   */
  async importFromFile(file: File, options?: ImportOptions): Promise<ImportResult> {
    try {
      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum size is 10MB.`,
        };
      }

      // Read file
      const text = await file.text();

      // Detect format from file extension
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'yaml' || extension === 'yml') {
        return this.importFromYAML(text, options);
      } else if (extension === 'json') {
        return this.importFromJSON(text, options);
      } else {
        // Try to auto-detect format
        try {
          return this.importFromJSON(text, options);
        } catch {
          return this.importFromYAML(text, options);
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Validates data without importing
   *
   * @param data - Data to validate (JSON string or YAML string or parsed object)
   * @param format - Format of the data ('json', 'yaml', or 'auto')
   * @returns Validation result
   */
  validate(data: string | unknown, format: 'json' | 'yaml' | 'auto' = 'auto'): ValidationResult {
    try {
      let parsed: unknown;

      if (typeof data === 'string') {
        if (format === 'auto') {
          // Try JSON first, then YAML
          try {
            parsed = parseFromJSON(data);
          } catch {
            parsed = parseFromYAML(data);
          }
        } else if (format === 'json') {
          parsed = parseFromJSON(data);
        } else {
          parsed = parseFromYAML(data);
        }
      } else {
        parsed = data;
      }

      if (isSingleDiagram(parsed)) {
        return validateDiagram(parsed);
      } else if (isDiagramArray(parsed)) {
        return validateDiagrams(parsed);
      } else {
        return {
          valid: false,
          errors: [
            {
              field: 'data',
              message: 'Data is not a valid diagram or array of diagrams',
              code: 'INVALID_FORMAT',
            },
          ],
        };
      }
    } catch (error) {
      return {
        valid: false,
        errors: [
          {
            field: 'data',
            message: error instanceof Error ? error.message : 'Unknown validation error',
            code: 'PARSE_ERROR',
          },
        ],
      };
    }
  },

  /**
   * Creates a file input element and triggers file selection
   *
   * @param options - Import options
   * @param callback - Callback to handle import result
   * @returns Cleanup function to remove the input element
   */
  triggerFileUpload(
    options: ImportOptions,
    callback: (result: ImportResult) => void
  ): () => void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.yaml,.yml';
    input.style.display = 'none';

    input.addEventListener('change', async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const result = await this.importFromFile(file, options);
        callback(result);
      }
      // Cleanup
      document.body.removeChild(input);
    });

    document.body.appendChild(input);
    input.click();

    // Return cleanup function
    return () => {
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
    };
  },
};

/**
 * Default import options
 */
export const defaultImportOptions: ImportOptions = {
  validate: true,
  throwOnError: false,
  generateNewIds: false,
};
