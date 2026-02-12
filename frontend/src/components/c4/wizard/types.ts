/**
 * C4 Wizard Shared Types
 *
 * Shared type definitions for all wizard step components.
 */

import type { WizardState } from '@/services/c4/wizard';

/**
 * Props for wizard step components
 */
export interface WizardStepProps {
  /** Current wizard state/data */
  data: WizardState;

  /** Update a specific field in wizard data */
  updateData: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;

  /** Navigate to next step */
  onNext?: () => void;

  /** Current error message (if any) */
  error?: string | null;

  /** Set error message */
  setError?: (error: string | null) => void;
}
