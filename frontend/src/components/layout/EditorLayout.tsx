/**
 * EditorLayout Component
 *
 * Main layout wrapper for the diagram editor.
 * Provides responsive grid layout with header, sidebar, main content, and properties panel.
 */

import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { useUIStore } from '@/store/uiStore';

export interface EditorLayoutProps {
  /** Header content */
  header: ReactNode;

  /** Sidebar content (template library) */
  sidebar?: ReactNode;

  /** Main content area (canvas/code editor) */
  children: ReactNode;

  /** Properties panel content */
  propertiesPanel?: ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Whether sidebar is collapsible */
  sidebarCollapsible?: boolean;

  /** Whether properties panel is collapsible */
  propertiesCollapsible?: boolean;
}

/**
 * Editor layout component with responsive design
 */
export function EditorLayout({
  header,
  sidebar,
  children,
  propertiesPanel,
  className,
  sidebarCollapsible = true,
  propertiesCollapsible = true,
}: EditorLayoutProps) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const propertiesPanelOpen = useUIStore((state) => state.propertiesPanelOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const togglePropertiesPanel = useUIStore((state) => state.togglePropertiesPanel);

  return (
    <div
      className={clsx(
        'editor-layout',
        'flex flex-col h-screen overflow-hidden bg-gray-50',
        className
      )}
    >
      {/* Header */}
      <header className="editor-header flex-shrink-0 z-30">
        {header}
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Sidebar Backdrop (mobile) */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/20 z-20 lg:hidden"
                onClick={toggleSidebar}
                aria-hidden="true"
              />
            )}

            {/* Sidebar Panel */}
            <aside
              className={clsx(
                'sidebar-panel',
                'flex-shrink-0 z-20',
                'bg-white border-r border-gray-200',
                'transition-all duration-300 ease-in-out',
                'fixed lg:relative h-[calc(100vh-64px)] top-16 left-0',
                sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'
              )}
            >
              <div className={clsx('h-full overflow-hidden', !sidebarOpen && 'lg:opacity-0')}>
                {sidebar}
              </div>
            </aside>
          </>
        )}

        {/* Main Content Area */}
        <main
          className={clsx(
            'main-content',
            'flex-1 flex flex-col overflow-hidden relative',
            sidebarOpen && 'lg:ml-0'
          )}
        >
          {/* Canvas/Code Editor Area */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>

          {/* Properties Panel */}
          {propertiesPanel && (
            <div
              className={clsx(
                'properties-panel-wrapper',
                'flex-shrink-0 z-10',
                'bg-white border-t border-gray-200',
                'transition-all duration-300 ease-in-out',
                propertiesPanelOpen ? 'h-64' : 'h-0 overflow-hidden'
              )}
            >
              <div className="h-full overflow-y-auto">
                {propertiesPanel}
              </div>
            </div>
          )}

          {/* Properties Panel Toggle Button */}
          {propertiesCollapsible && propertiesPanel && (
            <button
              onClick={togglePropertiesPanel}
              className={clsx(
                'properties-panel-toggle',
                'absolute bottom-4 right-4 z-20',
                'flex items-center justify-center',
                'w-10 h-10 rounded-lg shadow-lg',
                'bg-white hover:bg-gray-50 border border-gray-200',
                'text-gray-600 hover:text-gray-900',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                propertiesPanelOpen && 'translate-y-[calc(100%-4rem-16px)]'
              )}
              title={propertiesPanelOpen ? 'Hide properties' : 'Show properties'}
              type="button"
            >
              <svg
                className={clsx(
                  'w-5 h-5 transition-transform duration-200',
                  propertiesPanelOpen ? 'rotate-180' : ''
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * Layout section components for more control
 */
export interface EditorLayoutSectionProps {
  children: ReactNode;
  className?: string;
}

export function EditorHeader({ children, className }: EditorLayoutSectionProps) {
  return (
    <div className={clsx('editor-header-section h-16 bg-white border-b border-gray-200', className)}>
      {children}
    </div>
  );
}

export function EditorSidebar({ children, className }: EditorLayoutSectionProps) {
  return (
    <div className={clsx('editor-sidebar-section', className)}>
      {children}
    </div>
  );
}

export function EditorMain({ children, className }: EditorLayoutSectionProps) {
  return (
    <div className={clsx('editor-main-section', className)}>
      {children}
    </div>
  );
}

export function EditorProperties({ children, className }: EditorLayoutSectionProps) {
  return (
    <div className={clsx('editor-properties-section', className)}>
      {children}
    </div>
  );
}

export default EditorLayout;
