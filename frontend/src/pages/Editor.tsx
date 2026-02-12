/**
 * Editor Page
 *
 * Simple, working editor page based on TemplateDemo structure.
 * Features:
 * - Template library sidebar
 * - Diagram canvas with drag-and-drop
 * - Properties panel
 * - Template save functionality
 * - View modes: Visual, Code, Split
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Save, Download, Image as ImageIcon, Plus } from 'lucide-react';

// Components
import { DiagramCanvas } from '@/components/diagram/Canvas';
import { TemplateLibrary, SaveTemplateDialog, DiagramTree } from '@/components/sidebar';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { SplitView } from '@/components/layout/SplitView';
import { ViewModeToggle } from '@/components/common/ViewModeToggle';
import { LayoutControls } from '@/components/diagram/LayoutControls';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { C4Wizard } from '@/components/c4';

// Stores & services
import { useDiagramStore } from '@/store/diagramStore';
import { useNavigationStore } from '@/store/navigationStore';
import { diagramStorage } from '@/services/storage';
import { initializeTemplates } from '@/services/templates';
import { templateToNode } from '@/services/templates/templateUtils';
import { useViewMode } from '@/hooks/useViewMode';
import { applyLayout, type LayoutOptions } from '@/services/layout/layoutService';
import { exportService } from '@/services/export';
import { exportAndDownloadPNG, type PNGExportOptions } from '@/services/export/pngExport.js';
import { exportAndDownloadSVG, type SVGExportOptions } from '@/services/export/svgExport.js';

// Types
import type { Node, Edge, Template, Diagram } from '@/types';
import type { C4Preset } from '@/services/c4';

/**
 * Editor page component
 */
export function Editor() {
  const { diagramId } = useParams<{ diagramId?: string }>();
  const navigate = useNavigate();

  // Local state
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [editorLanguage, setEditorLanguage] = useState<'json' | 'yaml'>('json');
  const [sidebarTab, setSidebarTab] = useState<'templates' | 'layout' | 'navigation'>('templates');
  const [isLayouting, setIsLayouting] = useState(false);
  const [manualPositions, setManualPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [layoutMode, setLayoutMode] = useState<'manual' | 'auto'>('manual');
  const [allDiagrams, setAllDiagrams] = useState<Diagram[]>([]);
  const [isLoadingDiagrams, setIsLoadingDiagrams] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showC4Wizard, setShowC4Wizard] = useState(false);

  // Store hooks
  const { currentDiagram, nodes, edges, setCurrentDiagram, addNode, setNodes, setEdges, setSelectedNodes: setGlobalSelectedNodes, setSelectedEdges: setGlobalSelectedEdges } = useDiagramStore();
  const { setCurrentDiagram: setNavigationBreadcrumb } = useNavigationStore();

  // View mode hook
  const { viewMode } = useViewMode();

  // Initialize templates on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeTemplates();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize templates:', error);
        setIsInitialized(true); // Continue even if seeding fails
      }
    };

    init();
  }, []);

  // Load all diagrams for navigation tree
  useEffect(() => {
    const loadAllDiagrams = async () => {
      setIsLoadingDiagrams(true);
      try {
        const diagrams = await diagramStorage.listAll();
        setAllDiagrams(diagrams);
      } catch (error) {
        console.error('Failed to load diagrams list:', error);
      } finally {
        setIsLoadingDiagrams(false);
      }
    };

    loadAllDiagrams();
  }, [diagramId]); // Refresh when diagramId changes (new diagram created)

  // Load diagram on mount
  useEffect(() => {
    const loadDiagram = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (diagramId) {
          // Load existing diagram
          const diagram = await diagramStorage.get(diagramId);
          if (diagram) {
            setCurrentDiagram(diagram);
            setNavigationBreadcrumb(diagram);
          } else {
            setError('Diagram not found');
          }
        } else {
          // Create new diagram
          const newDiagram: Diagram = {
            id: crypto.randomUUID(),
            name: 'Untitled Diagram',
            type: 'generic',
            nodes: [],
            edges: [],
            customCSS: '',
            metadata: {
              createdAt: Date.now(),
              updatedAt: Date.now(),
              version: '1.0.0',
            },
          };
          setCurrentDiagram(newDiagram);
          setNavigationBreadcrumb(newDiagram);
        }
      } catch (err) {
        console.error('Failed to load diagram:', err);
        setError(err instanceof Error ? err.message : 'Failed to load diagram');
      } finally {
        setIsLoading(false);
      }
    };

    if (isInitialized) {
      loadDiagram();
    }
  }, [diagramId, setCurrentDiagram, setNavigationBreadcrumb, isInitialized]);

  // Auto-save on changes
  useEffect(() => {
    if (!currentDiagram || isLoading) return;

    const saveTimeout = setTimeout(async () => {
      try {
        await diagramStorage.save({
          ...currentDiagram,
          nodes,
          edges,
          metadata: {
            ...currentDiagram.metadata,
            modifiedAt: new Date().toISOString(),
          },
        });
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 1000); // Auto-save after 1 second of inactivity

    return () => clearTimeout(saveTimeout);
  }, [currentDiagram, nodes, edges, isLoading]);

  // Handle template selection from library
  const handleTemplateSelect = useCallback((template: Template) => {
    console.log('Template selected:', template.name);

    // Convert template to node and add to canvas at random position
    const newNode = templateToNode(template, {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    });

    addNode(newNode);
  }, [addNode]);

  // Handle node selection change
  const handleSelectionChange = useCallback((nodes: Node[], edges: Edge[]) => {
    setSelectedNodes(nodes);
    // Also update global store for PropertiesPanel
    const nodeIds = nodes.map(n => n.id);
    const edgeIds = edges.map(e => e.id);
    setGlobalSelectedNodes(nodeIds);
    setGlobalSelectedEdges(edgeIds);
  }, [setGlobalSelectedNodes, setGlobalSelectedEdges]);

  // Handle save template
  const handleSaveTemplate = useCallback(() => {
    if (selectedNodes.length === 0) {
      alert('Please select at least one node to save as a template');
      return;
    }
    setShowSaveTemplateDialog(true);
  }, [selectedNodes]);

  // Handle template saved
  const handleTemplateSaved = useCallback((template: Template) => {
    console.log('Template saved:', template.name);
    setShowSaveTemplateDialog(false);
    // Show success notification (could add toast notification here)
  }, []);

  // Handle save diagram
  const handleSave = useCallback(async () => {
    if (!currentDiagram) return;

    try {
      await diagramStorage.save({
        ...currentDiagram,
        nodes,
        edges,
        metadata: {
          ...currentDiagram.metadata,
          modifiedAt: new Date().toISOString(),
        },
      });
      // Show success notification
      alert('Diagram saved successfully!');
    } catch (err) {
      console.error('Save failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to save diagram');
    }
  }, [currentDiagram, nodes, edges]);

  // Handle export diagram
  const handleExport = useCallback(
    async (format: 'json' | 'png' | 'svg' = 'json') => {
      if (!currentDiagram || isExporting) return;

      setIsExporting(true);
      setShowExportMenu(false);

      try {
        if (format === 'json') {
          // Export as JSON using existing export service
          exportService.exportAsFile(currentDiagram, currentDiagram.name, {
            format: 'json',
            includeMetadata: true,
            includeCustomCSS: true,
            includeLayout: true,
            pretty: true,
            indent: 2,
          });
        } else {
          // Export as PNG or SVG - find the react-flow-wrapper
          const canvasElement = document.querySelector(
            '[data-diagram-id]'
          ) as HTMLElement;

          if (!canvasElement) {
            alert('Could not find diagram canvas for export');
            return;
          }

          const bgColor = currentDiagram.styles?.background || '#ffffff';

          if (format === 'png') {
            const options: PNGExportOptions = {
              filename: currentDiagram.name,
              scale: 2,
              backgroundColor: bgColor,
              padding: 40,
            };
            await exportAndDownloadPNG(canvasElement, options);
          } else {
            // SVG export
            const options: SVGExportOptions = {
              filename: currentDiagram.name,
              backgroundColor: bgColor,
              padding: 40,
              embedImages: true,
              inlineStyles: true,
              includeMetadata: true,
            };
            await exportAndDownloadSVG(canvasElement, options);
          }
        }
      } catch (error) {
        console.error('Export failed:', error);
        alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsExporting(false);
      }
    },
    [currentDiagram, isExporting]
  );

  // Handle code editor changes
  const handleCodeChange = useCallback((code: string) => {
    console.log('Code changed:', code.substring(0, 100) + '...');
    // TODO: Implement bidirectional sync (phase 2)
  }, []);

  // Handle code editor save
  const handleCodeSave = useCallback(() => {
    console.log('Code saved!');
    // TODO: Persist changes
  }, []);

  // Handle layout apply
  const handleLayoutApply = useCallback(
    (options: Partial<LayoutOptions>) => {
      if (isLayouting) return;

      setIsLayouting(true);

      // Save current manual positions before applying layout
      const positions: Record<string, { x: number; y: number }> = {};
      nodes.forEach((node) => {
        positions[node.id] = node.position;
      });
      setManualPositions(positions);

      // Apply layout
      setTimeout(() => {
        const result = applyLayout(nodes, edges, options);
        setNodes(result.nodes);
        setLayoutMode('auto');
        setIsLayouting(false);
      }, 100);
    },
    [nodes, edges, isLayouting, setNodes]
  );

  // Handle layout reset (restore manual positions)
  const handleLayoutReset = useCallback(() => {
    if (Object.keys(manualPositions).length === 0) return;

    const restoredNodes = nodes.map((node) => ({
      ...node,
      position: manualPositions[node.id] || node.position,
    }));

    setNodes(restoredNodes);
    setLayoutMode('manual');
  }, [manualPositions, nodes, setNodes]);

  // Handle diagram selection from navigation tree
  const handleDiagramSelect = useCallback((selectedDiagramId: string) => {
    navigate(`/editor/${selectedDiagramId}`);
  }, [navigate]);

  // Handle node double-click for drill-down navigation
  const handleNodeDoubleClick = useCallback(
    async (node: Node) => {
      const childDiagramId = node.data?.childDiagramId as string | undefined;

      if (childDiagramId) {
        // Navigate to child diagram
        navigate(`/editor/${childDiagramId}`);
      } else {
        // No child diagram - prompt to create one
        const createChild = confirm(
          `The node "${node.data?.label || node.id}" doesn't have a child diagram.\n\nWould you like to create one?`
        );

        if (createChild) {
          // Create a new child diagram
          const now = new Date().toISOString();
          const newDiagram: Diagram = {
            id: crypto.randomUUID(),
            name: `${node.data?.label || node.id} - Detail`,
            type: 'component',
            nodes: [],
            edges: [],
            parentDiagramId: currentDiagram?.id,
            parentNodeId: node.id,
            customCSS: '',
            metadata: {
              version: 0,
              author: 'user',
              createdAt: now,
              modifiedAt: now,
              parentDiagramId: currentDiagram?.id,
            },
            workspaceId: currentDiagram?.workspaceId || 'default',
            createdAt: now,
            updatedAt: now,
          };

          try {
            // Save the new diagram
            await diagramStorage.save(newDiagram);

            // Update the node with childDiagramId
            const updatedNode = {
              ...node,
              data: {
                ...node.data,
                childDiagramId: newDiagram.id,
              },
            };

            // Update the current diagram with the modified node
            const updatedNodes = nodes.map((n) =>
              n.id === node.id ? updatedNode : n
            );

            setNodes(updatedNodes);

            // Save the current diagram with the updated node
            if (currentDiagram) {
              const updatedDiagram = {
                ...currentDiagram,
                nodes: updatedNodes.map((n) => ({
                  id: n.id,
                  diagramId: currentDiagram.id,
                  position: n.position,
                  data: n.data,
                  style: n.style,
                  className: n.className,
                  type: n.type,
                  draggable: n.draggable,
                  selectable: n.selectable,
                  connectable: n.connectable,
                  childDiagramId: n.data?.childDiagramId,
                })),
                edges: edges.map((e) => ({
                  id: e.id,
                  diagramId: currentDiagram.id,
                  source: e.source,
                  target: e.target,
                  sourceHandle: e.sourceHandle,
                  targetHandle: e.targetHandle,
                  type: e.type,
                  label: e.label,
                  data: e.data,
                  animated: e.animated,
                  style: e.style,
                  markerEnd: e.markerEnd,
                  markerStart: e.markerStart,
                  hidden: e.hidden,
                  deletable: e.deletable,
                })),
              };
              await diagramStorage.save(updatedDiagram);
            }

            // Navigate to the new diagram
            navigate(`/editor/${newDiagram.id}`);
          } catch (error) {
            console.error('Failed to create child diagram:', error);
            alert('Failed to create child diagram. Please try again.');
          }
        }
      }
    },
    [navigate, currentDiagram, nodes, setNodes]
  );

  // IMPORTANT: ALL useMemo hooks must be called BEFORE any early returns
  // This ensures hooks are always called in the same order (React Rules of Hooks)

  // Visual content (canvas) - safe to call even if currentDiagram is null
  const visualContent = useMemo(() => {
    if (!currentDiagram) return null;
    return (
      <div className="h-full relative">
        <DiagramCanvas
          diagram={currentDiagram}
          onSelectionChange={handleSelectionChange}
          onNodeDoubleClick={handleNodeDoubleClick}
          editable={true}
          customCSS={currentDiagram.customCSS}
        />
      </div>
    );
  }, [currentDiagram, handleSelectionChange, handleNodeDoubleClick]);

  // Code content (Monaco editor)
  const codeContent = useMemo(() => (
    <div className="h-full relative">
      <CodeEditor
        language={editorLanguage}
        readOnly={false}
        onChange={handleCodeChange}
        onSave={handleCodeSave}
        height="100%"
      />
    </div>
  ), [editorLanguage, handleCodeChange, handleCodeSave]);

  // Template library sidebar (always visible)
  const templateLibrarySidebar = useMemo(() => (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h1 className="text-xl font-bold text-gray-800">Editor Tools</h1>
        <p className="text-sm text-gray-600 mt-1">
          {sidebarTab === 'templates' ? 'Drag templates to canvas' :
           sidebarTab === 'navigation' ? 'Navigate your diagrams' :
           'Auto-arrange nodes'}
        </p>
      </div>

      {/* Tab Buttons */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setSidebarTab('templates')}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
            sidebarTab === 'templates'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setSidebarTab('navigation')}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
            sidebarTab === 'navigation'
              ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Navigation
        </button>
        <button
          onClick={() => setSidebarTab('layout')}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
            sidebarTab === 'layout'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Layout
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {sidebarTab === 'templates' ? (
          <TemplateLibrary
            onTemplateSelect={handleTemplateSelect}
            canDelete={true}
          />
        ) : sidebarTab === 'navigation' ? (
          <div className="overflow-y-auto h-full">
            {isLoadingDiagrams ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <DiagramTree
                diagrams={allDiagrams}
                currentDiagramId={currentDiagram?.id}
                onDiagramSelect={handleDiagramSelect}
              />
            )}
          </div>
        ) : (
          <div className="p-4 overflow-y-auto h-full">
            <LayoutControls
              onLayoutApply={handleLayoutApply}
              onLayoutReset={layoutMode === 'auto' ? handleLayoutReset : undefined}
              nodeCount={nodes.length}
              isLayouting={isLayouting}
            />
          </div>
        )}
      </div>

      {/* Save Template Button - only show in templates tab */}
      {sidebarTab === 'templates' && selectedNodes.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSaveTemplate}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            <Save size={20} />
            Save {selectedNodes.length} Node{selectedNodes.length > 1 ? 's' : ''} as Template
          </button>
        </div>
      )}
    </div>
  ), [selectedNodes, handleTemplateSelect, handleSaveTemplate, sidebarTab, nodes.length, isLayouting, handleLayoutApply, layoutMode, handleLayoutReset, allDiagrams, currentDiagram, handleDiagramSelect, isLoadingDiagrams]);

  // Properties panel (right side)
  const propertiesPanel = useMemo(() => (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-lg font-bold text-gray-800">Properties</h2>
        <p className="text-xs text-gray-600 mt-1">
          {selectedNodes.length > 0
            ? `${selectedNodes.length} node${selectedNodes.length > 1 ? 's' : ''} selected`
            : 'Select a node to edit properties'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <PropertiesPanel />
      </div>
    </div>
  ), [selectedNodes]);

  // Header with view mode toggle
  const headerContent = useMemo(() => {
    if (!currentDiagram) return null;
    return (
      <div className="bg-white border-b border-gray-200 shadow-sm">
        {/* Top row: Breadcrumb navigation */}
        <div className="h-14 flex items-center justify-between px-6">
          <Breadcrumb
            showHome={true}
            homeUrl="/"
            onNavigate={(diagramId) => navigate(`/editor/${diagramId}`)}
            className="text-sm"
          />
        </div>

        {/* Bottom row: Title and actions */}
        <div className="h-16 flex items-center justify-between px-6 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">{currentDiagram.name}</h2>
              <p className="text-xs text-gray-500">
                {sidebarTab === 'templates' ? 'Use Templates tab to add nodes' :
                 sidebarTab === 'navigation' ? 'Use Navigation tab to browse diagrams' :
                 'Use Layout tab to auto-arrange'}
              </p>
            </div>
          </div>

          {/* View Mode Toggle & Actions */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <ViewModeToggle size="md" variant="default" showShortcuts={false} />

            {/* Language Toggle (for code editor) */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <button
                onClick={() => setEditorLanguage('json')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                  editorLanguage === 'json'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                type="button"
              >
                JSON
              </button>
              <button
                onClick={() => setEditorLanguage('yaml')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                  editorLanguage === 'yaml'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                type="button"
              >
                YAML
              </button>
            </div>

            {/* New C4 Diagram Button */}
            <button
              onClick={() => setShowC4Wizard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus size={18} />
              New C4 Diagram
            </button>

            {selectedNodes.length > 0 && (
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Save as Template
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Save size={18} />
              Save
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Export
                  </>
                )}
              </button>

              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-elevated border border-gray-200/50 z-50">
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors rounded-t-xl flex items-center gap-3"
                    >
                      <Download size={16} className="text-gray-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-800">Export as JSON</div>
                        <div className="text-xs text-gray-500">Save diagram data</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleExport('png')}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3"
                    >
                      <ImageIcon size={16} className="text-gray-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-800">Export as PNG</div>
                        <div className="text-xs text-gray-500">High resolution image</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleExport('svg')}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors rounded-b-xl flex items-center gap-3"
                    >
                      <ImageIcon size={16} className="text-purple-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-800">Export as SVG</div>
                        <div className="text-xs text-gray-500">Vector image for editing</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }, [currentDiagram, editorLanguage, selectedNodes, handleSave, handleExport, handleSaveTemplate, navigate, showExportMenu, isExporting]);

  // Save Template Dialog
  const saveTemplateDialog = useMemo(() => (
    <SaveTemplateDialog
      nodes={selectedNodes}
      isOpen={showSaveTemplateDialog}
      onClose={() => setShowSaveTemplateDialog(false)}
      onSave={handleTemplateSaved}
      author="User"
    />
  ), [selectedNodes, showSaveTemplateDialog, handleTemplateSaved]);

  // Error notification
  const errorNotification = error ? useMemo(() => (
    <div className="fixed bottom-4 left-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-900 mb-1">Error</h4>
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <button
          onClick={() => setError(null)}
          className="text-red-600 hover:text-red-800"
        >
          ×
        </button>
      </div>
    </div>
  ), [error]) : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !currentDiagram) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // No diagram state
  if (!currentDiagram) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Diagram</h2>
          <p className="text-gray-600 mb-6">Create or open a diagram to start editing</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // IMPORTANT: All hooks have been called, now safe to conditionally render based on view mode
  if (viewMode === 'visual') {
    return (
      <div className="flex h-full bg-gray-50">
        {/* Left Sidebar - Template Library */}
        {templateLibrarySidebar}

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          {headerContent}

          {/* Canvas */}
          {visualContent}
        </div>

        {/* Right Sidebar - Properties */}
        {propertiesPanel}

        {/* Save Template Dialog */}
        {saveTemplateDialog}

        {/* C4 Wizard */}
        <C4Wizard
          isOpen={showC4Wizard}
          onClose={() => setShowC4Wizard(false)}
          onComplete={(diagramId) => {
            setShowC4Wizard(false);
            navigate(`/editor/${diagramId}`);
          }}
        />

        {/* Error notification */}
        {errorNotification}
      </div>
    );
  }

  if (viewMode === 'code') {
    return (
      <div className="flex h-full bg-gray-50">
        {/* Left Sidebar - Template Library (still visible in code mode) */}
        {templateLibrarySidebar}

        {/* Main Code Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          {headerContent}

          {/* Code Editor */}
          {codeContent}
        </div>

        {/* Right Sidebar - Properties */}
        {propertiesPanel}

        {/* Save Template Dialog */}
        {saveTemplateDialog}

        {/* C4 Wizard */}
        <C4Wizard
          isOpen={showC4Wizard}
          onClose={() => setShowC4Wizard(false)}
          onComplete={(diagramId) => {
            setShowC4Wizard(false);
            navigate(`/editor/${diagramId}`);
          }}
        />

        {/* Error notification */}
        {errorNotification}
      </div>
    );
  }

  // Split view mode
  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar - Template Library */}
      {templateLibrarySidebar}

      {/* Main Split View Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {headerContent}

        {/* Split View Container */}
        <div className="flex-1 overflow-hidden">
          <SplitView
            visualContent={visualContent}
            codeContent={codeContent}
            minPanelWidth={300}
            initialSplitRatio={0.5}
            showCollapseButtons={true}
          />
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      {propertiesPanel}

      {/* Save Template Dialog */}
      {saveTemplateDialog}

      {/* C4 Wizard */}
      <C4Wizard
        isOpen={showC4Wizard}
        onClose={() => setShowC4Wizard(false)}
        onComplete={(diagramId) => {
          setShowC4Wizard(false);
          navigate(`/editor/${diagramId}`);
        }}
      />

      {/* Error notification */}
      {errorNotification}
    </div>
  );
}

export default Editor;
