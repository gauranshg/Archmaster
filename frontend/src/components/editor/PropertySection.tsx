/**
 * PropertySection Component
 *
 * Collapsible section for organizing related properties.
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PropertySectionProps {
  /** Section title */
  title: string;

  /** Section content */
  children: React.ReactNode;

  /** Default open state */
  defaultOpen?: boolean;

  /** Additional CSS classes */
  className?: string;
}

export function PropertySection({
  title,
  children,
  defaultOpen = true,
  className,
}: PropertySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('border-b border-gray-200 dark:border-gray-700', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-3 py-3 space-y-3 bg-gray-50/50 dark:bg-gray-800/50">
          {children}
        </div>
      )}
    </div>
  );
}
