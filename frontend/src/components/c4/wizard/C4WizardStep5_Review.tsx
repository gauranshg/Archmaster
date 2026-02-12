/**
 * C4 Wizard Step 5: Review and Create
 *
 * Final step where users review all their selections before creating the diagram.
 * Shows a summary of all choices made in previous steps.
 */

import { useMemo, useCallback } from 'react';
import { CheckCircle2, Circle, Edit, ArrowRight, Sparkles } from 'lucide-react';
import type { WizardStepProps } from './types';
import { C4_LEVELS } from '@/services/c4/wizard';
import { ARCHITECTURE_TEMPLATES, TEMPLATE_CATEGORY_INFO } from '@/services/c4';
import { C4_PRESETS, PRESET_CATEGORY_CONFIG } from '@/services/c4';
import type { C4Preset } from '@/services/c4';
import clsx from 'clsx';

/**
 * Review Item Component
 */
interface ReviewItemProps {
  label: string;
  value: string | React.ReactNode;
  step: number;
}

function ReviewItem({ label, value, step }: ReviewItemProps) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs font-semibold text-blue-600">{step}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</div>
          <div className="text-gray-900 font-medium break-words">{value}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Step 5: Review and Create
 */
export function C4WizardStep5_Review({ data, updateData, onNext }: WizardStepProps) {
  // Get C4 level info
  const c4LevelInfo = useMemo(() => {
    return C4_LEVELS.find((l) => l.id === data.c4Level);
  }, [data.c4Level]);

  // Get template info if selected
  const templateInfo = useMemo(() => {
    if (!data.templateId) return null;
    return ARCHITECTURE_TEMPLATES.find((t) => t.id === data.templateId);
  }, [data.templateId]);

  // Get selected preset info
  const selectedPresets = useMemo(() => {
    if (!data.selectedElements || data.selectedElements.length === 0) return [];
    return data.selectedElements
      .map((id) => C4_PRESETS.find((p) => p.id === id))
      .filter((p): p is C4Preset => p !== undefined);
  }, [data.selectedElements]);

  // Calculate diagram stats
  const stats = useMemo(() => {
    let nodeCount = selectedPresets.length;
    let initialNodes = selectedPresets.length;

    // If template is selected, use template stats
    if (templateInfo) {
      nodeCount = templateInfo.nodeCount;
      initialNodes = templateInfo.nodeCount;
    }

    return {
      nodeCount,
      initialNodes,
      hasElements: selectedPresets.length > 0 || templateInfo !== null,
    };
  }, [selectedPresets, templateInfo]);

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white mb-4 shadow-lg">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Your Diagram</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Review all your selections before creating the diagram. You can always edit these later.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 py-4">
        {[
          { step: 1, label: 'Level', done: !!data.c4Level },
          { step: 2, label: 'Template', done: !!data.startingPoint },
          { step: 3, label: 'Config', done: !!data.diagramName },
          { step: 4, label: 'Elements', done: true },
        ].map((item, i) => (
          <div key={item.step} className="flex items-center">
            <div className={clsx(
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
              item.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            )}>
              {item.done ? (
                <CheckCircle2 size={16} />
              ) : (
                <Circle size={16} className="text-gray-400" />
              )}
            </div>
            <span className={clsx(
              'ml-2 text-sm font-medium',
              item.done ? 'text-green-600' : 'text-gray-400'
            )}>
              {item.label}
            </span>
            {i < 3 && (
              <ArrowRight size={16} className="mx-2 text-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* Review card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {c4LevelInfo && (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <span className="text-2xl">{c4LevelInfo.icon}</span>
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{data.diagramName || 'Untitled C4 Diagram'}</h4>
              <p className="text-sm text-gray-600">{data.diagramDescription || 'No description'}</p>
            </div>
          </div>
        </div>

        {/* Review items */}
        <div className="p-6 space-y-1">
          {/* C4 Level */}
          <ReviewItem
            label="C4 Level"
            value={
              <div className="flex items-center gap-2">
                <span>{c4LevelInfo?.icon}</span>
                <span>{c4LevelInfo?.name}</span>
                <span className="text-xs text-gray-500">({c4LevelInfo?.scope})</span>
              </div>
            }
            step={1}
          />

          {/* Starting Point */}
          <ReviewItem
            label="Starting Point"
            value={
              <div className="flex items-center gap-2">
                {data.startingPoint === 'blank' && (
                  <>
                    <span className="text-xl">📄</span>
                    <span>Blank Canvas</span>
                  </>
                )}
                {data.startingPoint === 'template' && templateInfo && (
                  <>
                    <span className="text-xl">{templateInfo.icon}</span>
                    <span>{templateInfo.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: TEMPLATE_CATEGORY_INFO[templateInfo.category].color }}>
                      {TEMPLATE_CATEGORY_INFO[templateInfo.category].label}
                    </span>
                  </>
                )}
                {data.startingPoint === 'import' && (
                  <>
                    <span className="text-xl">📥</span>
                    <span>Import Existing</span>
                  </>
                )}
              </div>
            }
            step={2}
          />

          {/* Scope */}
          <ReviewItem
            label="Scope"
            value={<span className="capitalize">{data.scope}</span>}
            step={3}
          />

          {/* Stakeholders (if any) */}
          {data.stakeholders && data.stakeholders.length > 0 && (
            <ReviewItem
              label="Stakeholders"
              value={
                <div className="flex flex-wrap gap-1.5">
                  {data.stakeholders.map((s) => (
                    <span key={s} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              }
              step={3}
            />
          )}

          {/* Selected Elements */}
          {stats.hasElements && (
            <ReviewItem
              label="Initial Elements"
              value={
                <div className="flex items-center gap-2">
                  <span>{stats.nodeCount} elements</span>
                  {selectedPresets.length > 0 && (
                    <span className="text-xs text-gray-500">
                      ({selectedPresets.map((p) => p.name).join(', ')})
                    </span>
                  )}
                </div>
              }
              step={4}
            />
          )}
        </div>
      </div>

      {/* Selected elements preview */}
      {selectedPresets.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Selected Elements</h5>
          <div className="flex flex-wrap gap-2">
            {selectedPresets.map((preset) => {
              const categoryConfig = PRESET_CATEGORY_CONFIG[preset.category];
              return (
                <div
                  key={preset.id}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg"
                >
                  <span className="text-lg">{preset.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{preset.name}</span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: categoryConfig.color }}
                  >
                    {categoryConfig.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Template preview (if selected) */}
      {templateInfo && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-white shadow-sm">
              {templateInfo.icon}
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-gray-900">{templateInfo.name}</h5>
              <p className="text-sm text-gray-600 mt-1">{templateInfo.description}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span>{templateInfo.nodeCount} elements</span>
                <span>•</span>
                <span>{templateInfo.edgeCount} connections</span>
                <span>•</span>
                <span
                  className="px-2 py-0.5 rounded-md text-white"
                  style={{ backgroundColor: TEMPLATE_CATEGORY_INFO[templateInfo.category].color }}
                >
                  {TEMPLATE_CATEGORY_INFO[templateInfo.category].label}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ready to create message */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 mb-1">Ready to Create Your Diagram!</h4>
            <p className="text-sm text-green-800 leading-relaxed">
              {data.startingPoint === 'template' && templateInfo
                ? `Your "${templateInfo.name}" template will be used to create a ${data.diagramName || 'new'} diagram.`
                : `Your "${data.diagramName || 'Untitled'}" diagram will be created with ${stats.initialNodes} initial element${stats.initialNodes !== 1 ? 's' : ''}.`
              } After creation, you can add more elements, arrange them, and customize their styling.
            </p>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-lg">🎯</span>
          What Happens Next
        </h5>
        <ol className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 text-xs">1</span>
            <span>Your diagram will be created and saved to your workspace</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 text-xs">2</span>
            <span>You will be redirected to the editor with your new diagram</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 text-xs">3</span>
            <span>Use the sidebar to add more elements from the C4 Preset Gallery</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 text-xs">4</span>
            <span>Connect elements by dragging between nodes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 text-xs">5</span>
            <span>Customize styling with the CSS editor</span>
          </li>
        </ol>
      </div>

      {/* Tip */}
      <div className="text-center text-sm text-gray-500">
        <p>Remember: You can always edit, add, or remove elements after creating the diagram.</p>
      </div>
    </div>
  );
}

export default C4WizardStep5_Review;
