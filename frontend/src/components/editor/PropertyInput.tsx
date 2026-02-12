/**
 * PropertyInput Component
 *
 * Reusable input component for editing properties.
 * Supports text, number, color, and select input types.
 */

import { forwardRef, useCallback } from 'react';
import { cn } from '@/utils/cn';

export interface PropertyInputProps {
  /** Label for the input */
  label: string;

  /** Current value */
  value: any;

  /** Input type */
  type?: 'text' | 'number' | 'color' | 'select';

  /** Options for select type */
  options?: Array<{ value: string; label: string }>;

  /** Change handler */
  onChange: (value: any) => void;

  /** Placeholder text */
  placeholder?: string;

  /** Disabled state */
  disabled?: boolean;

  /** Minimum value for number input */
  min?: number;

  /** Maximum value for number input */
  max?: number;

  /** Step for number input */
  step?: number;

  /** Additional CSS classes */
  className?: string;
}

export const PropertyInput = forwardRef<HTMLInputElement, PropertyInputProps>(
  (
    {
      label,
      value,
      type = 'text',
      options = [],
      onChange,
      placeholder,
      disabled = false,
      min,
      max,
      step = 1,
      className,
    },
    ref
  ) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const newValue = e.target.value;

        if (type === 'number') {
          const parsed = parseFloat(newValue);
          if (!isNaN(parsed)) {
            onChange(parsed);
          } else if (newValue === '') {
            onChange('');
          }
        } else if (type === 'color') {
          onChange(newValue);
        } else {
          onChange(newValue);
        }
      },
      [type, onChange]
    );

    const handleNumberChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (newValue === '') {
          onChange('');
          return;
        }

        const parsed = parseFloat(newValue);
        if (!isNaN(parsed)) {
          // Validate min/max
          if (min !== undefined && parsed < min) {
            onChange(min);
            return;
          }
          if (max !== undefined && parsed > max) {
            onChange(max);
            return;
          }
          onChange(parsed);
        }
      },
      [onChange, min, max]
    );

    const inputId = `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>

        {type === 'select' ? (
          <select
            id={inputId}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'color' ? (
          <div className="flex items-center gap-2">
            <input
              ref={ref}
              id={inputId}
              type="color"
              value={value || '#000000'}
              onChange={handleChange}
              disabled={disabled}
              className="w-10 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              placeholder="#000000"
              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono"
            />
          </div>
        ) : type === 'number' ? (
          <input
            ref={ref}
            id={inputId}
            type="number"
            value={value ?? ''}
            onChange={handleNumberChange}
            disabled={disabled}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ) : (
          <input
            ref={ref}
            id={inputId}
            type="text"
            value={value ?? ''}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
        )}
      </div>
    );
  }
);

PropertyInput.displayName = 'PropertyInput';
