/**
 * SplitView Component
 *
 * Resizable split view container for visual canvas and code editor.
 * Supports visual-only, code-only, and split modes with draggable separator.
 */

import { useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { useViewMode } from '@/hooks/useViewMode';
import { clsx } from 'clsx';
import { GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';

export interface SplitViewProps {
  /** Visual panel content (canvas) */
  visualContent: ReactNode;
  /** Code panel content (editor) */
  codeContent: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Minimum panel width in pixels */
  minPanelWidth?: number;
  /** Initial split ratio (0-1) */
  initialSplitRatio?: number;
  /** Panel orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Show collapse buttons */
  showCollapseButtons?: boolean;
}

/**
 * Split view with resizable panels
 */
export function SplitView({
  visualContent,
  codeContent,
  className,
  minPanelWidth = 300,
  initialSplitRatio = 0.5,
  orientation = 'horizontal',
  showCollapseButtons = true,
}: SplitViewProps) {
  const {
    viewMode,
    splitRatio,
    setSplitRatio,
    visualPanelCollapsed,
    codePanelCollapsed,
    toggleVisualPanel,
    toggleCodePanel,
    expandVisualPanel,
    expandCodePanel,
  } = useViewMode();

  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef(0);
  const startRatioRef = useRef(0);

  // Calculate panel widths based on split ratio
  const getPanelStyles = useCallback(() => {
    const visualPercent = visualPanelCollapsed ? 0 : codePanelCollapsed ? 100 : splitRatio * 100;
    const codePercent = codePanelCollapsed ? 0 : visualPanelCollapsed ? 100 : (1 - splitRatio) * 100;

    if (orientation === 'horizontal') {
      return {
        visual: { width: `${visualPercent}%`, height: '100%' },
        code: { width: `${codePercent}%`, height: '100%' },
      };
    } else {
      return {
        visual: { width: '100%', height: `${visualPercent}%` },
        code: { width: '100%', height: `${codePercent}%` },
      };
    }
  }, [splitRatio, visualPanelCollapsed, codePanelCollapsed, orientation]);

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsResizing(true);

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      startPosRef.current = orientation === 'horizontal' ? clientX : clientY;
      startRatioRef.current = splitRatio;

      // Add global event listeners
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.addEventListener('touchmove', handleResizeMove);
      document.addEventListener('touchend', handleResizeEnd);

      // Prevent text selection during resize
      document.body.style.userSelect = 'none';
      document.body.style.cursor = orientation === 'horizontal' ? 'col-resize' : 'row-resize';
    },
    [splitRatio, orientation]
  );

  // Handle resize move
  const handleResizeMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isResizing || !containerRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const currentPosition = orientation === 'horizontal' ? clientX : clientY;
      const deltaX = currentPosition - startPosRef.current;

      const containerSize =
        orientation === 'horizontal'
          ? containerRef.current.offsetWidth
          : containerRef.current.offsetHeight;

      // Calculate new ratio
      const newRatio = startRatioRef.current + deltaX / containerSize;

      // Clamp ratio based on minimum panel width
      const minRatio = minPanelWidth / containerSize;
      const maxRatio = 1 - minRatio;

      setSplitRatio(Math.max(minRatio, Math.min(maxRatio, newRatio)));
    },
    [isResizing, orientation, minPanelWidth, setSplitRatio]
  );

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);

    // Remove global event listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.removeEventListener('touchmove', handleResizeMove);
    document.removeEventListener('touchend', handleResizeEnd);

    // Reset body styles
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, [handleResizeMove]);

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.removeEventListener('touchmove', handleResizeMove);
      document.removeEventListener('touchend', handleResizeEnd);
    };
  }, [handleResizeMove, handleResizeEnd]);

  // Render based on view mode
  if (viewMode === 'visual') {
    return (
      <div className={clsx('w-full h-full overflow-hidden', className)}>
        {visualContent}
      </div>
    );
  }

  if (viewMode === 'code') {
    return (
      <div className={clsx('w-full h-full overflow-hidden', className)}>
        {codeContent}
      </div>
    );
  }

  // Split view mode
  const panelStyles = getPanelStyles();
  const showSeparator = !visualPanelCollapsed && !codePanelCollapsed;

  return (
    <div
      ref={containerRef}
      className={clsx(
        'flex w-full h-full overflow-hidden',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        className
      )}
    >
      {/* Visual Panel */}
      <div
        className={clsx(
          'relative overflow-hidden transition-all duration-300 ease-in-out',
          'bg-white border-r border-gray-200'
        )}
        style={panelStyles.visual}
      >
        {visualContent}

        {/* Collapse button (left side) */}
        {showCollapseButtons && !visualPanelCollapsed && (
          <button
            onClick={toggleVisualPanel}
            className={clsx(
              'absolute top-1/2 -translate-y-1/2 z-10',
              'flex items-center justify-center',
              'w-8 h-8 rounded-lg shadow-lg border border-gray-200',
              'bg-white hover:bg-gray-50 text-gray-600',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              orientation === 'horizontal' ? '-right-4' : '-bottom-4'
            )}
            title="Collapse visual panel"
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Separator */}
      {showSeparator && (
        <div
          className={clsx(
            'relative flex-shrink-0 z-10',
            'bg-gray-200 hover:bg-blue-300 transition-colors duration-200',
            orientation === 'horizontal'
              ? 'w-1 cursor-col-resize hover:w-2'
              : 'h-1 cursor-row-resize hover:h-2'
          )}
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          role="separator"
          aria-orientation={orientation}
          aria-valuenow={Math.round(splitRatio * 100)}
          aria-valuemin={Math.round((minPanelWidth / (containerRef.current?.offsetWidth || 1000)) * 100)}
          aria-valuemax={100}
        >
          {/* Drag handle */}
          <div
            className={clsx(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'flex items-center justify-center',
              'text-gray-400 hover:text-blue-600',
              'transition-colors duration-200'
            )}
          >
            <GripVertical
              className={clsx(
                'opacity-0 hover:opacity-100',
                orientation === 'horizontal' ? 'h-8 w-3' : 'w-8 h-3'
              )}
            />
          </div>

          {/* Size indicator (shows on hover) */}
          <div
            className={clsx(
              'absolute top-1/2 -translate-y-1/2',
              'px-2 py-1 bg-gray-900 text-white text-xs rounded',
              'opacity-0 hover:opacity-100 transition-opacity duration-200',
              'pointer-events-none whitespace-nowrap',
              orientation === 'horizontal' ? 'left-1/2 -translate-x-1/2 -top-8' : 'top-1/2 left-1/2 -translate-x-1/2 -left-8'
            )}
          >
            {Math.round(splitRatio * 100)}%
          </div>
        </div>
      )}

      {/* Code Panel */}
      <div
        className={clsx(
          'relative overflow-hidden transition-all duration-300 ease-in-out',
          'bg-white'
        )}
        style={panelStyles.code}
      >
        {codeContent}

        {/* Collapse button (right side) */}
        {showCollapseButtons && !codePanelCollapsed && (
          <button
            onClick={toggleCodePanel}
            className={clsx(
              'absolute top-1/2 -translate-y-1/2 z-10',
              'flex items-center justify-center',
              'w-8 h-8 rounded-lg shadow-lg border border-gray-200',
              'bg-white hover:bg-gray-50 text-gray-600',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              orientation === 'horizontal' ? '-left-4' : '-top-4'
            )}
            title="Collapse code panel"
            type="button"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Expand button (when collapsed) */}
        {showCollapseButtons && codePanelCollapsed && (
          <button
            onClick={expandCodePanel}
            className={clsx(
              'absolute top-1/2 -translate-y-1/2 z-10',
              'flex items-center justify-center',
              'w-8 h-8 rounded-lg shadow-lg border border-gray-200',
              'bg-white hover:bg-gray-50 text-gray-600',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              orientation === 'horizontal' ? '-left-4' : '-top-4'
            )}
            title="Expand code panel"
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand button for visual panel (when collapsed) */}
      {showCollapseButtons && visualPanelCollapsed && (
        <button
          onClick={expandVisualPanel}
          className={clsx(
            'absolute top-1/2 z-10',
            'flex items-center justify-center',
            'w-8 h-8 rounded-lg shadow-lg border border-gray-200',
            'bg-white hover:bg-gray-50 text-gray-600',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            orientation === 'horizontal' ? '-right-4' : '-bottom-4'
          )}
          title="Expand visual panel"
          type="button"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Responsive split view wrapper
 * Automatically switches to vertical stacking on small screens
 */
export interface ResponsiveSplitViewProps extends Omit<SplitViewProps, 'orientation'> {
  /** Breakpoint for switching to vertical layout */
  breakpoint?: number;
}

export function ResponsiveSplitView({
  breakpoint = 768,
  ...props
}: ResponsiveSplitViewProps) {
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const orientation = screenWidth < breakpoint ? 'vertical' : 'horizontal';

  return <SplitView {...props} orientation={orientation} />;
}

export default SplitView;
