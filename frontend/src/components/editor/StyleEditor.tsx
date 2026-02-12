/**
 * Style Editor Component
 *
 * Provides a CSS editor with syntax highlighting, validation, and live preview.
 * Includes security checks to prevent XSS through CSS injection.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Save, X, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { cssService, type CSSValidationResult } from '@/services/cssService';

interface StyleEditorProps {
  /** Initial CSS content */
  initialCss?: string;
  /** Diagram ID for scoping */
  diagramId: string;
  /** Callback when CSS is saved */
  onSave: (css: string) => void;
  /** Callback when editor is closed */
  onClose: () => void;
  /** Whether to show live preview */
  showPreview?: boolean;
  /** CSS validation delay in ms */
  validationDelay?: number;
}

/**
 * Style Editor component
 */
export function StyleEditor({
  initialCss = '',
  diagramId,
  onSave,
  onClose,
  showPreview = true,
  validationDelay = 500,
}: StyleEditorProps) {
  const [css, setCss] = useState(initialCss);
  const [validation, setValidation] = useState<CSSValidationResult>({
    valid: true,
    sanitized: '',
    errors: [],
    dangerousLines: [],
  });
  const [isDirty, setIsDirty] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(showPreview);
  const [debouncedCss, setDebouncedCss] = useState(css);

  // Debounce CSS validation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCss(css);
    }, validationDelay);

    return () => clearTimeout(timer);
  }, [css, validationDelay]);

  // Validate CSS
  useEffect(() => {
    const result = cssService.validateCSS(debouncedCss);
    setValidation(result);
  }, [debouncedCss]);

  // Handle CSS change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCss = e.target.value;
    setCss(newCss);
    setIsDirty(newCss !== initialCss);
  }, [initialCss]);

  // Handle save
  const handleSave = useCallback(() => {
    const sanitized = cssService.sanitizeCSS(css);
    onSave(sanitized);
    setIsDirty(false);
  }, [css, onSave]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (isDirty) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmDiscard) return;
    }
    onClose();
  }, [isDirty, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Escape to close
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleCancel]);

  // Count errors and warnings
  const errorCount = useMemo(() => {
    return validation.errors.filter((e) => e.type === 'error').length;
  }, [validation.errors]);

  const warningCount = useMemo(() => {
    return validation.errors.filter((e) => e.type === 'warning').length;
  }, [validation.errors]);

  // Generate example CSS
  const exampleCss = `/* Custom CSS for Diagram Nodes */

/* Style specific node by class */
.custom-node.my-service {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #5a67d8;
  color: white;
}

/* Style specific node by ID */
#my-database-node {
  background: #f7fafc;
  border: 2px dashed #cbd5e0;
}

/* Style node content */
.custom-node .node-content {
  font-size: 16px;
  font-weight: 600;
}

/* Style icons */
.custom-node .node-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Add hover effects */
.custom-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

/* Style selected state */
.custom-node.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}`;

  return (
    <div className="style-editor">
      {/* Header */}
      <div className="style-editor-header">
        <h2 className="text-lg font-semibold text-gray-900">Custom CSS Editor</h2>
        <div className="flex items-center gap-2">
          {/* Validation Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium">
            {validation.valid ? (
              <>
                <CheckCircle2 size={16} className="text-green-600" />
                <span className="text-green-700">Valid CSS</span>
              </>
            ) : (
              <>
                <AlertTriangle size={16} className="text-red-600" />
                <span className="text-red-700">
                  {errorCount} Error{errorCount !== 1 ? 's' : ''}
                </span>
              </>
            )}
            {warningCount > 0 && (
              <>
                <span className="mx-1 text-gray-300">•</span>
                <span className="text-yellow-700">
                  {warningCount} Warning{warningCount !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>

          {/* Preview Toggle */}
          <button
            onClick={() => setPreviewEnabled(!previewEnabled)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={previewEnabled ? 'Hide Preview' : 'Show Preview'}
          >
            {previewEnabled ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>

          {/* Close Button */}
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="style-editor-content">
        {/* CSS Textarea */}
        <div className="flex-1 flex flex-col">
          <div className="relative flex-1">
            <textarea
              value={css}
              onChange={handleChange}
              className="w-full h-full font-mono text-sm p-4 bg-gray-50 border-0 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              placeholder="Enter custom CSS here..."
              spellCheck={false}
              autoFocus
            />

            {/* Line numbers overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-100 border-r border-gray-200 rounded-l-lg overflow-hidden pointer-events-none select-none">
              {css.split('\n').map((_, i) => (
                <div
                  key={i}
                  className="text-xs text-gray-400 text-right pr-2 leading-6"
                  style={{ fontFamily: 'monospace' }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Validation Errors */}
          {validation.errors.length > 0 && (
            <div className="mt-4 max-h-48 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Validation Messages
              </h3>
              <div className="space-y-2">
                {validation.errors.map((error, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 p-2 rounded-lg ${
                      error.type === 'error'
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}
                  >
                    {error.type === 'error' ? (
                      <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          error.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                        }`}
                      >
                        Line {error.line}: {error.message}
                      </p>
                      {error.rule && (
                        <p className="text-xs text-red-600 mt-1 font-mono">
                          {error.rule}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Helper Text */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tips:</strong> Use <code className="px-1 py-0.5 bg-blue-100 rounded">.custom-node</code> to target all nodes, or add custom classes/IDs to specific nodes in the Properties panel.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="style-editor-footer">
        <div className="flex items-center gap-3">
          {/* Insert Example Button */}
          <button
            onClick={() => setCss(exampleCss)}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={!isDirty && css === initialCss}
          >
            Insert Example
          </button>

          {/* Clear Button */}
          <button
            onClick={() => setCss('')}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            disabled={!css}
          >
            Clear CSS
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!isDirty || !validation.valid}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Save CSS
          </button>
        </div>
      </div>

      {/* Dirty indicator */}
      {isDirty && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
          Unsaved Changes
        </div>
      )}
    </div>
  );
}
