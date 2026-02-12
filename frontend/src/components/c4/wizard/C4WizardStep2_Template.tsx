/**
 * C4 Wizard Step 2: Select Starting Point
 *
 * Users can choose to:
 * - Start from an architecture template
 * - Start from a blank canvas
 * - Import an existing diagram
 */

import { useState, useMemo } from 'react';
import { File, Plus, Upload, ChevronRight, Sparkles } from 'lucide-react';
import type { WizardStepProps } from './types';
import { ARCHITECTURE_TEMPLATES, TEMPLATE_CATEGORY_INFO } from '@/services/c4';
import type { ArchitectureTemplate } from '@/services/c4';
import clsx from 'clsx';

/**
 * Starting Point Options
 */
const STARTING_OPTIONS = [
  {
    id: 'blank' as const,
    title: 'Blank Canvas',
    description: 'Start with an empty diagram and add elements manually',
    icon: <Plus size={28} />,
    color: 'from-blue-500 to-cyan-500',
    badge: 'Recommended for beginners',
  },
  {
    id: 'template' as const,
    title: 'Architecture Template',
    description: 'Start with a pre-built architecture pattern',
    icon: <Sparkles size={28} />,
    color: 'from-purple-500 to-pink-500',
    badge: 'Fastest way to start',
  },
  {
    id: 'import' as const,
    title: 'Import Existing',
    description: 'Import a diagram from JSON or YAML file',
    icon: <Upload size={28} />,
    color: 'from-green-500 to-emerald-500',
    badge: 'Continue your work',
  },
] as const;

/**
 * Template Card Component
 */
interface TemplateCardProps {
  template: ArchitectureTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  const categoryInfo = TEMPLATE_CATEGORY_INFO[template.category];

  return (
    <button
      onClick={onSelect}
      className={clsx(
        'group relative text-left p-4 rounded-xl border-2 transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-1',
        isSelected
          ? 'border-purple-500 bg-purple-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-purple-300'
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={clsx(
            'w-12 h-12 rounded-lg flex items-center justify-center text-xl',
            isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100'
          )}
          style={!isSelected ? { backgroundColor: categoryInfo.color + '20' } : {}}
        >
          {template.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{template.name}</h4>
          <p className="text-xs text-gray-500 truncate">{template.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{template.nodeCount} nodes</span>
        <span>•</span>
        <span>{template.edgeCount} connections</span>
        <span>•</span>
        <span className="px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: categoryInfo.color }}>
          {categoryInfo.label}
        </span>
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1">
        {template.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}

/**
 * Step 2: Select Starting Point
 */
export function C4WizardStep2_Template({ data, updateData }: WizardStepProps) {
  const selectedStartingPoint = data.startingPoint;
  const selectedTemplateId = data.templateId;

  // Filter templates compatible with selected C4 level
  const compatibleTemplates = useMemo(() => {
    return ARCHITECTURE_TEMPLATES.filter((t) => {
      // All templates are compatible with all C4 levels for now
      // In production, you might filter based on level
      return true;
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Starting Point</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select how you want to start creating your C4 diagram. You can always change this later.
        </p>
      </div>

      {/* Starting point options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STARTING_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              updateData('startingPoint', option.id);
              if (option.id !== 'template') {
                updateData('templateId', undefined);
              }
            }}
            className={clsx(
              'group relative text-left p-5 rounded-xl border-2 transition-all duration-200',
              'hover:shadow-lg hover:-translate-y-1',
              selectedStartingPoint === option.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-blue-300'
            )}
          >
            {/* Badge */}
            {option.badge && (
              <span className="absolute top-2 right-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                {option.badge}
              </span>
            )}

            {/* Icon */}
            <div
              className={clsx(
                'w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-colors bg-gradient-to-br',
                option.color,
                selectedStartingPoint === option.id ? 'text-white shadow-lg' : 'text-white/80 group-hover:text-white'
              )}
            >
              {option.icon}
            </div>

            {/* Title */}
            <h4 className="font-semibold text-gray-900 mb-1">{option.title}</h4>

            {/* Description */}
            <p className="text-sm text-gray-600">{option.description}</p>

            {/* Indicator for selected */}
            {selectedStartingPoint === option.id && (
              <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Template selection (shown when template is chosen) */}
      {selectedStartingPoint === 'template' && (
        <div className="mt-6 space-y-4 animate-slide-down">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-500" />
              Select an Architecture Template
            </h4>
            <span className="text-sm text-gray-500">
              {compatibleTemplates.length} templates available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {compatibleTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplateId === template.id}
                onSelect={() => updateData('templateId', template.id)}
              />
            ))}
          </div>

          {/* Template info */}
          {selectedTemplateId && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 animate-fade-in">
              {(() => {
                const template = ARCHITECTURE_TEMPLATES.find((t) => t.id === selectedTemplateId);
                if (!template) return null;
                const categoryInfo = TEMPLATE_CATEGORY_INFO[template.category];
                return (
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-white shadow-sm"
                    >
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">{template.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                        <span>{template.nodeCount} elements</span>
                        <span>•</span>
                        <span>{template.edgeCount} connections</span>
                        <span>•</span>
                        <span
                          className="px-2 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: categoryInfo.color }}
                        >
                          {categoryInfo.label}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => updateData('templateId', undefined)}
                      className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                      aria-label="Clear selection"
                    >
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Import info (shown when import is chosen) */}
      {selectedStartingPoint === 'import' && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
              <Upload size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Import Your Diagram</h4>
              <p className="text-sm text-gray-600 mb-4">
                After completing the wizard, you can import an existing diagram from JSON or YAML format.
                The importer supports diagrams exported from this platform or compatible tools.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <File size={14} />
                <span>Supported formats: JSON, YAML</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blank canvas info (shown when blank is chosen) */}
      {selectedStartingPoint === 'blank' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Plus size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Start from Scratch</h4>
              <p className="text-sm text-gray-600 mb-4">
                You will start with an empty canvas. Use the C4 Preset Gallery to add elements
                to your diagram. Elements are organized by category (People, Systems, Containers,
                Components, Infrastructure) for easy discovery.
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                  Available in next step
                </span>
                <ChevronRight size={14} />
                <span>Add elements from preset gallery</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-lg">💡</span>
          Which option should I choose?
        </h4>
        <ul className="text-sm text-gray-600 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Blank Canvas:</strong> Best when you have a specific architecture in mind</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">•</span>
            <span><strong>Template:</strong> Fastest way to start with common patterns</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">•</span>
            <span><strong>Import:</strong> Use when continuing work from another session</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default C4WizardStep2_Template;
