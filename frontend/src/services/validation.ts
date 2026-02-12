/**
 * Validation Service
 *
 * Provides schema validation for diagrams, nodes, and edges.
 * Ensures data integrity for import/export operations.
 */

import type { ValidationError, ValidationResult } from '../types/common.js';

/**
 * Required fields for a valid diagram
 */
const REQUIRED_DIAGRAM_FIELDS = ['id', 'name', 'type', 'workspaceId', 'nodes', 'edges', 'metadata'];

/**
 * Required fields for a valid node
 */
const REQUIRED_NODE_FIELDS = ['id', 'diagramId', 'position', 'data'];

/**
 * Required fields for a valid edge
 */
const REQUIRED_EDGE_FIELDS = ['id', 'diagramId', 'source', 'target'];

/**
 * Valid diagram types
 */
const VALID_DIAGRAM_TYPES = ['system-context', 'container', 'component', 'code', 'generic'];

/**
 * Validates a diagram object
 *
 * @param data - The data to validate
 * @returns Validation result with errors and warnings
 */
export const validateDiagram = (data: unknown): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check if data exists
  if (!data) {
    errors.push({
      field: 'diagram',
      message: 'Diagram data is required',
      code: 'REQUIRED',
    });
    return { valid: false, errors, warnings };
  }

  // Check if data is an object
  if (typeof data !== 'object' || Array.isArray(data)) {
    errors.push({
      field: 'diagram',
      message: 'Diagram must be an object',
      code: 'INVALID_TYPE',
    });
    return { valid: false, errors, warnings };
  }

  const diagram = data as Record<string, unknown>;

  // Validate required fields
  for (const field of REQUIRED_DIAGRAM_FIELDS) {
    if (!(field in diagram) || diagram[field] === undefined || diagram[field] === null) {
      errors.push({
        field,
        message: `Required field '${field}' is missing`,
        code: 'REQUIRED',
      });
    }
  }

  // Validate id format (UUID-like)
  if (diagram.id && typeof diagram.id === 'string') {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(diagram.id)) {
      warnings.push({
        field: 'id',
        message: 'ID should be a valid UUID',
        code: 'INVALID_FORMAT',
        value: diagram.id,
      });
    }
  }

  // Validate name
  if (diagram.name && typeof diagram.name === 'string') {
    if (diagram.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Name cannot be empty',
        code: 'INVALID_VALUE',
      });
    }
    if (diagram.name.length > 200) {
      warnings.push({
        field: 'name',
        message: 'Name is very long (over 200 characters)',
        code: 'LONG_VALUE',
      });
    }
  }

  // Validate type
  if (diagram.type && typeof diagram.type === 'string') {
    if (!VALID_DIAGRAM_TYPES.includes(diagram.type as any)) {
      errors.push({
        field: 'type',
        message: `Invalid diagram type. Must be one of: ${VALID_DIAGRAM_TYPES.join(', ')}`,
        code: 'INVALID_VALUE',
        value: diagram.type,
      });
    }
  }

  // Validate nodes array
  if (diagram.nodes !== undefined) {
    if (!Array.isArray(diagram.nodes)) {
      errors.push({
        field: 'nodes',
        message: 'Nodes must be an array',
        code: 'INVALID_TYPE',
      });
    } else {
      // Validate each node
      diagram.nodes.forEach((node: unknown, index: number) => {
        const nodeValidation = validateNode(node);
        if (!nodeValidation.valid) {
          nodeValidation.errors.forEach((error) => {
            errors.push({
              ...error,
              field: `nodes[${index}].${error.field}`,
            });
          });
        }
        if (nodeValidation.warnings) {
          nodeValidation.warnings.forEach((warning) => {
            warnings.push({
              ...warning,
              field: `nodes[${index}].${warning.field}`,
            });
          });
        }
      });
    }
  }

  // Validate edges array
  if (diagram.edges !== undefined) {
    if (!Array.isArray(diagram.edges)) {
      errors.push({
        field: 'edges',
        message: 'Edges must be an array',
        code: 'INVALID_TYPE',
      });
    } else {
      // Validate each edge
      diagram.edges.forEach((edge: unknown, index: number) => {
        const edgeValidation = validateEdge(edge);
        if (!edgeValidation.valid) {
          edgeValidation.errors.forEach((error) => {
            errors.push({
              ...error,
              field: `edges[${index}].${error.field}`,
            });
          });
        }
        if (edgeValidation.warnings) {
          edgeValidation.warnings.forEach((warning) => {
            warnings.push({
              ...warning,
              field: `edges[${index}].${warning.field}`,
            });
          });
        }
      });
    }
  }

  // Validate metadata
  if (diagram.metadata) {
    if (typeof diagram.metadata !== 'object' || Array.isArray(diagram.metadata)) {
      errors.push({
        field: 'metadata',
        message: 'Metadata must be an object',
        code: 'INVALID_TYPE',
      });
    } else {
      const metadata = diagram.metadata as Record<string, unknown>;
      if (!metadata.version || typeof metadata.version !== 'number') {
        errors.push({
          field: 'metadata.version',
          message: 'Metadata version is required and must be a number',
          code: 'REQUIRED',
        });
      }
      if (!metadata.author || typeof metadata.author !== 'string') {
        errors.push({
          field: 'metadata.author',
          message: 'Metadata author is required and must be a string',
          code: 'REQUIRED',
        });
      }
    }
  }

  // Validate customCSS
  if (diagram.customCSS !== undefined && typeof diagram.customCSS !== 'string') {
    errors.push({
      field: 'customCSS',
      message: 'Custom CSS must be a string',
      code: 'INVALID_TYPE',
    });
  }

  // Validate layout
  if (diagram.layout !== undefined) {
    if (typeof diagram.layout !== 'object' || Array.isArray(diagram.layout)) {
      errors.push({
        field: 'layout',
        message: 'Layout must be an object',
        code: 'INVALID_TYPE',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

/**
 * Validates a node object
 *
 * @param data - The data to validate
 * @returns Validation result with errors and warnings
 */
export const validateNode = (data: unknown): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check if data exists
  if (!data) {
    errors.push({
      field: 'node',
      message: 'Node data is required',
      code: 'REQUIRED',
    });
    return { valid: false, errors, warnings };
  }

  // Check if data is an object
  if (typeof data !== 'object' || Array.isArray(data)) {
    errors.push({
      field: 'node',
      message: 'Node must be an object',
      code: 'INVALID_TYPE',
    });
    return { valid: false, errors, warnings };
  }

  const node = data as Record<string, unknown>;

  // Validate required fields
  for (const field of REQUIRED_NODE_FIELDS) {
    if (!(field in node) || node[field] === undefined || node[field] === null) {
      errors.push({
        field,
        message: `Required field '${field}' is missing`,
        code: 'REQUIRED',
      });
    }
  }

  // Validate id format
  if (node.id && typeof node.id === 'string') {
    if (node.id.trim().length === 0) {
      errors.push({
        field: 'id',
        message: 'ID cannot be empty',
        code: 'INVALID_VALUE',
      });
    }
  }

  // Validate position
  if (node.position) {
    if (typeof node.position !== 'object' || Array.isArray(node.position)) {
      errors.push({
        field: 'position',
        message: 'Position must be an object with x and y coordinates',
        code: 'INVALID_TYPE',
      });
    } else {
      const position = node.position as Record<string, unknown>;
      if (typeof position.x !== 'number') {
        errors.push({
          field: 'position.x',
          message: 'Position x must be a number',
          code: 'INVALID_TYPE',
        });
      }
      if (typeof position.y !== 'number') {
        errors.push({
          field: 'position.y',
          message: 'Position y must be a number',
          code: 'INVALID_TYPE',
        });
      }
    }
  }

  // Validate data
  if (node.data) {
    if (typeof node.data !== 'object' || Array.isArray(node.data)) {
      errors.push({
        field: 'data',
        message: 'Data must be an object',
        code: 'INVALID_TYPE',
      });
    } else {
      const nodeData = node.data as Record<string, unknown>;
      if (!nodeData.label || typeof nodeData.label !== 'string') {
        errors.push({
          field: 'data.label',
          message: 'Data label is required and must be a string',
          code: 'REQUIRED',
        });
      }
    }
  }

  // Validate size if provided
  if (node.size) {
    if (typeof node.size !== 'object' || Array.isArray(node.size)) {
      errors.push({
        field: 'size',
        message: 'Size must be an object with width and height',
        code: 'INVALID_TYPE',
      });
    } else {
      const size = node.size as Record<string, unknown>;
      if (typeof size.width !== 'number' || size.width <= 0) {
        errors.push({
          field: 'size.width',
          message: 'Size width must be a positive number',
          code: 'INVALID_VALUE',
        });
      }
      if (typeof size.height !== 'number' || size.height <= 0) {
        errors.push({
          field: 'size.height',
          message: 'Size height must be a positive number',
          code: 'INVALID_VALUE',
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

/**
 * Validates an edge object
 *
 * @param data - The data to validate
 * @returns Validation result with errors and warnings
 */
export const validateEdge = (data: unknown): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check if data exists
  if (!data) {
    errors.push({
      field: 'edge',
      message: 'Edge data is required',
      code: 'REQUIRED',
    });
    return { valid: false, errors, warnings };
  }

  // Check if data is an object
  if (typeof data !== 'object' || Array.isArray(data)) {
    errors.push({
      field: 'edge',
      message: 'Edge must be an object',
      code: 'INVALID_TYPE',
    });
    return { valid: false, errors, warnings };
  }

  const edge = data as Record<string, unknown>;

  // Validate required fields
  for (const field of REQUIRED_EDGE_FIELDS) {
    if (!(field in edge) || edge[field] === undefined || edge[field] === null) {
      errors.push({
        field,
        message: `Required field '${field}' is missing`,
        code: 'REQUIRED',
      });
    }
  }

  // Validate id format
  if (edge.id && typeof edge.id === 'string') {
    if (edge.id.trim().length === 0) {
      errors.push({
        field: 'id',
        message: 'ID cannot be empty',
        code: 'INVALID_VALUE',
      });
    }
  }

  // Validate source and target
  if (edge.source && typeof edge.source === 'string') {
    if (edge.source.trim().length === 0) {
      errors.push({
        field: 'source',
        message: 'Source cannot be empty',
        code: 'INVALID_VALUE',
      });
    }
  }

  if (edge.target && typeof edge.target === 'string') {
    if (edge.target.trim().length === 0) {
      errors.push({
        field: 'target',
        message: 'Target cannot be empty',
        code: 'INVALID_VALUE',
      });
    }
  }

  // Check for self-loops (warning)
  if (edge.source && edge.target && edge.source === edge.target) {
    warnings.push({
      field: 'source',
      message: 'Edge creates a self-loop (source and target are the same)',
      code: 'SELF_LOOP',
    });
  }

  // Validate type if provided
  if (edge.type) {
    const validEdgeTypes = ['default', 'straight', 'step', 'smoothstep', 'bezier'];
    if (!validEdgeTypes.includes(edge.type as string)) {
      warnings.push({
        field: 'type',
        message: `Invalid edge type. Valid types: ${validEdgeTypes.join(', ')}`,
        code: 'INVALID_VALUE',
        value: edge.type,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

/**
 * Validates an array of diagrams
 *
 * @param data - The data to validate
 * @returns Validation result with errors and warnings
 */
export const validateDiagrams = (data: unknown): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!Array.isArray(data)) {
    errors.push({
      field: 'diagrams',
      message: 'Data must be an array of diagrams',
      code: 'INVALID_TYPE',
    });
    return { valid: false, errors, warnings };
  }

  if (data.length === 0) {
    warnings.push({
      field: 'diagrams',
      message: 'Diagram array is empty',
      code: 'EMPTY_ARRAY',
    });
  }

  // Validate each diagram
  data.forEach((diagram: unknown, index: number) => {
    const result = validateDiagram(diagram);
    if (!result.valid) {
      result.errors.forEach((error) => {
        errors.push({
          ...error,
          field: `[${index}].${error.field}`,
        });
      });
    }
    if (result.warnings) {
      result.warnings.forEach((warning) => {
        warnings.push({
          ...warning,
          field: `[${index}].${warning.field}`,
        });
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

/**
 * Formats validation errors into a human-readable message
 *
 * @param result - The validation result
 * @returns Formatted error message
 */
export const formatValidationErrors = (result: ValidationResult): string => {
  if (result.valid) {
    return 'Validation passed successfully.';
  }

  const messages: string[] = [];

  result.errors.forEach((error) => {
    messages.push(`❌ ${error.field}: ${error.message}${error.code ? ` (${error.code})` : ''}`);
  });

  if (result.warnings && result.warnings.length > 0) {
    messages.push('');
    messages.push('Warnings:');
    result.warnings.forEach((warning) => {
      messages.push(`⚠️  ${warning.field}: ${warning.message}${warning.code ? ` (${warning.code})` : ''}`);
    });
  }

  return messages.join('\n');
};
