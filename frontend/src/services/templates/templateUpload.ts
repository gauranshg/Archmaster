/**
 * Template Upload Service
 *
 * Handles importing templates from uploaded files.
 * Supports JSON format with template definitions.
 */

import type { Template, TemplateVariable } from '@/types/template';

/**
 * Template file format (JSON)
 *
 * Note: Default values are extracted from the Jinja template
 * using patterns like {{ variable or 'default' }}
 */
export interface TemplateFile {
  /** Template name */
  name: string;

  /** Template description */
  description?: string;

  /** Template category */
  category?: string;

  /** Jinja template */
  jinjaTemplate: string;

  /** Template variables */
  variables?: TemplateVariable[];

  /** Tags */
  tags?: string[];

  /** Author */
  author?: string;
}

/**
 * Parse uploaded template file
 */
export function parseTemplateFile(content: string): {
  success: boolean;
  template?: Template;
  error?: string;
} {
  try {
    const data = JSON.parse(content) as TemplateFile;

    // Validate required fields
    if (!data.name) {
      return { success: false, error: 'Template name is required' };
    }

    if (!data.jinjaTemplate) {
      return { success: false, error: 'Jinja template is required' };
    }

    // Generate ID from name
    const id = `template-${data.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    // Create template object
    const template: Template = {
      id,
      name: data.name,
      description: data.description || '',
      category: data.category as any || 'custom',
      author: data.author || 'User',
      isPublic: false,
      isSystemTemplate: false,
      jinjaTemplate: data.jinjaTemplate,
      variables: data.variables || [],
      data: {
        label: data.name,
        properties: {}
      },
      style: {},
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return { success: true, template };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse template file'
    };
  }
}

/**
 * Validate template file before import
 */
export function validateTemplateFile(content: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const data = JSON.parse(content) as TemplateFile;

    // Check required fields
    if (!data.name) {
      errors.push('Template name is required');
    }

    if (!data.jinjaTemplate) {
      errors.push('Jinja template is required');
    }

    // Validate variables if present
    if (data.variables) {
      if (!Array.isArray(data.variables)) {
        errors.push('Variables must be an array');
      } else {
        data.variables.forEach((variable, index) => {
          if (!variable.name) {
            errors.push(`Variable at index ${index} is missing name`);
          }
          if (!variable.label) {
            errors.push(`Variable "${variable.name || index}" is missing label`);
          }
          if (!variable.type) {
            errors.push(`Variable "${variable.name || index}" is missing type`);
          }
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Invalid JSON format'],
      warnings
    };
  }
}

/**
 * Create a sample template file for users to download
 */
export function createSampleTemplateFile(): string {
  const sample: TemplateFile = {
    name: 'My Custom Template',
    description: 'A sample custom template',
    category: 'custom',
    jinjaTemplate: `
<div style="
  text-align: center;
  padding: 18px;
  width: {{ width or 170 }}px;
  border-radius: 14px;
  background: {{ background or '#000000' }};
  border: 1px solid {{ borderColor or '#7f1d1d' }};
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.8);
">
  <div style="font-size: {{ iconSize or 36 }}px; margin-bottom: 10px;">
    {{ icon or '📦' }}
  </div>
  <div style="
    font-weight: 700;
    font-size: {{ labelSize or 16 }}px;
    color: {{ labelColor or '#f87171' }};
  ">
    {{ label }}
  </div>
  <div style="
    margin-top: 6px;
    font-size: {{ subtitleSize or 11 }}px;
    color: {{ subtitleColor or '#fecaca' }};
    letter-spacing: 0.1em;
    text-transform: uppercase;
  ">
    {{ subtitle or 'Component' }}
  </div>
</div>
    `.trim(),
    variables: [
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        description: 'Component name',
        required: true
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        description: 'Type text (e.g., "Component", "Service")'
      },
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        description: 'Emoji or icon'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        description: 'Box width in pixels',
        min: 100,
        max: 300
      },
      {
        name: 'background',
        label: 'Background Color',
        type: 'color'
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color'
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color'
      },
      {
        name: 'labelSize',
        label: 'Label Font Size',
        type: 'number',
        min: 10,
        max: 32
      },
      {
        name: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'color'
      },
      {
        name: 'subtitleSize',
        label: 'Subtitle Font Size',
        type: 'number',
        min: 8,
        max: 20
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        min: 20,
        max: 64
      }
    ],
    tags: ['custom', 'sample'],
    author: 'User'
  };

  return JSON.stringify(sample, null, 2);
}

/**
 * Download sample template file
 */
export function downloadSampleTemplate(): void {
  const content = createSampleTemplateFile();
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample-template.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read uploaded file as text
 */
export function readUploadedFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Import template from uploaded file
 */
export async function importTemplateFromFile(file: File): Promise<{
  success: boolean;
  template?: Template;
  error?: string;
}> {
  try {
    const content = await readUploadedFile(file);
    return parseTemplateFile(content);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import template'
    };
  }
}
