/**
 * C4 Wizard Step 4: Add Elements
 *
 * Allows users to add initial C4 elements to their diagram.
 * Shows recommended presets based on the selected C4 level.
 */

import { useMemo, useState, useCallback } from 'react';
import { Search, Plus, Grid3x3, List, Info, Sparkles } from 'lucide-react';
import type { WizardStepProps } from './types';
import { getPresetsForLevel, C4_PRESETS, PRESET_CATEGORY_CONFIG } from '@/services/c4';
import type { C4Preset } from '@/services/c4';
import clsx from 'clsx';

/**
 * Preset Card Component
 */
interface PresetCardProps {
  preset: C4Preset;
  isAdded: boolean;
  onToggle: () => void;
  viewMode: 'grid' | 'list';
}

function PresetCard({ preset, isAdded, onToggle, viewMode }: PresetCardProps) {
  const categoryConfig = PRESET_CATEGORY_CONFIG[preset.category];

  return (
    <button
      onClick={onToggle}
      className={clsx(
        'group relative text-left transition-all duration-200',
        viewMode === 'grid'
          ? 'p-4 rounded-xl border-2 hover:shadow-md hover:-translate-y-0.5'
          : 'p-3 rounded-lg border hover:shadow-sm',
        isAdded
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 bg-white hover:border-blue-300'
      )}
    >
      {/* Added indicator */}
      {isAdded && (
        <div className={clsx(
          'absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center',
          'bg-green-500 text-white'
        )}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className={clsx('flex gap-3', viewMode === 'list' && 'items-center')}>
        {/* Icon */}
        <div
          className={clsx(
            'flex-shrink-0 rounded-lg flex items-center justify-center',
            viewMode === 'grid' ? 'w-12 h-12 text-xl' : 'w-10 h-10 text-lg',
            isAdded ? 'bg-green-500 text-white' : 'bg-gray-100'
          )}
          style={!isAdded ? { backgroundColor: categoryConfig.color + '20' } : {}}
        >
          {preset.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate text-sm">{preset.name}</div>
          <div className="text-xs text-gray-500 truncate mt-0.5">{preset.description}</div>

          {/* Category badge and technology */}
          <div className="mt-2 flex items-center gap-2">
            <span
              className="text-xs px-2 py-0.5 rounded-md text-white"
              style={{ backgroundColor: categoryConfig.color }}
            >
              {categoryConfig.label}
            </span>
            {preset.exampleTechnology && (
              <span className="text-xs text-gray-400">{preset.exampleTechnology}</span>
            )}
          </div>
        </div>

        {/* Add/Remove button */}
        <div className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
          isAdded
            ? 'bg-green-500 text-white'
            : 'bg-gray-100 text-gray-400 group-hover:bg-blue-500 group-hover:text-white'
        )}>
          {isAdded ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <Plus size={16} />
          )}
        </div>
      </div>
    </button>
  );
}

/**
 * Step 4: Add Elements
 */
export function C4WizardStep4_Elements({ data, updateData }: WizardStepProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<C4Preset['category'] | 'all'>('all');

  // Get recommended presets based on C4 level
  const recommendedPresets = useMemo(() => {
    // Use 'all' for code level, otherwise use the c4Level
    const level = data.c4Level === 'code' ? 'all' : data.c4Level;
    return getPresetsForLevel(level === 'all' ? 'component' : level);
  }, [data.c4Level]);

  // Filter presets by category and search
  const filteredPresets = useMemo(() => {
    let presets = recommendedPresets;

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
  }, [recommendedPresets, activeCategory, searchQuery]);

  // Toggle element selection
  const handleToggleElement = useCallback((presetId: string) => {
    const selected = data.selectedElements || [];
    if (selected.includes(presetId)) {
      updateData(
        'selectedElements',
        selected.filter((id) => id !== presetId)
      );
    } else {
      updateData('selectedElements', [...selected, presetId]);
    }
  }, [data.selectedElements, updateData]);

  // Clear all selections
  const handleClearAll = useCallback(() => {
    updateData('selectedElements', []);
  }, [updateData]);

  // Add all recommended elements
  const handleAddRecommended = useCallback(() => {
    const recommendedIds = recommendedPresets.slice(0, 6).map((p) => p.id);
    updateData('selectedElements', recommendedIds);
  }, [recommendedPresets, updateData]);

  const selectedCount = data.selectedElements?.length || 0;

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Initial Elements</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select C4 elements to include in your diagram. These are recommended elements for your selected level.
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {selectedCount} element{selectedCount !== 1 ? 's' : ''} selected
          </span>
          {selectedCount > 0 && (
            <>
              <span className="text-gray-300">|</span>
              <button
                onClick={handleClearAll}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Clear all
              </button>
            </>
          )}
        </div>
        <button
          onClick={handleAddRecommended}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
        >
          <Sparkles size={16} />
          Add Recommended
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search C4 elements..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'px-3 py-2 transition-colors',
              viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            )}
            aria-label="Grid view"
          >
            <Grid3x3 size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'px-3 py-2 transition-colors',
              viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            )}
            aria-label="List view"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
            activeCategory === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          )}
        >
          <span>All</span>
          <span className={clsx(
            'text-xs px-2 py-0.5 rounded-full',
            activeCategory === 'all' ? 'bg-blue-500' : 'bg-gray-200'
          )}>
            {C4_PRESETS.length}
          </span>
        </button>
        {(Object.keys(PRESET_CATEGORY_CONFIG) as Array<keyof typeof PRESET_CATEGORY_CONFIG>).map((cat) => {
          const config = PRESET_CATEGORY_CONFIG[cat];
          const count = C4_PRESETS.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              )}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
              <span className={clsx(
                'text-xs px-2 py-0.5 rounded-full',
                activeCategory === cat ? 'bg-blue-500' : 'bg-gray-200'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Presets grid/list */}
      <div className="min-h-[300px]">
        {filteredPresets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <div className="text-gray-900 font-medium">No C4 elements found</div>
            <div className="text-sm text-gray-500 mt-1">
              Try adjusting your search or filter
            </div>
          </div>
        ) : (
          <div
            className={clsx(
              'gap-3',
              viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col'
            )}
          >
            {filteredPresets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isAdded={data.selectedElements?.includes(preset.id) || false}
                onToggle={() => handleToggleElement(preset.id)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected elements summary */}
      {selectedCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-green-900">
                  {selectedCount} element{selectedCount !== 1 ? 's' : ''} ready to add
                </div>
                <div className="text-xs text-green-700">
                  These will be added to your canvas when you create the diagram
                </div>
              </div>
            </div>
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">About C4 Elements</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              These elements follow the C4 model notation. Select elements that represent
              the key components of your system. You can always add more elements later
              using the C4 Preset Gallery in the editor.
            </p>
          </div>
        </div>
      </div>

      {/* Skip option */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Don't worry about getting everything right now. You can add, remove, and modify
          elements after creating the diagram.
        </p>
      </div>
    </div>
  );
}

export default C4WizardStep4_Elements;
