/**
 * EditorHeader Component
 *
 * Header bar for the diagram editor with branding, diagram name,
 * view mode toggle, theme toggle, sync status, and action buttons.
 */

import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Settings,
  User,
  Save,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useDiagramStore } from '@/store/diagramStore';
import { useUIStore } from '@/store/uiStore';
import { useSyncManager } from '@/hooks/useSyncManager';
import { ViewModeToggle } from '@/components/common/ViewModeToggle';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { SyncStatusIndicator } from '@/components/editor/SyncStatusIndicator';
import { exportService } from '@/services/export';
import { clsx } from 'clsx';

export interface EditorHeaderProps {
  /** Additional CSS classes */
  className?: string;

  /** Callback when save is triggered */
  onSave?: () => void;

  /** Callback when export is triggered */
  onExport?: () => void;
}

/**
 * Editor header component
 */
export function EditorHeader({ className, onSave, onExport }: EditorHeaderProps) {
  const { diagramId } = useParams<{ diagramId?: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Stores
  const { currentDiagram, nodes, edges } = useDiagramStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  // Sync manager
  const { syncState, forceSync, isSyncing } = useSyncManager();

  // Local state
  const [diagramName, setDiagramName] = useState(currentDiagram?.name || 'Untitled Diagram');
  const [isEditingName, setIsEditingName] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Update diagram name when current diagram changes
  useEffect(() => {
    if (currentDiagram?.name) {
      setDiagramName(currentDiagram.name);
    }
  }, [currentDiagram?.name]);

  // Update save status based on sync state
  useEffect(() => {
    if (isSyncing) {
      setSaveStatus('saving');
    } else if (syncState.visualChangesPending || syncState.codeChangesPending) {
      setSaveStatus('unsaved');
    } else {
      setSaveStatus('saved');
    }
  }, [isSyncing, syncState.visualChangesPending, syncState.codeChangesPending]);

  // Handle diagram name change
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDiagramName(e.target.value);
  }, []);

  // Handle name save
  const handleNameSave = useCallback(() => {
    setIsEditingName(false);
    // TODO: Update diagram name in store
  }, []);

  // Handle name key down
  const handleNameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setDiagramName(currentDiagram?.name || 'Untitled Diagram');
      setIsEditingName(false);
    }
  }, [handleNameSave, currentDiagram?.name]);

  // Handle save
  const handleSave = useCallback(() => {
    onSave?.();
    setSaveStatus('saved');
  }, [onSave]);

  // Handle export
  const handleExport = useCallback(() => {
    if (!currentDiagram) return;

    onExport?.();

    // Export diagram to JSON
    exportService.exportDiagram(currentDiagram, {
      format: 'json',
      includeMetadata: true,
      includeCustomCSS: true,
      includeLayout: true,
      pretty: true,
    });
  }, [currentDiagram, onExport]);

  // Handle force sync
  const handleForceSync = useCallback(() => {
    forceSync();
  }, [forceSync]);

  return (
    <header
      className={clsx(
        'editor-header',
        'flex items-center justify-between gap-4',
        'px-4 lg:px-6',
        'bg-white border-b border-gray-200',
        'shadow-sm z-30',
        className
      )}
    >
      {/* Left Section - Branding & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          type="button"
        >
          {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>

        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          {diagramId && (
            <div className="hidden sm:block">
              {isEditingName ? (
                <input
                  type="text"
                  value={diagramName}
                  onChange={handleNameChange}
                  onBlur={handleNameSave}
                  onKeyDown={handleNameKeyDown}
                  className="text-sm font-semibold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 px-1 py-0.5"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left px-1 py-0.5 -ml-1 rounded hover:bg-gray-50"
                  title="Click to edit name"
                >
                  {diagramName}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Node/Edge Count Badge */}
        {diagramId && (
          <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
            <span className="font-medium">{nodes.length}</span>
            <span>nodes</span>
            <span className="text-gray-400">•</span>
            <span className="font-medium">{edges.length}</span>
            <span>edges</span>
          </div>
        )}
      </div>

      {/* Center Section - View Mode Toggle */}
      <div className="hidden md:flex items-center justify-center">
        <ViewModeToggle size="sm" variant="default" />
      </div>

      {/* Right Section - Actions & Controls */}
      <div className="flex items-center gap-2">
        {/* Sync Status */}
        {diagramId && (
          <div className="hidden lg:block">
            <SyncStatusIndicator
              state={syncState}
              showText={false}
              onClick={handleForceSync}
            />
          </div>
        )}

        {/* Save Status */}
        {diagramId && saveStatus === 'saved' && (
          <div className="hidden sm:flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 size={14} />
            <span>Saved</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={clsx(
              'hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Save diagram (Ctrl+S)"
            type="button"
          >
            <Save size={16} />
            <span>Save</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className={clsx(
              'hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
            )}
            title="Export diagram"
            type="button"
          >
            <Download size={16} />
            <span>Export</span>
          </button>

          {/* Settings (icon only on mobile) */}
          <button
            className={clsx(
              'flex items-center justify-center p-2 rounded-lg transition-colors',
              'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
            title="Settings"
            type="button"
          >
            <Settings size={20} />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <button
            className={clsx(
              'flex items-center justify-center p-2 rounded-lg transition-colors',
              'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
            title="User menu"
            type="button"
          >
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * Compact header for mobile/smaller screens
 */
export interface EditorHeaderCompactProps {
  diagramName?: string;
  onSave?: () => void;
}

export function EditorHeaderCompact({ diagramName, onSave }: EditorHeaderCompactProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <header className="editor-header-compact h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          type="button"
        >
          {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
        <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
          {diagramName || 'Untitled'}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onSave}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          title="Save"
          type="button"
        >
          <Save size={20} />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}

export default EditorHeader;
