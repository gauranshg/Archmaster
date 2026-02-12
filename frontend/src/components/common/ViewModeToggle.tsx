/**
 * ViewModeToggle Component
 *
 * Toolbar buttons for switching between visual, code, and split view modes.
 * Displays current mode and provides keyboard shortcut hints.
 */

import { useMemo } from 'react';
import { Eye, Code, Columns } from 'lucide-react';
import { useViewMode } from '@/hooks/useViewMode';
import type { ViewMode } from '@/types';
import { clsx } from 'clsx';

export interface ViewModeToggleProps {
  /** Additional CSS classes */
  className?: string;
  /** Whether to show keyboard shortcuts */
  showShortcuts?: boolean;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Button variant */
  variant?: 'default' | 'ghost' | 'outline';
}

interface ViewModeOption {
  value: ViewMode;
  label: string;
  icon: typeof Eye;
  shortcut: string;
  description: string;
}

const VIEW_MODE_OPTIONS: ViewModeOption[] = [
  {
    value: 'visual',
    label: 'Visual',
    icon: Eye,
    shortcut: 'Ctrl+1',
    description: 'Visual canvas only',
  },
  {
    value: 'code',
    label: 'Code',
    icon: Code,
    shortcut: 'Ctrl+2',
    description: 'Code editor only',
  },
  {
    value: 'split',
    label: 'Split',
    icon: Columns,
    shortcut: 'Ctrl+3',
    description: 'Split view (50/50)',
  },
];

/**
 * View mode toggle buttons
 */
export function ViewModeToggle({
  className,
  showShortcuts = true,
  size = 'md',
  variant = 'default',
}: ViewModeToggleProps) {
  const { viewMode, setViewMode } = useViewMode();

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          button: 'w-8 h-8',
          icon: 'w-4 h-4',
          text: 'text-xs',
        };
      case 'lg':
        return {
          button: 'w-12 h-12',
          icon: 'w-6 h-6',
          text: 'text-base',
        };
      default:
        return {
          button: 'w-10 h-10',
          icon: 'w-5 h-5',
          text: 'text-sm',
        };
    }
  }, [size]);

  const variantClasses = useMemo(() => {
    switch (variant) {
      case 'ghost':
        return {
          base: 'hover:bg-gray-100 text-gray-700',
          active: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
        };
      case 'outline':
        return {
          base: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
          active: 'border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100',
        };
      default:
        return {
          base: 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm border border-gray-200',
          active: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md border-blue-600',
        };
    }
  }, [variant]);

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1.5 p-1.5 bg-white rounded-xl shadow-elevated border border-gray-200',
        className
      )}
      role="group"
      aria-label="View mode"
    >
      {VIEW_MODE_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = viewMode === option.value;

        return (
          <button
            key={option.value}
            onClick={() => setViewMode(option.value)}
            className={clsx(
              'relative flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              sizeClasses.button,
              isActive ? variantClasses.active : variantClasses.base
            )}
            title={`${option.label} mode (${option.shortcut})`}
            aria-pressed={isActive}
            type="button"
          >
            <Icon className={sizeClasses.icon} />

            <span className={clsx('font-medium', sizeClasses.text)}>
              {option.label}
            </span>

            {/* Active indicator */}
            {isActive && (
              <span className="absolute inset-0 rounded-lg ring-2 ring-blue-500 ring-offset-1 pointer-events-none" />
            )}
          </button>
        );
      })}

      {/* Keyboard shortcuts hint */}
      {showShortcuts && (
        <div className="hidden lg:flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-md ml-1">
          <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono">
            1-3
          </kbd>
        </div>
      )}
    </div>
  );
}

/**
 * Compact view mode toggle (icon-only)
 */
export interface ViewModeToggleCompactProps {
  /** Additional CSS classes */
  className?: string;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
}

export function ViewModeToggleCompact({
  className,
  size = 'md',
}: ViewModeToggleCompactProps) {
  const { viewMode, setViewMode } = useViewMode();

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-10 h-10';
    }
  }, [size]);

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1 p-1 bg-white rounded-lg shadow-sm border border-gray-200',
        className
      )}
      role="group"
      aria-label="View mode"
    >
      {VIEW_MODE_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = viewMode === option.value;

        return (
          <button
            key={option.value}
            onClick={() => setViewMode(option.value)}
            className={clsx(
              'flex items-center justify-center rounded transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              sizeClasses,
              isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-gray-100 text-gray-700'
            )}
            title={`${option.label} mode (${option.shortcut})`}
            aria-pressed={isActive}
            type="button"
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}

export default ViewModeToggle;
