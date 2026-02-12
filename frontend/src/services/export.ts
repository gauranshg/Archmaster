/**
 * Export Service
 *
 * Handles exporting diagrams to various formats (JSON, YAML).
 * Provides utilities for file downloads and data serialization.
 */

import type { Diagram } from '../types/diagram.js';
import type { ExportFormat } from '../types/common.js';
import yaml from 'js-yaml';

/**
 * Export options for diagrams
 */
export interface ExportOptions {
  /** Export format */
  format: 'json' | 'yaml';

  /** Whether to include metadata */
  includeMetadata?: boolean;

  /** Whether to pretty print the output */
  pretty?: boolean;

  /** Indentation size for pretty print */
  indent?: number;

  /** Whether to include custom CSS */
  includeCustomCSS?: boolean;

  /** Whether to include layout configuration */
  includeLayout?: boolean;
}

/**
 * Export result
 */
export interface ExportResult {
  /** Exported data as string */
  data: string;

  /** File extension */
  extension: string;

  /** MIME type */
  mimeType: string;

  /** Export format used */
  format: ExportFormat;
}

/**
 * Serializes a diagram to JSON string
 *
 * @param diagram - The diagram to export
 * @param options - Export options
 * @returns JSON string
 */
const serializeToJSON = (diagram: Diagram, options: ExportOptions): string => {
  // Clone the diagram to avoid mutations
  const data = { ...diagram };

  // Filter out fields based on options
  if (!options.includeCustomCSS && 'customCSS' in data) {
    delete (data as Partial<Diagram>).customCSS;
  }

  if (!options.includeLayout && 'layout' in data) {
    delete (data as Partial<Diagram>).layout;
  }

  if (!options.includeMetadata && 'metadata' in data) {
    delete (data as Partial<Diagram>).metadata;
  }

  // Serialize with pretty print if requested
  if (options.pretty) {
    const indent = options.indent || 2;
    return JSON.stringify(data, null, indent);
  }

  return JSON.stringify(data);
};

/**
 * Serializes a diagram to YAML string
 *
 * @param diagram - The diagram to export
 * @param options - Export options
 * @returns YAML string
 */
const serializeToYAML = (diagram: Diagram, options: ExportOptions): string => {
  // Clone the diagram to avoid mutations
  const data = { ...diagram };

  // Filter out fields based on options
  if (!options.includeCustomCSS && 'customCSS' in data) {
    delete (data as Partial<Diagram>).customCSS;
  }

  if (!options.includeLayout && 'layout' in data) {
    delete (data as Partial<Diagram>).layout;
  }

  if (!options.includeMetadata && 'metadata' in data) {
    delete (data as Partial<Diagram>).metadata;
  }

  // Serialize to YAML
  return yaml.dump(data, {
    indent: options.indent || 2,
    lineWidth: -1, // Don't line wrap
    noRefs: true, // Don't use references
    sortKeys: false, // Preserve key order
  });
};

/**
 * Gets the file extension for a given format
 *
 * @param format - Export format
 * @returns File extension (with dot)
 */
const getExtension = (format: 'json' | 'yaml'): string => {
  return format === 'yaml' ? '.yaml' : '.json';
};

/**
 * Gets the MIME type for a given format
 *
 * @param format - Export format
 * @returns MIME type string
 */
const getMimeType = (format: 'json' | 'yaml'): string => {
  return format === 'yaml' ? 'text/yaml' : 'application/json';
};

/**
 * Generates a safe filename from a string
 *
 * @param name - The name to sanitize
 * @returns Safe filename
 */
const sanitizeFilename = (name: string): string => {
  // Remove invalid filename characters
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 200); // Limit length
};

/**
 * Export service
 */
export const exportService = {
  /**
   * Exports a diagram to a string in the specified format
   *
   * @param diagram - The diagram to export
   * @param options - Export options
   * @returns Export result with data and metadata
   */
  exportDiagram(diagram: Diagram, options: ExportOptions): ExportResult {
    try {
      let data: string;

      switch (options.format) {
        case 'yaml':
          data = serializeToYAML(diagram, options);
          break;
        case 'json':
        default:
          data = serializeToJSON(diagram, options);
          break;
      }

      return {
        data,
        extension: getExtension(options.format),
        mimeType: getMimeType(options.format),
        format: options.format as ExportFormat,
      };
    } catch (error) {
      throw new Error(`Failed to export diagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Exports a diagram and triggers a file download
   *
   * @param diagram - The diagram to export
   * @param filename - Filename (without extension)
   * @param options - Export options
   */
  exportAsFile(diagram: Diagram, filename: string, options: ExportOptions): void {
    try {
      const result = this.exportDiagram(diagram, options);

      // Sanitize filename
      const safeFilename = sanitizeFilename(filename);
      const fullFilename = `${safeFilename}${result.extension}`;

      // Create a blob and trigger download
      const blob = new Blob([result.data], { type: result.mimeType });
      const url = URL.createObjectURL(blob);

      // Create temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = fullFilename;
      link.style.display = 'none';

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Failed to export diagram as file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Exports multiple diagrams to a single file
   *
   * @param diagrams - Array of diagrams to export
   * @param options - Export options
   * @returns Export result with data and metadata
   */
  exportMultiple(diagrams: Diagram[], options: ExportOptions): ExportResult {
    try {
      let data: string;

      switch (options.format) {
        case 'yaml':
          // YAML doesn't have a standard array format, so we create an object with indices
          const yamlData = diagrams.reduce((acc, diagram, index) => {
            acc[`diagram_${index}`] = diagram;
            return acc;
          }, {} as Record<string, Diagram>);
          data = yaml.dump(yamlData, {
            indent: options.indent || 2,
            lineWidth: -1,
            noRefs: true,
            sortKeys: false,
          });
          break;

        case 'json':
        default:
          data = options.pretty
            ? JSON.stringify(diagrams, null, options.indent || 2)
            : JSON.stringify(diagrams);
          break;
      }

      return {
        data,
        extension: getExtension(options.format),
        mimeType: getMimeType(options.format),
        format: options.format as ExportFormat,
      };
    } catch (error) {
      throw new Error(`Failed to export multiple diagrams: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Exports multiple diagrams and triggers a file download
   *
   * @param diagrams - Array of diagrams to export
   * @param filename - Filename (without extension)
   * @param options - Export options
   */
  exportMultipleAsFile(diagrams: Diagram[], filename: string, options: ExportOptions): void {
    try {
      const result = this.exportMultiple(diagrams, options);

      // Sanitize filename
      const safeFilename = sanitizeFilename(filename);
      const fullFilename = `${safeFilename}${result.extension}`;

      // Create a blob and trigger download
      const blob = new Blob([result.data], { type: result.mimeType });
      const url = URL.createObjectURL(blob);

      // Create temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = fullFilename;
      link.style.display = 'none';

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Failed to export multiple diagrams as file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Copies exported data to clipboard
   *
   * @param diagram - The diagram to export
   * @param options - Export options
   * @returns Promise that resolves when data is copied to clipboard
   */
  async exportToClipboard(diagram: Diagram, options: ExportOptions): Promise<void> {
    try {
      const result = this.exportDiagram(diagram, options);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(result.data);
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (error) {
      throw new Error(`Failed to copy to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Default export options
 */
export const defaultExportOptions: ExportOptions = {
  format: 'json',
  includeMetadata: true,
  includeCustomCSS: true,
  includeLayout: true,
  pretty: true,
  indent: 2,
};
