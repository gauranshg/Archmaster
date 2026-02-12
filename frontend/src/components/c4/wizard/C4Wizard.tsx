/**
 * C4 Wizard Component
 *
 * A multi-step wizard that guides users through creating C4 architecture diagrams.
 * Provides step-by-step assistance for choosing the right C4 level, templates,
 * configuration, elements, and review before creating the diagram.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { diagramStorage } from '@/services/storage';
import { createDiagramFromTemplate } from '@/services/c4';
import { getPresetById } from '@/services/c4';
import { presetToNode } from '@/services/c4/presetUtils';
import type { Diagram, Node, Edge } from '@/types';
import { C4WizardStep1_Level } from './C4WizardStep1_Level';
import { C4WizardStep2_Template } from './C4WizardStep2_Template';
import { C4WizardStep3_Config } from './C4WizardStep3_Config';
import { C4WizardStep4_Elements } from './C4WizardStep4_Elements';
import { C4WizardStep5_Review } from './C4WizardStep5_Review';
import type { WizardState, WizardStep } from '@/services/c4/wizard';
import { saveWizardState, loadWizardState, clearWizardState, validateStep } from '@/services/c4/wizard';
import clsx from 'clsx';

/**
 * C4 Wizard Props
 */
interface C4WizardProps {
  /** Callback when wizard is closed */
  onClose?: () => void;

  /** Callback when diagram is created */
  onComplete?: (diagramId: string) => void;

  /** Initial wizard state (for resuming) */
  initialState?: Partial<WizardState>;

  /** Whether wizard is open */
  isOpen: boolean;
}

/**
 * Wizard step configuration
 */
const WIZARD_STEPS: readonly { id: WizardStep; title: string; description: string }[] = [
  { id: 1, title: 'C4 Level', description: 'Choose the diagram level' },
  { id: 2, title: 'Starting Point', description: 'Template or blank canvas' },
  { id: 3, title: 'Configure', description: 'Set diagram properties' },
  { id: 4, title: 'Elements', description: 'Add initial elements' },
  { id: 5, title: 'Review', description: 'Review and create' },
] as const;

/**
 * C4 Wizard Component
 */
export function C4Wizard({ onClose, onComplete, initialState, isOpen }: C4WizardProps) {
  const navigate = useNavigate();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [wizardData, setWizardData] = useState<WizardState>(() => ({
    c4Level: 'system-context',
    startingPoint: 'blank',
    templateId: undefined,
    diagramName: '',
    diagramDescription: '',
    scope: 'system',
    stakeholders: [],
    selectedElements: [],
    customElements: [],
  }));

  // UI state
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load initial state or saved state
  useEffect(() => {
    if (isOpen) {
      const saved = loadWizardState();
      if (saved && !initialState) {
        // Resume from saved state
        setWizardData(saved);
        const stepToLoad = Math.min(Math.max(1, saved.lastStep || 1), 5) as WizardStep;
        setCurrentStep(stepToLoad);
      } else if (initialState) {
        // Use provided initial state
        setWizardData((prev) => ({ ...prev, ...initialState }));
      }
    }
  }, [isOpen, initialState]);

  // Auto-save wizard state on changes
  useEffect(() => {
    if (isOpen) {
      setSaveState('saving');
      const timeout = setTimeout(() => {
        saveWizardState({ ...wizardData, lastStep: currentStep });
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 1000);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [wizardData, currentStep, isOpen]);

  // Handle step data update
  const updateData = useCallback(<K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setWizardData((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }, []);

  // Navigate to next step
  const handleNext = useCallback(() => {
    // Validate current step
    const validation = validateStep(currentStep, wizardData);
    if (!validation.valid) {
      setError(validation.error || 'Please complete this step before proceeding');
      return;
    }

    setError(null);
    if (currentStep < 5) {
      setCurrentStep(((prev) => (prev + 1) as WizardStep)(currentStep));
    }
  }, [currentStep, wizardData]);

  // Navigate to previous step
  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(((prev) => (prev - 1) as WizardStep)(currentStep));
      setError(null);
    }
  }, [currentStep]);

  // Handle wizard close
  const handleClose = useCallback(() => {
    // Offer to save progress
    const shouldSave = currentStep > 1 && currentStep < 5;
    if (shouldSave) {
      const confirmed = confirm(
        'Do you want to save your progress and resume later? Click OK to save, or Cancel to discard.'
      );
      if (!confirmed) {
        clearWizardState();
      }
    } else {
      clearWizardState();
    }
    onClose?.();
  }, [currentStep, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'Enter' && !e.shiftKey && !isCreating) {
        // Only proceed if not in a textarea
        if (!(e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          if (currentStep === 5) {
            handleCreate();
          } else {
            handleNext();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, isCreating, handleNext, handleClose]);

  // Create the diagram
  const handleCreate = useCallback(async () => {
    if (isCreating) return;

    // Final validation
    const validation = validateStep(5, wizardData);
    if (!validation.valid) {
      setError(validation.error || 'Please complete all required fields');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const workspaceId = 'default-workspace';
      let diagram: Omit<Diagram, 'id' | 'createdAt' | 'updatedAt'>;

      if (wizardData.startingPoint === 'template' && wizardData.templateId) {
        // Create from template
        const templateDiagram = createDiagramFromTemplate(
          wizardData.templateId,
          workspaceId,
          wizardData.diagramName || undefined
        );
        if (!templateDiagram) {
          throw new Error('Failed to create diagram from template');
        }
        diagram = templateDiagram;
      } else {
        // Create from blank or preset selection
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // Add selected elements
        if (wizardData.selectedElements.length > 0) {
          wizardData.selectedElements.forEach((presetId, index) => {
            const preset = getPresetById(presetId);
            if (preset) {
              const node = presetToNode(
                preset,
                { x: 100 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 200 }
              );
              nodes.push(node);
            }
          });
        }

        diagram = {
          name: wizardData.diagramName || 'Untitled C4 Diagram',
          description: wizardData.diagramDescription,
          type: wizardData.c4Level,
          workspaceId,
          nodes,
          edges,
          customCSS: '',
          layout: { type: 'manual', direction: 'TB' },
          metadata: {
            scope: wizardData.scope,
            stakeholders: wizardData.stakeholders,
            c4Level: wizardData.c4Level,
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
          },
          tags: ['c4', wizardData.c4Level],
        };
      }

      // Save to storage
      const diagramId = crypto.randomUUID();
      const now = new Date().toISOString();
      await diagramStorage.save({
        ...diagram,
        id: diagramId,
        createdAt: now,
        updatedAt: now,
        metadata: {
          ...diagram.metadata,
          version: 0,
          author: 'user',
          createdAt: now,
          modifiedAt: now,
        },
      });

      // Clear wizard state
      clearWizardState();

      // Navigate to editor
      navigate(`/editor/${diagramId}`);
      onComplete?.(diagramId);
      onClose?.();
    } catch (err) {
      console.error('Failed to create diagram:', err);
      setError(err instanceof Error ? err.message : 'Failed to create diagram');
    } finally {
      setIsCreating(false);
    }
  }, [wizardData, isCreating, navigate, onComplete, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Render current step content
  const stepContent = useMemo(() => {
    const props = {
      data: wizardData,
      updateData,
      onNext: handleNext,
      error,
      setError,
    };

    switch (currentStep) {
      case 1:
        return <C4WizardStep1_Level {...props} />;
      case 2:
        return <C4WizardStep2_Template {...props} />;
      case 3:
        return <C4WizardStep3_Config {...props} />;
      case 4:
        return <C4WizardStep4_Elements {...props} />;
      case 5:
        return <C4WizardStep5_Review {...props} />;
      default:
        return null;
    }
  }, [currentStep, wizardData, updateData, handleNext, error]);

  // Progress calculation
  const progress = ((currentStep - 1) / 4) * 100;

  // Can proceed to next step?
  const canProceed = useMemo(() => {
    const validation = validateStep(currentStep, wizardData);
    return validation.valid;
  }, [currentStep, wizardData]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          {/* Progress bar */}
          <div className="h-1 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <span className="text-xl">📐</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create C4 Diagram</h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {WIZARD_STEPS[currentStep - 1]?.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Save indicator */}
              {saveState !== 'idle' && (
                <span className={clsx(
                  'text-xs px-2 py-1 rounded-full',
                  saveState === 'saving' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                )}>
                  {saveState === 'saving' ? 'Saving...' : 'Saved'}
                </span>
              )}

              <button
                onClick={handleClose}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                disabled={isCreating}
                aria-label="Close wizard"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Step indicators */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between">
              {WIZARD_STEPS.map((step, index) => {
                const stepNumber = (index + 1) as WizardStep;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;
                const isUpcoming = stepNumber > currentStep;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <button
                        onClick={() => {
                          if (isCompleted || isCurrent) {
                            setCurrentStep(stepNumber);
                          }
                        }}
                        className={clsx(
                          'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                          isCompleted && 'bg-green-500 text-white shadow-md',
                          isCurrent && 'bg-blue-600 text-white shadow-lg scale-110',
                          isUpcoming && 'bg-gray-200 text-gray-500'
                        )}
                        disabled={isUpcoming || isCreating}
                        aria-label={`Go to ${step.title}`}
                        aria-current={isCurrent ? 'step' : undefined}
                      >
                        {isCompleted ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          stepNumber
                        )}
                      </button>
                      <span
                        className={clsx(
                          'text-xs mt-1.5 text-center max-w-[80px] hidden sm:block',
                          isCurrent ? 'text-blue-600 font-semibold' : 'text-gray-500'
                        )}
                      >
                        {step.title}
                      </span>
                    </div>

                    {/* Connector line */}
                    {index < WIZARD_STEPS.length - 1 && (
                      <div
                        className={clsx(
                          'flex-1 h-0.5 mx-2 transition-colors',
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {stepContent}

          {/* Error message */}
          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-shake">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-red-700 flex-1">{error}</div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Step {currentStep} of {WIZARD_STEPS.length}
              {currentStep < 5 && canProceed && (
                <span className="ml-2 text-green-600">Press Enter to continue</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                disabled={currentStep === 1 || isCreating}
                className={clsx(
                  'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all',
                  currentStep === 1 || isCreating
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
                )}
              >
                <ChevronLeft size={18} />
                Back
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed || isCreating}
                  className={clsx(
                    'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all',
                    !canProceed || isCreating
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                  )}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className={clsx(
                    'flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all',
                    isCreating
                      ? 'bg-green-400 text-white cursor-wait'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                  )}
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Create Diagram
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default C4Wizard;
