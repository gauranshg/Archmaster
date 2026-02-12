/**
 * Template Selector Component
 *
 * Dropdown for selecting node templates.
 * Shows template name, description, and preview.
 */

import { memo } from 'react';
import { useTemplateStore } from '@/store/templateStore';
import type { Template } from '@/types';

interface TemplateSelectorProps {
  /** Currently selected template ID */
  selectedTemplateId?: string;
  /** Callback when template is selected */
  onSelect: (templateId: string | undefined) => void;
  /** Filter templates by category (optional) */
  categoryFilter?: string;
}

/**
 * Template selector dropdown
 */
export const TemplateSelector = memo(({ selectedTemplateId, onSelect, categoryFilter }: TemplateSelectorProps) => {
  const { templates } = useTemplateStore();

  // Filter templates by category if specified
  const filteredTemplates = categoryFilter
    ? templates.filter(t => t.category === categoryFilter)
    : templates;

  // Group templates by category
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const category = template.category || 'custom';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSelect(value || undefined);
  };

  return (
    <div className="template-selector">
      <label
        htmlFor="template-select"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Template
      </label>

      <select
        id="template-select"
        value={selectedTemplateId || ''}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="">No Template (Legacy)</option>

        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
            {categoryTemplates.map(template => (
              <option key={template.id} value={template.id}>
                {template.isSystemTemplate ? '⭐ ' : ''}{template.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {selectedTemplate && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {selectedTemplate.description && (
            <p>{selectedTemplate.description}</p>
          )}
          {selectedTemplate.isSystemTemplate && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              ⭐ System Template
            </p>
          )}
        </div>
      )}
    </div>
  );
});

TemplateSelector.displayName = 'TemplateSelector';

export default TemplateSelector;
