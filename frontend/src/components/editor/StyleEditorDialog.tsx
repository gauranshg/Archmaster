/**
 * Style Editor Dialog
 *
 * Modal dialog wrapper for the Style Editor component.
 */

import { createPortal } from 'react-dom';
import { StyleEditor } from './StyleEditor';

interface StyleEditorDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Initial CSS content */
  initialCss?: string;
  /** Diagram ID */
  diagramId: string;
  /** Callback when CSS is saved */
  onSave: (css: string) => void;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Whether to show live preview */
  showPreview?: boolean;
}

/**
 * Style Editor Dialog component
 */
export function StyleEditorDialog({
  isOpen,
  initialCss,
  diagramId,
  onSave,
  onClose,
  showPreview,
}: StyleEditorDialogProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Editor Panel */}
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col">
        <StyleEditor
          initialCss={initialCss}
          diagramId={diagramId}
          onSave={onSave}
          onClose={onClose}
          showPreview={showPreview}
        />
      </div>
    </div>,
    document.body
  );
}
