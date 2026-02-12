/**
 * C4 Wizard Step 1: Choose C4 Level
 *
 * Helps users select the appropriate C4 diagram level for their needs.
 * Provides explanations and visual examples for each level.
 */

import { useMemo } from 'react';
import { Check, Info } from 'lucide-react';
import type { WizardStepProps } from './types';
import { C4_LEVELS, type C4Level } from '@/services/c4/wizard';
import clsx from 'clsx';

/**
 * C4 Level Selection Card
 */
interface LevelCardProps {
  level: C4Level;
  isSelected: boolean;
  onSelect: () => void;
}

function LevelCard({ level, isSelected, onSelect }: LevelCardProps) {
  return (
    <button
      onClick={onSelect}
      className={clsx(
        'group relative text-left p-5 rounded-xl border-2 transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-1',
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-blue-300'
      )}
      aria-pressed={isSelected}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <Check size={14} className="text-white" />
        </div>
      )}

      {/* Icon */}
      <div
        className={clsx(
          'w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-3 transition-colors',
          isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 group-hover:bg-blue-100'
        )}
      >
        {level.icon}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 mb-1">{level.name}</h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{level.description}</p>

      {/* When to use */}
      <div className="flex items-start gap-2 text-xs text-gray-500">
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <span><strong>When to use:</strong> {level.whenToUse}</span>
      </div>

      {/* Scope badge */}
      <div className="mt-3">
        <span
          className={clsx(
            'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium',
            isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
          )}
        >
          {level.scope}
        </span>
      </div>

      {/* Example elements */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {level.exampleElements.slice(0, 3).map((element) => (
          <span
            key={element}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
          >
            {element}
          </span>
        ))}
        {level.exampleElements.length > 3 && (
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
            +{level.exampleElements.length - 3} more
          </span>
        )}
      </div>
    </button>
  );
}

/**
 * Step 1: Choose C4 Level
 */
export function C4WizardStep1_Level({ data, updateData }: WizardStepProps) {
  const selectedLevel = data.c4Level;

  const levels: readonly C4Level[] = useMemo(() => C4_LEVELS, []);

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your C4 Diagram Level</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          The C4 model provides four levels of diagrams for describing software architecture.
          Select the level that best fits your current needs.
        </p>
      </div>

      {/* Level comparison hint */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <Info size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">Understanding C4 Levels</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              C4 diagrams are hierarchical. Start with System Context for the big picture,
              then drill down to Containers for application boundaries, and Components for
              internal structure. Each level builds on the previous one.
            </p>
          </div>
        </div>
      </div>

      {/* Level cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {levels.map((level) => (
          <LevelCard
            key={level.id}
            level={level}
            isSelected={selectedLevel === level.id}
            onSelect={() => updateData('c4Level', level.id)}
          />
        ))}
      </div>

      {/* Visual example hint */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            {['System Context', 'Container', 'Component', 'Code'].map((name, i) => (
              <div
                key={name}
                className={clsx(
                  'w-24 text-center text-xs py-2 rounded-md border-2',
                  i === 0 ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-200'
                )}
              >
                {name}
              </div>
            ))}
          </div>
          <div className="flex-1 text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Zoom In Approach</p>
            <p>Start at the top (System Context) and zoom into each element to create
            detailed diagrams at lower levels. Click on any element to "zoom in" and
            see its internal structure.</p>
          </div>
        </div>
      </div>

      {/* Best practices */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
          <span className="text-lg">💡</span>
          Best Practices
        </h4>
        <ul className="text-sm text-yellow-800 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span>Start with System Context diagrams for new projects or when explaining to non-technical stakeholders</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span>Create Container diagrams for software architects and developers during design phases</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span>Use Component diagrams when implementing or refactoring specific containers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span>Code level diagrams are optional and typically generated automatically from code</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default C4WizardStep1_Level;
