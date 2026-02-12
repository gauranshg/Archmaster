/**
 * Theme Toggle Component
 *
 * Provides a theme switcher button with dropdown for selecting themes.
 * Supports keyboard shortcuts (Ctrl+Shift+T) for quick theme toggling.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sun, Moon, Palette, Check, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/cn';

/**
 * Theme Toggle Props
 */
interface ThemeToggleProps {
  /** CSS class name */
  className?: string;
  /** Whether to show dropdown on hover instead of click */
  hoverToOpen?: boolean;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Button variant */
  variant?: 'ghost' | 'outline' | 'filled';
}

/**
 * Theme option interface
 */
interface ThemeOption {
  value: string;
  label: string;
  icon: string;
  description: string;
}

/**
 * Theme options for the dropdown
 */
const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    icon: '☀️',
    description: 'Clean and modern light theme',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: '🌙',
    description: 'Professional dark mode',
  },
  {
    value: 'blue',
    label: 'Blue',
    icon: '💙',
    description: 'Professional blue-themed interface',
  },
  {
    value: 'green',
    label: 'Green',
    icon: '💚',
    description: 'Natural green-themed interface',
  },
  {
    value: 'high-contrast',
    label: 'High Contrast',
    icon: '🔲',
    description: 'Maximum contrast for accessibility',
  },
  {
    value: 'system',
    label: 'System',
    icon: '💻',
    description: 'Match operating system preference',
  },
];

/**
 * Theme Toggle Component
 */
export function ThemeToggle({
  className,
  hoverToOpen = false,
  size = 'md',
  variant = 'ghost',
}: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme, isSystem, useSystemPreference } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
  };

  // Variant classes
  const variantClasses = {
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
    outline: 'border border-gray-300 dark:border-gray-600',
    filled: 'bg-gray-100 dark:bg-gray-800',
  };

  /**
   * Handle keyboard shortcut
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ctrl+Shift+T to toggle theme
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        toggleTheme();
      }
    },
    [toggleTheme]
  );

  // Register keyboard shortcut
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Handle theme selection
   */
  const handleThemeSelect = (value: string) => {
    if (value === 'system') {
      useSystemPreference();
    } else {
      setTheme(value as any);
    }
    setIsOpen(false);
  };

  /**
   * Get current theme icon
   */
  const getCurrentIcon = () => {
    if (isSystem) {
      return <Monitor size={20} />;
    }
    return theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />;
  };

  /**
   * Get current theme label
   */
  const getCurrentLabel = () => {
    if (isSystem) return 'System';
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => hoverToOpen && setIsOpen(true)}
        onMouseLeave={() => hoverToOpen && setIsOpen(false)}
        aria-label="Select theme"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={`Current theme: ${getCurrentLabel()} (Ctrl+Shift+T to toggle)`}
      >
        {getCurrentIcon()}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute right-0 mt-2 w-72 rounded-lg shadow-lg',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'z-50',
            'animate-fade-in'
          )}
          onMouseEnter={() => hoverToOpen && setIsOpen(true)}
          onMouseLeave={() => hoverToOpen && setIsOpen(false)}
          role="listbox"
          aria-label="Theme options"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette size={18} className="text-primary-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Theme
                </h3>
              </div>
              <kbd className="px-2 py-1 text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-700 rounded">
                Ctrl+Shift+T
              </kbd>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Select a theme or match your system
            </p>
          </div>

          {/* Theme Options */}
          <div className="py-2 max-h-96 overflow-y-auto">
            {THEME_OPTIONS.map((option) => {
              const isSelected = option.value === 'system'
                ? isSystem
                : theme === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'w-full px-4 py-3 flex items-start gap-3 transition-colors',
                    'hover:bg-gray-50 dark:hover:bg-gray-700',
                    'focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700',
                    isSelected && 'bg-primary-50 dark:bg-primary-900/20'
                  )}
                  onClick={() => handleThemeSelect(option.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  {/* Icon */}
                  <span className="text-2xl flex-shrink-0">
                    {option.icon}
                  </span>

                  {/* Content */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {option.label}
                      </span>
                      {isSelected && (
                        <Check size={16} className="text-primary-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Your preference is saved automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Simple theme toggle button (just light/dark, no dropdown)
 */
export function ThemeToggleSimple({
  className,
  size = 'md',
  variant = 'ghost',
}: Omit<ThemeToggleProps, 'hoverToOpen'>) {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
  };

  const variantClasses = {
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
    outline: 'border border-gray-300 dark:border-gray-600',
    filled: 'bg-gray-100 dark:bg-gray-800',
  };

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Toggle theme (Ctrl+Shift+T)`}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
