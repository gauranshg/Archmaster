/**
 * Variable Input Component
 *
 * Dynamic form input for template variables.
 * Handles all variable types: text, number, boolean, select, color, icon, textarea, code.
 */

import { memo } from 'react';
import type { TemplateVariable, TemplateVariableType } from '@/types';

interface VariableInputProps {
  /** Variable definition */
  variable: TemplateVariable;
  /** Current value */
  value: any;
  /** Callback when value changes */
  onChange: (value: any) => void;
  /** Error message (if validation failed) */
  error?: string;
}

/**
 * Variable input component
 */
export const VariableInput = memo(({ variable, value, onChange, error }: VariableInputProps) => {
  const effectiveValue = value !== undefined ? value : variable.defaultValue;

  const handleChange = (newValue: any) => {
    onChange(newValue);
  };

  // Render input based on type
  const renderInput = () => {
    switch (variable.type) {
      case 'text':
        return (
          <input
            type="text"
            value={effectiveValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={variable.placeholder}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={effectiveValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={variable.placeholder}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={effectiveValue ?? ''}
            onChange={(e) => handleChange(e.target.value ? parseFloat(e.target.value) : undefined)}
            min={variable.min}
            max={variable.max}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={effectiveValue || false}
              onChange={(e) => handleChange(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {effectiveValue ? 'Yes' : 'No'}
            </span>
          </label>
        );

      case 'select':
        return (
          <select
            value={effectiveValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {variable.required && (
              <option value="" disabled>
                Select an option...
              </option>
            )}
            {!variable.required && (
              <option value="">None</option>
            )}
            {variable.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'color':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={effectiveValue || '#000000'}
              onChange={(e) => handleChange(e.target.value)}
              className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={effectiveValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="#000000"
              className={`flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
          </div>
        );

      case 'icon':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={effectiveValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="🔥"
              className={`flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-2xl ${
                error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {effectiveValue && (
              <div className="text-3xl p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                {effectiveValue}
              </div>
            )}
          </div>
        );

      case 'code':
        return (
          <textarea
            value={effectiveValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={variable.placeholder}
            rows={6}
            className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            spellCheck={false}
          />
        );

      default:
        return (
          <input
            type="text"
            value={effectiveValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        );
    }
  };

  return (
    <div className="variable-input">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {variable.label}
        {variable.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {renderInput()}

      {variable.description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {variable.description}
        </p>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Number type: show range hint */}
      {variable.type === 'number' && (variable.min !== undefined || variable.max !== undefined) && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {variable.min !== undefined && `Min: ${variable.min}`}
          {variable.min !== undefined && variable.max !== undefined && ' • '}
          {variable.max !== undefined && `Max: ${variable.max}`}
        </p>
      )}
    </div>
  );
});

VariableInput.displayName = 'VariableInput';

export default VariableInput;
