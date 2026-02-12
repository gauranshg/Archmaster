/**
 * C4 Preset Gallery Component
 *
 * Displays a gallery of C4 element presets that users can drag onto the canvas
 * or click to add. Organized by category with search functionality.
 */

import { useState, useMemo } from 'react';
import { Search, Grid3x3, List, Info } from 'lucide-react';
import { C4_PRESETS, getPresetsByCategory, searchPresets, PRESET_CATEGORY_CONFIG } from '@/services/c4';
import { presetToNode } from '@/services/c4/presetUtils';
import type { C4Preset } from '@/services/c4';
import type { Node } from 'reactflow';
import clsx from 'clsx';

/**
 * C4 Preset Gallery Props
 */
interface C4PresetGalleryProps {
  /** Callback when preset is selected (clicked) */
  onPresetSelect?: (node: Node) => void;

  /** Callback when preset is dragged */
  onPresetDrag?: (preset: C4Preset) => void;

  /** Filter by C4 diagram type */
  diagramType?: 'system-context' | 'container' | 'component' | 'all';

  /** CSS class name */
  className?: string;
}

/**
 * C4 Preset Gallery Component
 */
export function C4PresetGallery({
  onPresetSelect,
  onPresetDrag,
  diagramType = 'all',
  className,
}: C4PresetGalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [draggedPreset, setDraggedPreset] = useState<C4Preset | null>(null);
  const [activeCategory, setActiveCategory] = useState<C4Preset['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter presets by diagram type and category
  const filteredPresets = useMemo(() => {
    let presets = C4_PRESETS;

    // Filter by diagram type if specified
    if (diagramType !== 'all') {
      switch (diagramType) {
        case 'system-context':
          presets = presets.filter((p) => ['person', 'system'].includes(p.category));
          break;
        case 'container':
          presets = presets.filter((p) =>
            ['person', 'system', 'container', 'infrastructure'].includes(p.category)
          );
          break;
        case 'component':
          // Show all for component diagrams
          break;
      }
    }

    // Filter by category
    if (activeCategory !== 'all') {
      presets = presets.filter((p) => p.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      presets = presets.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.elementType.toLowerCase().includes(term)
      );
    }

    return presets;
  }, [diagramType, activeCategory, searchQuery]);

  // Handle preset click
  const handlePresetClick = (preset: C4Preset) => {
    const node = presetToNode(preset, {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    });
    onPresetSelect?.(node);
  };

  // Handle preset drag start
  const handleDragStart = (e: React.DragEvent, preset: C4Preset) => {
    setDraggedPreset(preset);

    // Set drag data for React Flow
    const dragData = {
      type: 'c4-preset',
      presetId: preset.id,
      name: preset.name,
      elementType: preset.elementType,
    };
    e.dataTransfer.setData('application/reactflow', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';

    onPresetDrag?.(preset);
  };

  // Handle preset drag end
  const handleDragEnd = () => {
    setDraggedPreset(null);
  };

  // Render preset card
  const renderPresetCard = (preset: C4Preset) => {
    const categoryConfig = PRESET_CATEGORY_CONFIG[preset.category];

    return (
      <div
        key={preset.id}
        draggable
        onDragStart={(e) => handleDragStart(e, preset)}
        onDragEnd={handleDragEnd}
        onClick={() => handlePresetClick(preset)}
        className={clsx(
          'preset-card group relative',
          'bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400',
          'cursor-pointer transition-all duration-200',
          'hover:shadow-lg hover:-translate-y-1',
          'overflow-hidden'
        )}
        style={{
          minHeight: viewMode === 'grid' ? '140px' : '60px',
        }}
      >
        {/* Icon and category badge */}
        {viewMode === 'grid' && (
          <div className="relative h-24 bg-gray-50 flex items-center justify-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ backgroundColor: categoryConfig.color + '20' }}
            >
              {preset.icon}
            </div>

            {/* Category badge */}
            <div
              className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium text-white"
              style={{ backgroundColor: categoryConfig.color }}
            >
              {categoryConfig.label}
            </div>
          </div>
        )}

        {/* Preset info */}
        <div className={clsx('p-3', viewMode === 'grid' ? '' : 'flex items-center gap-3')}>
          {viewMode === 'list' && (
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center text-2xl shrink-0"
              style={{ backgroundColor: categoryConfig.color + '20' }}
            >
              {preset.icon}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-800 truncate">
              {preset.name}
            </div>
            <div className="text-xs text-gray-500 truncate mt-0.5">
              {preset.description}
            </div>
            {preset.exampleTechnology && viewMode === 'grid' && (
              <div className="text-xs text-blue-600 mt-1">
                {preset.exampleTechnology}
              </div>
            )}
          </div>

          {/* Info indicator */}
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            title={`${preset.elementType} - ${preset.description}`}
          >
            <Info size={14} className="text-gray-400" />
          </div>
        </div>
      </div>
    );
  };

  // Render category filter button
  const renderCategoryFilter = (
    category: C4Preset['category'] | 'all'
  ) => {
    const config = PRESET_CATEGORY_CONFIG[category];
    const isActive = activeCategory === category;
    const count = category === 'all'
      ? C4_PRESETS.length
      : C4_PRESETS.filter((p) => p.category === category).length;

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
        title={config.description}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
        <span className={clsx(
          'text-xs px-2 py-0.5 rounded-full',
          isActive ? 'bg-blue-500' : 'bg-gray-200'
        )}>
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className={clsx('c4-preset-gallery flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-lg font-bold text-gray-800 mb-1">C4 Elements</h2>
        <p className="text-xs text-gray-600">
          Drag elements to canvas or click to add
        </p>
      </div>

      {/* Search and View Controls */}
      <div className="p-4 border-b border-gray-200">
        {/* Search */}
        <div className="relative mb-3">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search C4 elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* View toggle and results count */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {filteredPresets.length} element{filteredPresets.length !== 1 ? 's' : ''}
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

      {/* Category Filter */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
          Filter by Category
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PRESET_CATEGORY_CONFIG) as Array<keyof typeof PRESET_CATEGORY_CONFIG>).map(
            renderCategoryFilter
          )}
        </div>
      </div>

      {/* Presets Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredPresets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-400 text-4xl mb-3">🔍</div>
            <div className="text-gray-600 font-medium">No C4 elements found</div>
            <div className="text-sm text-gray-500 mt-1">
              Try adjusting your search or filter
            </div>
          </div>
        ) : (
          <div
            className={clsx(
              'gap-3',
              viewMode === 'grid' ? 'grid grid-cols-2' : 'flex flex-col'
            )}
          >
            {filteredPresets.map(renderPresetCard)}
          </div>
        )}
      </div>

      {/* Drag Preview */}
      {draggedPreset && (
        <div className="fixed pointer-events-none opacity-50 z-50">
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{draggedPreset.icon}</span>
              <div className="text-sm font-medium">{draggedPreset.name}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default C4PresetGallery;
