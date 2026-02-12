/**
 * C4 Wizard Service
 *
 * Utilities and types for the C4 Wizard component.
 * Handles wizard state management, validation, and persistence.
 */

const WIZARD_STORAGE_KEY = 'c4-wizard-state';

/**
 * Wizard step numbers (1-indexed)
 */
export type WizardStep = 1 | 2 | 3 | 4 | 5;

/**
 * C4 Level configuration
 */
export interface C4Level {
  /** Unique identifier */
  id: 'system-context' | 'container' | 'component' | 'code';

  /** Display name */
  name: string;

  /** Description */
  description: string;

  /** Icon/emoji */
  icon: string;

  /** Scope label */
  scope: string;

  /** When to use this level */
  whenToUse: string;

  /** Example elements for this level */
  exampleElements: string[];
}

/**
 * C4 Level definitions
 */
export const C4_LEVELS: readonly C4Level[] = [
  {
    id: 'system-context',
    name: 'System Context',
    description: 'Big picture view showing your system and its connections to users and external systems',
    icon: '🌍',
    scope: 'Enterprise',
    whenToUse: 'For explaining your system to non-technical stakeholders',
    exampleElements: ['Person', 'Software System', 'External System'],
  },
  {
    id: 'container',
    name: 'Container',
    description: 'Zoom into a single system to show its applications and data stores',
    icon: '📦',
    scope: 'System',
    whenToUse: 'For showing the high-level technical building blocks',
    exampleElements: ['Web App', 'API', 'Database', 'Message Queue'],
  },
  {
    id: 'component',
    name: 'Component',
    description: 'Zoom into a container to show its internal components and modules',
    icon: '🧩',
    scope: 'Container',
    whenToUse: 'For designing and understanding the internal structure',
    exampleElements: ['Controller', 'Service', 'Repository', 'Utility'],
  },
  {
    id: 'code',
    name: 'Code',
    description: 'Detailed view of classes, functions, and interfaces (often generated)',
    icon: '💻',
    scope: 'Component',
    whenToUse: 'For detailed implementation design (often auto-generated)',
    exampleElements: ['Class', 'Interface', 'Function', 'Enum'],
  },
] as const;

/**
 * Starting Point options
 */
export type StartingPoint = 'blank' | 'template' | 'import';

/**
 * Scope options
 */
export type Scope = 'enterprise' | 'system' | 'container';

/**
 * Wizard state data
 */
export interface WizardState {
  /** Selected C4 level */
  c4Level: C4Level['id'];

  /** Starting point (blank, template, import) */
  startingPoint: StartingPoint;

  /** Selected template ID (if startingPoint is 'template') */
  templateId?: string;

  /** Diagram name */
  diagramName: string;

  /** Diagram description */
  diagramDescription: string;

  /** Diagram scope */
  scope: Scope;

  /** Stakeholders (for System Context diagrams) */
  stakeholders: string[];

  /** Selected preset IDs for initial elements */
  selectedElements: string[];

  /** Custom elements added by user */
  customElements: Array<{
    id: string;
    name: string;
    elementType: string;
    icon: string;
  }>;

  /** Last step visited (for resume) */
  lastStep?: WizardStep;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether the step is valid */
  valid: boolean;

  /** Error message if invalid */
  error?: string;
}

/**
 * Validate a wizard step
 */
export function validateStep(step: WizardStep, data: Partial<WizardState>): ValidationResult {
  switch (step) {
    case 1:
      // C4 Level selection - always valid once a level is selected
      if (!data.c4Level) {
        return { valid: false, error: 'Please select a C4 level' };
      }
      return { valid: true };

    case 2:
      // Starting point selection
      if (!data.startingPoint) {
        return { valid: false, error: 'Please choose a starting point' };
      }
      if (data.startingPoint === 'template' && !data.templateId) {
        return { valid: false, error: 'Please select a template' };
      }
      return { valid: true };

    case 3:
      // Diagram configuration
      if (!data.diagramName || data.diagramName.trim() === '') {
        return { valid: false, error: 'Please enter a diagram name' };
      }
      if (data.diagramName.length > 100) {
        return { valid: false, error: 'Diagram name must be 100 characters or less' };
      }
      return { valid: true };

    case 4:
      // Element selection - always valid (can be empty)
      return { valid: true };

    case 5:
      // Review step - ensure all previous steps are valid
      if (!data.c4Level) {
        return { valid: false, error: 'C4 level is required' };
      }
      if (!data.startingPoint) {
        return { valid: false, error: 'Starting point is required' };
      }
      if (!data.diagramName || data.diagramName.trim() === '') {
        return { valid: false, error: 'Diagram name is required' };
      }
      return { valid: true };

    default:
      return { valid: true };
  }
}

/**
 * Save wizard state to localStorage
 */
export function saveWizardState(state: WizardState): void {
  try {
    localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save wizard state:', error);
  }
}

/**
 * Load wizard state from localStorage
 */
export function loadWizardState(): WizardState | null {
  try {
    const saved = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to load wizard state:', error);
  }
  return null;
}

/**
 * Clear wizard state from localStorage
 */
export function clearWizardState(): void {
  try {
    localStorage.removeItem(WIZARD_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear wizard state:', error);
  }
}

/**
 * Get default wizard state
 */
export function getDefaultWizardState(): WizardState {
  return {
    c4Level: 'system-context',
    startingPoint: 'blank',
    templateId: undefined,
    diagramName: '',
    diagramDescription: '',
    scope: 'system',
    stakeholders: [],
    selectedElements: [],
    customElements: [],
  };
}

/**
 * Get recommended elements for a C4 level
 */
export function getRecommendedElementIds(c4Level: C4Level['id']): string[] {
  // Return recommended preset IDs for each level
  const recommendations: Record<C4Level['id'], string[]> = {
    'system-context': [
      'c4-person-user',
      'c4-system-webapp',
      'c4-system-legacy',
    ],
    'container': [
      'c4-person-user',
      'c4-container-spa',
      'c4-container-backend',
      'c4-infra-database',
    ],
    'component': [
      'c4-component-controller',
      'c4-component-service',
      'c4-component-repository',
      'c4-infra-database',
    ],
    'code': [],
  };

  return recommendations[c4Level] || [];
}
