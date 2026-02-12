/**
 * PropertiesPanel Component
 *
 * TEMPLATE-FIRST APPROACH:
 * - Template selector at top
 * - Dynamic template variables
 * - Removed: position, size, icon, styling sections
 * - Kept: label, template selector, child diagram
 *
 * Handles single and multi-selection.
 */

import { useMemo, useState } from 'react';
import { Trash2, Palette, Upload, Download, Code2, Save, Copy, Edit3 } from 'lucide-react';
import { Edge as ReactFlowEdge } from '@reactflow/core';
import { useDiagramStore } from '@/store/diagramStore';
import { useTemplateStore } from '@/store/templateStore';
import type { Node, Edge } from '@/types';
import type { TemplateVariable } from '@/types/template';
import { PropertySection } from './PropertySection';
import { PropertyInput } from './PropertyInput';
import { StyleEditorDialog } from './StyleEditorDialog';
import { EdgeStylePanel } from '@/components/diagram/EdgeStylePanel';
import { TemplateSelector } from '@/components/properties/TemplateSelector';
import { VariableInput } from '@/components/properties/VariableInput';
import { JinjaEditor } from './JinjaEditor';
import { validateVariableValue } from '@/services/templates/templateVariables';
import { downloadSampleTemplate, importTemplateFromFile } from '@/services/templates/templateUpload';
import { parseJinjaDefaults, extractVariableNames } from '@/services/jinja/jinjaDefaultsParser';

export interface PropertiesPanelProps {
  /** Additional CSS classes */
  className?: string;
}

export function PropertiesPanel({ className }: PropertiesPanelProps) {
  const { nodes, edges, selectedNodes, selectedEdges, updateNode, updateEdge, setEdges, deleteNode, deleteEdge, currentDiagram } =
    useDiagramStore();

  // State for CSS editor dialog
  const [cssEditorOpen, setCssEditorOpen] = useState(false);
  const [cssEditorMode, setCssEditorMode] = useState<'node' | 'diagram'>('node');

  // Get selected node objects
  const selectedNodeObjects = useMemo(() => {
    return nodes.filter((n) => selectedNodes.includes(n.id));
  }, [nodes, selectedNodes]);

  // Get selected edge objects
  const selectedEdgeObjects = useMemo(() => {
    return edges.filter((e) => selectedEdges.includes(e.id));
  }, [edges, selectedEdges]);

  // Handle delete
  const handleDelete = () => {
    selectedNodes.forEach((id) => deleteNode(id));
    selectedEdges.forEach((id) => deleteEdge(id));
  };

  // Update node handler
  const handleNodeUpdate = (id: string, updates: Partial<Node>) => {
    updateNode(id, updates);
  };

  // Update edge handler
  const handleEdgeUpdate = (id: string, updates: Partial<Edge>) => {
    updateEdge(id, updates);
  };

  // Handle CSS save for node
  const handleNodeCssSave = (css: string) => {
    if (selectedNodeObjects.length === 1) {
      const node = selectedNodeObjects[0];
      updateNode(node.id, {
        data: {
          ...node.data,
          properties: {
            ...node.data.properties,
            customCSS: css,
          },
        },
      });
    }
    setCssEditorOpen(false);
  };

  // Handle CSS save for diagram
  const handleDiagramCssSave = (css: string) => {
    const { updateCustomCSS } = useDiagramStore.getState();
    updateCustomCSS(css);
    setCssEditorOpen(false);
  };

  // Open node CSS editor
  const openNodeCssEditor = () => {
    setCssEditorMode('node');
    setCssEditorOpen(true);
  };

  // Open diagram CSS editor
  const openDiagramCssEditor = () => {
    setCssEditorMode('diagram');
    setCssEditorOpen(true);
  };

  // Handle edge updates from EdgeStylePanel
  const handleUpdateEdges = (updatedEdges: ReactFlowEdge[]) => {
    // Replace edges entirely to ensure all properties are updated
    const otherEdges = edges.filter(e => !updatedEdges.find(ue => ue.id === e.id));
    setEdges([...otherEdges, ...updatedEdges]);
  };

  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;
  const hasMultipleSelection = selectedNodes.length + selectedEdges.length > 1;

  return (
    <div className={`bg-white/90 backdrop-blur-lg rounded-xl shadow-elevated border border-gray-200/50 overflow-hidden ${className || ''}`}>
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center text-sm">
                ⚙️
              </span>
              Properties
            </h2>

            {/* CSS Editor Button - Diagram only (node styling now managed by templates) */}
            {currentDiagram && (
              <button
                type="button"
                onClick={openDiagramCssEditor}
                className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all duration-200 flex items-center gap-1.5"
                title="Edit custom CSS for this diagram"
              >
                <Palette className="w-3.5 h-3.5" />
                Edit Diagram CSS
              </button>
            )}
          </div>

          {hasSelection && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {selectedNodes.length + selectedEdges.length} item{selectedNodes.length + selectedEdges.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {!hasSelection && (
          <p className="mt-2 text-sm text-gray-500">
            Select nodes or edges to edit properties
          </p>
        )}
        {hasSelection && !hasMultipleSelection && (
          <p className="mt-2 text-sm text-gray-600 font-medium truncate">
            {selectedNodes.length === 1 && (
              <>
                <span className="text-blue-600">Node:</span> {selectedNodeObjects[0]?.data.label || selectedNodeObjects[0]?.id}
              </>
            )}
            {selectedEdges.length === 1 && (
              <>
                <span className="text-blue-600">Edge:</span> {selectedEdgeObjects[0]?.label || selectedEdgeObjects[0]?.id}
              </>
            )}
          </p>
        )}
        {hasMultipleSelection && (
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-medium text-blue-600">{selectedNodes.length}</span> {selectedNodes.length === 1 ? 'node' : 'nodes'},{' '}
            <span className="font-medium text-blue-600">{selectedEdges.length}</span> {selectedEdges.length === 1 ? 'edge' : 'edges'} selected
          </p>
        )}
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* No selection */}
        {!hasSelection && (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4 opacity-50">🎯</div>
            <p className="text-sm text-gray-500">
              Click on nodes or edges to select them and view their properties here.
            </p>
          </div>
        )}

        {/* Node properties */}
        {selectedNodeObjects.length > 0 && (
          <>
            {/* Single node selection */}
            {selectedNodeObjects.length === 1 && (
              <SingleNodeProperties
                node={selectedNodeObjects[0]}
                onUpdate={handleNodeUpdate}
              />
            )}

            {/* Multi-node selection */}
            {selectedNodeObjects.length > 1 && (
              <MultipleNodeProperties
                nodes={selectedNodeObjects}
                onUpdate={handleNodeUpdate}
              />
            )}
          </>
        )}

        {/* Edge properties */}
        {selectedEdgeObjects.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <EdgeStylePanel
              edges={edges as ReactFlowEdge[]}
              selectedEdges={selectedEdgeObjects as ReactFlowEdge[]}
              onUpdateEdges={handleUpdateEdges}
            />
          </div>
        )}

        {/* Delete button */}
        {hasSelection && (
          <div className="p-4 border-t border-gray-200 bg-red-50/30">
            <button
              type="button"
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 hover:shadow-sm transition-all duration-200 active:scale-[0.98]"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* CSS Editor Dialog */}
      {cssEditorOpen && (
        <StyleEditorDialog
          isOpen={cssEditorOpen}
          onClose={() => setCssEditorOpen(false)}
          diagramId={currentDiagram?.id || 'default'}
          initialCss={
            cssEditorMode === 'node' && selectedNodeObjects.length === 1
              ? (selectedNodeObjects[0].data.properties?.customCSS as string) || ''
              : currentDiagram?.customCSS || ''
          }
          onSave={cssEditorMode === 'node' ? handleNodeCssSave : handleDiagramCssSave}
        />
      )}
    </div>
  );
}

/**
 * Single Node Properties - TEMPLATE FIRST APPROACH
 */
interface SingleNodePropertiesProps {
  node: Node;
  onUpdate: (id: string, updates: Partial<Node>) => void;
}

function SingleNodeProperties({ node, onUpdate }: SingleNodePropertiesProps) {
  const { getTemplateById, addTemplate, updateTemplate, createTemplate } = useTemplateStore();

  // Get current template
  const template = node.data.templateId ? getTemplateById(node.data.templateId) : null;

  // State for variable validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // State for template upload error
  const [uploadError, setUploadError] = useState<string | null>(null);

  // State for Jinja editor
  const [jinjaEditMode, setJinjaEditMode] = useState(false);
  const [jinjaTemplateValue, setJinjaTemplateValue] = useState('');

  // State for save as new template dialog
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('custom');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Handle template selection
  const handleTemplateSelect = (templateId: string | undefined) => {
    // Clear properties when changing templates
    onUpdate(node.id, {
      data: {
        ...node.data,
        templateId,
        properties: templateId ? {} : undefined,
      }
    });
    setValidationErrors({});
  };

  // Handle basic data updates
  const handleDataUpdate = (field: string, value: any) => {
    onUpdate(node.id, {
      data: {
        ...node.data,
        [field]: value,
      }
    });
  };

  // Handle template variable value change
  const handleVariableChange = (variableName: string, value: any) => {
    const newProperties = {
      ...(node.data.properties || {}),
      [variableName]: value,
    };

    // Validate if template has variables
    if (template?.variables) {
      const variable = template.variables.find(v => v.name === variableName);
      if (variable) {
        const validation = validateVariableValue(variable, value);
        if (!validation.valid) {
          setValidationErrors({
            ...validationErrors,
            [variableName]: validation.error || 'Invalid value',
          });
        } else {
          const newErrors = { ...validationErrors };
          delete newErrors[variableName];
          setValidationErrors(newErrors);
        }
      }
    }

    handleDataUpdate('properties', newProperties);
  };

  // Handle template upload
  const handleTemplateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    try {
      const result = await importTemplateFromFile(file);
      if (result.success && result.template) {
        // Use createTemplate to add the imported template
        const { id, createdAt, updatedAt, ...templateData } = result.template;
        await createTemplate(templateData);
        // Get the newly created template (it will be the last one)
        const templates = useTemplateStore.getState().templates;
        const newTemplate = templates[templates.length - 1];
        if (newTemplate) {
          handleTemplateSelect(newTemplate.id);
        }
      } else {
        setUploadError(result.error || 'Failed to import UI template');
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to import UI template');
    }

    // Reset input
    event.target.value = '';
  };

  // Extract variables from Jinja template
  const extractVariablesFromJinja = (jinja: string): TemplateVariable[] => {
    const varNames = extractVariableNames(jinja);
    return varNames.map(name => ({
      name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      type: 'text' as const,
    }));
  };

  // Start editing template
  const handleStartEditTemplate = () => {
    setJinjaTemplateValue(node.data.jinjaTemplate || template?.jinjaTemplate || '');
    setJinjaEditMode(true);
  };

  // Update the template (affects all nodes using it)
  const handleUpdateTemplate = async () => {
    if (!template) return;

    try {
      // Extract variables from the new Jinja template
      const variables = extractVariablesFromJinja(jinjaTemplateValue);

      await updateTemplate(template.id, {
        jinjaTemplate: jinjaTemplateValue,
        variables,
      });

      // Clear any node-level override
      if (node.data.jinjaTemplate) {
        handleDataUpdate('jinjaTemplate', undefined);
      }

      setJinjaEditMode(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to update template');
    }
  };

  // Save as new template
  const handleSaveAsNewTemplate = async () => {
    if (!newTemplateName.trim()) {
      setSaveError('Template name is required');
      return;
    }

    try {
      // Extract variables from the Jinja template
      const variables = extractVariablesFromJinja(jinjaTemplateValue);

      await createTemplate({
        name: newTemplateName.trim(),
        description: `Custom template based on ${template?.name || 'custom'}`,
        category: newTemplateCategory as any,
        author: 'User',
        isPublic: false,
        isSystemTemplate: false,
        jinjaTemplate: jinjaTemplateValue,
        variables,
        data: { label: newTemplateName.trim() },
        style: {},
        tags: template?.tags || [],
      });

      // Get the newly created template (it will be the last one in the store)
      const store = useTemplateStore.getState();
      const newTemplate = store.templates[store.templates.length - 1];

      if (newTemplate) {
        // Assign new template to this node
        handleTemplateSelect(newTemplate.id);

        // Clear any node-level override
        if (node.data.jinjaTemplate) {
          handleDataUpdate('jinjaTemplate', undefined);
        }

        setShowSaveAsDialog(false);
        setNewTemplateName('');
        setSaveError(null);
        setJinjaEditMode(false);
      } else {
        setSaveError('Failed to create template');
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to create template');
    }
  };

  // Get current properties (merged with defaults extracted from Jinja template)
  const templateDefaults = template?.jinjaTemplate ? parseJinjaDefaults(template.jinjaTemplate) : {};
  const currentProperties = Object.keys(templateDefaults).length > 0
    ? { ...templateDefaults, ...(node.data.properties || {}) }
    : (node.data.properties || {});

  return (
    <>
      {/* UI Template Section */}
      <PropertySection title="UI Template" defaultOpen>
        <TemplateSelector
          selectedTemplateId={node.data.templateId}
          onSelect={handleTemplateSelect}
        />

        {/* Template Upload */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Custom UI Template
          </label>
          <div className="flex gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer transition-all duration-200">
              <Upload className="w-4 h-4" />
              Upload JSON
              <input
                type="file"
                accept=".json"
                onChange={handleTemplateUpload}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200"
              title="Download sample template file"
            >
              <Download className="w-4 h-4" />
              Sample
            </button>
          </div>
          {uploadError && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{uploadError}</p>
          )}
        </div>
      </PropertySection>

      {/* Basic Properties (always shown) */}
      <PropertySection title="Basic" defaultOpen>
        <PropertyInput
          label="Label"
          value={node.data.label}
          type="text"
          onChange={(value) => handleDataUpdate('label', value)}
          placeholder="Node label"
        />

        <PropertyInput
          label="ID"
          value={node.id}
          type="text"
          disabled
          onChange={() => {}}
        />
      </PropertySection>

      {/* Template Variables (shown when template is selected) */}
      {template && template.variables && template.variables.length > 0 && (
        <PropertySection title="Template Variables" defaultOpen>
          {template.variables.map((variable) => {
            const value = currentProperties[variable.name];
            const error = validationErrors[variable.name];

            return (
              <VariableInput
                key={variable.name}
                variable={variable}
                value={value}
                onChange={(newValue) => handleVariableChange(variable.name, newValue)}
                error={error}
              />
            );
          })}
        </PropertySection>
      )}

      {/* Jinja Template Editor */}
      <PropertySection
        title={
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            Template Editor
          </div>
        }
        defaultOpen={false}
      >
        {!jinjaEditMode ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {template
                ? 'Edit the template code. Changes can be applied to all nodes using this template, or saved as a new template.'
                : 'Select a template to edit its code, or create a custom Jinja template for this node.'
              }
            </p>

            {template && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Current Template:</div>
                <div className="text-sm font-medium text-gray-900">{template.name}</div>
                <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                <div className="text-xs text-gray-400 mt-2">
                  {template.isSystemTemplate && '(Built-in template - save as new to modify)'}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleStartEditTemplate}
              disabled={!template && !node.data.jinjaTemplate}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit3 className="w-4 h-4" />
              {template ? 'Edit Template Code' : 'Edit Custom Jinja'}
            </button>

            {node.data.jinjaTemplate && !template && (
              <button
                type="button"
                onClick={() => handleDataUpdate('jinjaTemplate', undefined)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all duration-200"
              >
                Remove Custom Template
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Editing: {template ? template.name : 'Custom Jinja'}
                {template && template.isSystemTemplate && ' (Built-in)'}
              </div>
              <button
                type="button"
                onClick={() => {
                  setJinjaEditMode(false);
                  setSaveError(null);
                }}
                className="text-xs text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
            </div>

            <JinjaEditor
              value={jinjaTemplateValue}
              onChange={setJinjaTemplateValue}
              height="350px"
              className="rounded-lg overflow-hidden border border-gray-200"
            />

            {/* Detected variables */}
            {extractVariableNames(jinjaTemplateValue).length > 0 && (
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-700 font-medium mb-1">Detected Variables:</div>
                <div className="flex flex-wrap gap-1">
                  {extractVariableNames(jinjaTemplateValue).map(v => (
                    <code key={v} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                      {`{{ ${v} }}`}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {saveError && (
              <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                <div className="text-xs text-red-600">{saveError}</div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              {template ? (
                <>
                  {/* Update Template button - disabled for system templates */}
                  <button
                    type="button"
                    onClick={handleUpdateTemplate}
                    disabled={template.isSystemTemplate}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={template.isSystemTemplate ? 'Cannot edit built-in templates directly' : 'Update this template (affects all nodes using it)'}
                  >
                    <Save className="w-4 h-4" />
                    Update Template
                  </button>

                  {/* Save as New button - always enabled */}
                  <button
                    type="button"
                    onClick={() => setShowSaveAsDialog(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200"
                    title="Save as a new template"
                  >
                    <Copy className="w-4 h-4" />
                    Save as New
                  </button>
                </>
              ) : (
                /* Custom Jinja - can only save as new template */
                <button
                  type="button"
                  onClick={() => setShowSaveAsDialog(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200"
                >
                  <Copy className="w-4 h-4" />
                  Save as Template
                </button>
              )}
            </div>
          </div>
        )}
      </PropertySection>

      {/* Save as New Template Dialog */}
      {showSaveAsDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save as New Template</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="My Custom Template"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="custom">Custom</option>
                  <option value="database">Database</option>
                  <option value="service">Service</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="external">External</option>
                  <option value="component">Component</option>
                  <option value="container">Container</option>
                </select>
              </div>

              {saveError && (
                <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-xs text-red-600">{saveError}</div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveAsDialog(false);
                    setSaveError(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAsNewTemplate}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Child Diagram (drill-down) */}
      <PropertySection title="Navigation">
        <PropertyInput
          label="Child Diagram ID"
          value={node.data.childDiagramId || node.childDiagramId || ''}
          type="text"
          onChange={(value) => handleDataUpdate('childDiagramId', value)}
          placeholder="Leave empty for no child diagram"
          helperText="Double-click this node to navigate to child diagram"
        />
      </PropertySection>
    </>
  );
}

/**
 * Multiple Node Properties
 */
interface MultipleNodePropertiesProps {
  nodes: Node[];
  onUpdate: (id: string, updates: Partial<Node>) => void;
}

function MultipleNodeProperties({ nodes, onUpdate }: MultipleNodePropertiesProps) {
  // Get common values
  const commonLabel = nodes.length > 0 && nodes.every(n => n.data.label === nodes[0].data.label)
    ? nodes[0].data.label
    : '';

  const handleDataUpdate = (field: string, value: any) => {
    nodes.forEach((node) => {
      onUpdate(node.id, { data: { ...node.data, [field]: value } });
    });
  };

  const handleStyleUpdate = (field: string, value: any) => {
    nodes.forEach((node) => {
      onUpdate(node.id, { style: { ...node.style, [field]: value } });
    });
  };

  return (
    <>
      <PropertySection title="Common Properties" defaultOpen>
        <PropertyInput
          label="Label"
          value={commonLabel}
          type="text"
          onChange={(value) => handleDataUpdate('label', value)}
          placeholder={commonLabel === '' ? '(different values)' : 'Set common label'}
        />

        <PropertyInput
          label="Background Color"
          value={nodes[0]?.style?.backgroundColor || '#ffffff'}
          type="color"
          onChange={(value) => handleStyleUpdate('backgroundColor', value)}
        />

        <PropertyInput
          label="Border Color"
          value={nodes[0]?.style?.borderColor || '#000000'}
          type="color"
          onChange={(value) => handleStyleUpdate('borderColor', value)}
        />

        <PropertyInput
          label="Border Width"
          value={nodes[0]?.style?.borderWidth || 0}
          type="number"
          min={0}
          onChange={(value) => handleStyleUpdate('borderWidth', value)}
        />

        <PropertyInput
          label="Text Color"
          value={nodes[0]?.style?.color || '#000000'}
          type="color"
          onChange={(value) => handleStyleUpdate('color', value)}
        />
      </PropertySection>
    </>
  );
}
