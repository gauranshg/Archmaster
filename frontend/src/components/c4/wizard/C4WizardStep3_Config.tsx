/**
 * C4 Wizard Step 3: Configure Diagram
 *
 * Configure diagram properties including name, description, scope,
 * and stakeholders (for context diagrams).
 */

import { useState, useCallback, useMemo } from 'react';
import { X, Tag, Users, Building2, Globe, Database } from 'lucide-react';
import type { WizardStepProps } from './types';
import clsx from 'clsx';

/**
 * Scope options
 */
const SCOPE_OPTIONS = [
  { id: 'enterprise', label: 'Enterprise', icon: <Building2 size={18} />, description: 'Cross-system view' },
  { id: 'system', label: 'System', icon: <Globe size={18} />, description: 'Single system view' },
  { id: 'container', label: 'Container', icon: <Database size={18} />, description: 'Application view' },
] as const;

/**
 * Stakeholder Input Component
 */
interface StakeholderInputProps {
  stakeholders: string[];
  onAdd: (stakeholder: string) => void;
  onRemove: (stakeholder: string) => void;
}

function StakeholderInput({ stakeholders, onAdd, onRemove }: StakeholderInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleAdd = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Please enter a stakeholder name');
      return;
    }
    if (stakeholders.includes(trimmed)) {
      setError('This stakeholder is already added');
      return;
    }
    onAdd(trimmed);
    setInput('');
    setError('');
  }, [input, stakeholders, onAdd]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }, [handleAdd]);

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Stakeholders
        <span className="text-gray-400 font-normal ml-1">(optional)</span>
      </label>

      {/* Stakeholder tags */}
      {stakeholders.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {stakeholders.map((stakeholder) => (
            <span
              key={stakeholder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm"
            >
              <Users size={14} />
              {stakeholder}
              <button
                onClick={() => onRemove(stakeholder)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${stakeholder}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add stakeholder input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Product Manager, DevOps Team"
          className={clsx(
            'flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm',
            error ? 'border-red-300 focus:border-red-500' : 'border-gray-200'
          )}
          aria-invalid={!!error}
          aria-describedby={error ? 'stakeholder-error' : undefined}
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
        >
          Add
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p id="stakeholder-error" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Hint */}
      <p className="mt-2 text-xs text-gray-500">
        Stakeholders are people or groups who have an interest in the system.
        They appear in System Context diagrams.
      </p>
    </div>
  );
}

/**
 * Step 3: Configure Diagram
 */
export function C4WizardStep3_Config({ data, updateData }: WizardStepProps) {
  const [nameError, setNameError] = useState('');

  // Validate diagram name
  const validateName = useCallback((name: string) => {
    if (!name.trim()) {
      setNameError('Diagram name is required');
      return false;
    }
    if (name.length > 100) {
      setNameError('Name must be 100 characters or less');
      return false;
    }
    setNameError('');
    return true;
  }, []);

  // Handle name change with validation
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    updateData('diagramName', name);
    validateName(name);
  }, [updateData, validateName]);

  // Handle stakeholder add
  const handleAddStakeholder = useCallback((stakeholder: string) => {
    updateData('stakeholders', [...data.stakeholders, stakeholder]);
  }, [data.stakeholders, updateData]);

  // Handle stakeholder remove
  const handleRemoveStakeholder = useCallback((stakeholder: string) => {
    updateData('stakeholders', data.stakeholders.filter((s) => s !== stakeholder));
  }, [data.stakeholders, updateData]);

  // Generate suggested name based on selections
  const suggestedName = useMemo(() => {
    const levelNames = {
      'system-context': 'System Context',
      'container': 'Container',
      'component': 'Component',
      'code': 'Code',
    };
    return data.diagramName || `${levelNames[data.c4Level]} Diagram`;
  }, [data.c4Level, data.diagramName]);

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Configure Your Diagram</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Provide details about your diagram to help organize and document your architecture.
        </p>
      </div>

      {/* Diagram name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Diagram Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.diagramName}
          onChange={handleNameChange}
          placeholder="e.g., E-Commerce System Context"
          className={clsx(
            'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
            nameError ? 'border-red-300' : 'border-gray-200'
          )}
          aria-invalid={!!nameError}
          aria-describedby={nameError ? 'name-error' : 'name-hint'}
          maxLength={100}
        />
        {nameError ? (
          <p id="name-error" className="mt-2 text-sm text-red-600">
            {nameError}
          </p>
        ) : (
          <p id="name-hint" className="mt-2 text-sm text-gray-500">
            A descriptive name for your diagram. This helps identify it in your workspace.
          </p>
        )}
      </div>

      {/* Diagram description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          value={data.diagramDescription}
          onChange={(e) => updateData('diagramDescription', e.target.value)}
          placeholder="Briefly describe what this diagram shows..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
          maxLength={500}
        />
        <p className="mt-2 text-sm text-gray-500">
          Provide context about what this diagram represents and its purpose.
        </p>
      </div>

      {/* Scope selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Scope
        </label>
        <div className="grid grid-cols-3 gap-3">
          {SCOPE_OPTIONS.map((scope) => {
            const isSelected = data.scope === scope.id;
            return (
              <button
                key={scope.id}
                onClick={() => updateData('scope', scope.id)}
                className={clsx(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                  'hover:shadow-md hover:-translate-y-0.5',
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                )}
                aria-pressed={isSelected}
              >
                <div
                  className={clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                    isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {scope.icon}
                </div>
                <span className="text-sm font-medium text-gray-900">{scope.label}</span>
                <span className="text-xs text-gray-500">{scope.description}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          The scope determines the boundary of what is shown in the diagram.
        </p>
      </div>

      {/* Stakeholders (for System Context diagrams) */}
      {data.c4Level === 'system-context' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Context Diagram Stakeholders</span>
          </div>
          <StakeholderInput
            stakeholders={data.stakeholders}
            onAdd={handleAddStakeholder}
            onRemove={handleRemoveStakeholder}
          />
        </div>
      )}

      {/* Preview card */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Tag size={16} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Diagram Summary</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Name:</span>
            <span className="ml-2 font-medium text-gray-900">{suggestedName || 'Untitled'}</span>
          </div>
          <div>
            <span className="text-gray-500">Level:</span>
            <span className="ml-2 font-medium text-gray-900 capitalize">{data.c4Level.replace('-', ' ')}</span>
          </div>
          <div>
            <span className="text-gray-500">Scope:</span>
            <span className="ml-2 font-medium text-gray-900 capitalize">{data.scope}</span>
          </div>
          <div>
            <span className="text-gray-500">Stakeholders:</span>
            <span className="ml-2 font-medium text-gray-900">
              {data.stakeholders.length > 0 ? data.stakeholders.length : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
          <span className="text-lg">💡</span>
          Tips for Good Diagram Documentation
        </h4>
        <ul className="text-sm text-yellow-800 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span>Use clear, descriptive names that reflect the system or domain</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span>Include the business context in the description for non-technical stakeholders</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span>List all relevant stakeholders in System Context diagrams</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default C4WizardStep3_Config;
