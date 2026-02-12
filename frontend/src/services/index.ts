/**
 * Services Index
 *
 * Central exports for all services.
 */

// Export validation service
export {
  validateDiagram,
  validateNode,
  validateEdge,
  validateDiagrams,
  formatValidationErrors,
} from './validation.js';

// Export types from validation
export type { ValidationResult, ValidationError } from '../types/common.js';

// Export import service
export { importService, defaultImportOptions } from './import.js';
export type { ImportResult, ImportOptions } from './import.js';

// Export export service
export { exportService, defaultExportOptions } from './export.js';
export type { ExportOptions, ExportResult } from './export.js';

// Export PNG export service
export {
  exportAsPNG,
  exportAndDownloadPNG,
  exportAsPNGWithProgress,
  pngExportService,
  defaultPNGOptions,
} from './export/pngExport.js';
export type { PNGExportOptions, PNGExportResult } from './export/pngExport.js';

// Export storage services
export { db } from './storage/db.js';
export { diagramStorage } from './storage/diagramStorage.js';
export { templateStorage } from './storage/templateStorage.js';
export { syncService } from './storage/sync.js';

// Export CSS service
export { cssService } from './cssService.js';
export type { CSSValidationResult, CSSValidationError } from './cssService.js';
