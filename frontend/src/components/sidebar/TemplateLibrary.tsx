/**
 * Preset Library Component
 *
 * Displays a library of reusable node presets (templates with pre-filled values).
 * Users can drag presets onto the canvas or click to add them.
 */

import { useEffect, useState } from 'react';
import { Search, Grid3x3, List, Trash2, Plus, Loader2 } from 'lucide-react';
import { useTemplateStore, useFilteredTemplates, useTemplateCategories } from '@/store/templateStore';
import { templateToNode } from '@/services/templates/templateUtils';
import type { Template, TemplateCategory } from '@/types';
import clsx from 'clsx';

/**
 * Template Library Props
 */
interface TemplateLibraryProps {
  /** Callback when template is selected */
  onTemplateSelect?: (template: Template) => void;

  /** Callback when template is dragged */
  onTemplateDrag?: (template: Template) => void;

  /** Whether to show delete buttons */
  canDelete?: boolean;

  /** CSS class name */
  className?: string;
}

/**
 * Category display configuration
 */
const CATEGORY_CONFIG: Record<TemplateCategory | 'all', { label: string; icon: string; color: string }> = {
  all: { label: 'All', icon: '📦', color: '#8b5cf6' },
  database: { label: 'Database', icon: '🗄️', color: '#3b82f6' },
  service: { label: 'Service', icon: '⚙️', color: '#22c55e' },
  infrastructure: { label: 'Infrastructure', icon: '🏗️', color: '#f97316' },
  external: { label: 'External', icon: '🔗', color: '#9ca3af' },
  component: { label: 'Component', icon: '🧩', color: '#ec4899' },
  container: { label: 'Container', icon: '📦', color: '#0ea5e9' },
  custom: { label: 'Custom', icon: '✨', color: '#8b5cf6' },
};

/**
 * Template Library Component
 */
export function TemplateLibrary({
  onTemplateSelect,
  onTemplateDrag,
  canDelete = true,
  className,
}: TemplateLibraryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [draggedTemplate, setDraggedTemplate] = useState<Template | null>(null);

  // Store state
  const { isLoading, error, searchQuery, setSearchQuery, activeCategory, setActiveCategory, deleteTemplate, loadTemplates, seedTemplates, isSeeded, templates } = useTemplateStore();

  // Computed state
  const filteredTemplates = useFilteredTemplates();
  const categories = useTemplateCategories();

  // Initialize templates on mount
  useEffect(() => {
    const initializeTemplates = async () => {
      await loadTemplates();

      // Seed default templates if no templates exist
      if (templates.length === 0 && !isSeeded) {
        await seedTemplates();
      }
    };

    initializeTemplates();
  }, []);

  // Handle template selection
  const handleTemplateClick = (template: Template) => {
    onTemplateSelect?.(template);
  };

  // Handle template drag start
  const handleDragStart = (e: React.DragEvent, template: Template) => {
    setDraggedTemplate(template);

    // Set drag data for React Flow
    const dragData = {
      type: 'template',
      templateId: template.id,
      name: template.name,
    };
    e.dataTransfer.setData('application/reactflow', JSON.stringify(dragData));

    e.dataTransfer.effectAllowed = 'copy';
    onTemplateDrag?.(template);
  };

  // Handle template drag end
  const handleDragEnd = () => {
    setDraggedTemplate(null);
  };

  // Handle template deletion
  const handleDelete = async (e: React.MouseEvent, template: Template) => {
    e.stopPropagation();
    if (confirm(`Delete template "${template.name}"?`)) {
      await deleteTemplate(template.id);
    }
  };

  // Render template card
  const renderTemplateCard = (template: Template) => {
    const categoryInfo = CATEGORY_CONFIG[template.category || 'custom'];

    return (
      <div
        key={template.id}
        draggable
        onDragStart={(e) => handleDragStart(e, template)}
        onDragEnd={handleDragEnd}
        onClick={() => handleTemplateClick(template)}
        className={clsx(
          'template-card group relative',
          'bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400',
          'cursor-pointer transition-all duration-200',
          'hover:shadow-lg hover:-translate-y-1',
          'overflow-hidden'
        )}
        style={{
          minHeight: viewMode === 'grid' ? '140px' : '60px',
        }}
      >
        {/* Thumbnail or placeholder */}
        {viewMode === 'grid' && (
          <div className="relative h-24 bg-gray-50 flex items-center justify-center">
            {template.thumbnail ? (
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: categoryInfo.color + '20' }}
              >
                {template.data.icon || categoryInfo.icon}
              </div>
            )}

            {/* Category badge */}
            <div
              className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium text-white"
              style={{ backgroundColor: categoryInfo.color }}
            >
              {categoryInfo.label}
            </div>
          </div>
        )}

        {/* Template info */}
        <div className={clsx('p-3', viewMode === 'grid' ? '' : 'flex items-center gap-3')}>
          {viewMode === 'list' && (
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center text-lg shrink-0"
              style={{ backgroundColor: categoryInfo.color + '20' }}
            >
              {template.data.icon || categoryInfo.icon}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-800 truncate">
              {template.name}
            </div>
            {template.description && viewMode === 'grid' && (
              <div className="text-xs text-gray-500 truncate mt-1">
                {template.description}
              </div>
            )}
          </div>

          {/* Delete button */}
          {canDelete && !template.isPublic && (
            <button
              onClick={(e) => handleDelete(e, template)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg"
              title="Delete template"
            >
              <Trash2 size={14} className="text-red-500" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render category filter
  const renderCategoryFilter = (category: TemplateCategory | 'all') => {
    const config = CATEGORY_CONFIG[category];
    const isActive = activeCategory === category;

    return (
      <button
        key={category}
        onClick={() => setActiveCategory(category)}
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
          isActive
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
        )}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </button>
    );
  };

  // Loading state
  if (isLoading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <span className="ml-3 text-gray-600">Loading presets...</span>
      </div>
    );
  }

  // Error state
  if (error && templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <div className="text-red-500 mb-2">Failed to load presets</div>
        <div className="text-sm text-gray-600 mb-4">{error}</div>
        <button
          onClick={() => loadTemplates()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={clsx('template-library flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Presets</h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {filteredTemplates.length} preset{filteredTemplates.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              )}
              title="Grid view"
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              )}
              title="List view"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {categories.map(renderCategoryFilter)}
        </div>
      </div>

      {/* Presets grid/list */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-400 text-4xl mb-3">🔍</div>
            <div className="text-gray-600 font-medium">No presets found</div>
            <div className="text-sm text-gray-500 mt-1">
              Try adjusting your search or filter
            </div>
          </div>
        ) : (
          <div
            className={clsx(
              'gap-3',
              viewMode === 'grid'
                ? 'grid grid-cols-2'
                : 'flex flex-col'
            )}
          >
            {filteredTemplates.map(renderTemplateCard)}
          </div>
        )}
      </div>

      {/* Drag preview */}
      {draggedTemplate && (
        <div className="fixed pointer-events-none opacity-50 z-50">
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <div className="text-sm font-medium">{draggedTemplate.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplateLibrary;
