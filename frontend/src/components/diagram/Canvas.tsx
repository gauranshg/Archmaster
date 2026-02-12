/**
 * Diagram Canvas Component
 *
 * Main diagram canvas using React Flow for visual editing.
 * Provides pan/zoom, node selection, edge creation, and custom rendering.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  ReactFlowInstance,
  OnConnect,
  OnSelectionChangeParams,
  MarkerType,
} from 'reactflow';
import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import type { Diagram, Node as CustomNode, Edge as CustomEdge } from '@/types';
import { nodeTypes, edgeTypes } from './nodes/nodeTypes';
import { ExportControls } from './ExportControls';
import { CssInjector } from '../theme/CssInjector';
import { useTemplateStore } from '@/store/templateStore';
import { useDiagramStore } from '@/store/diagramStore';
import { templateToNode } from '@/services/templates/templateUtils';
import { templateStorage } from '@/services/storage/templateStorage';
import type { Template } from '@/types';

interface CanvasProps {
  /** Diagram to render */
  diagram: Diagram;
  /** Callback when a node is clicked */
  onNodeClick?: (node: ReactFlowNode) => void;
  /** Callback when a node is double-clicked (for drill-down navigation) */
  onNodeDoubleClick?: (node: ReactFlowNode) => void;
  /** Callback when selection changes */
  onSelectionChange?: (nodes: ReactFlowNode[], edges: ReactFlowEdge[]) => void;
  /** Whether the diagram is editable */
  editable?: boolean;
  /** Custom CSS to apply */
  customCSS?: string;
}

/**
 * Canvas component with React Flow
 */
function Canvas({
  diagram,
  onNodeClick,
  onNodeDoubleClick,
  onSelectionChange,
  editable = true,
  customCSS,
}: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { getTemplateById, templates, loadTemplates } = useTemplateStore();
  const { setNodes: setGlobalNodes, setEdges: setGlobalEdges, nodes: globalNodes, edges: globalEdges } = useDiagramStore();

  // Track if we're currently updating from local changes to avoid loops
  const isUpdatingFromLocal = useRef(false);
  const isUpdatingFromGlobal = useRef(false);
  // Track if this is the initial mount to skip sync
  const isInitialMount = useRef(true);
  // Track previous global state for content comparison
  const prevGlobalNodesRef = useRef<string>('');
  const prevGlobalEdgesRef = useRef<string>('');

  // Ensure templates are loaded when canvas mounts
  useEffect(() => {
    if (templates.length === 0) {
      loadTemplates().catch(console.error);
    }
  }, []); // Run once on mount

  // Convert diagram nodes to React Flow nodes (removing diagramId for React Flow)
  // Cast diagram.nodes to any first to access properties, then map to ReactFlowNode
  const initialNodes: ReactFlowNode[] = useMemo(() => {
    return (diagram.nodes as any[]).map((node): ReactFlowNode => ({
      id: node.id,
      type: node.type || 'custom',
      position: node.position,
      data: {
        ...node.data,
        id: node.id,
        childDiagramId: node.childDiagramId,
      },
      style: node.style,
      className: node.className,
      draggable: editable && (node.draggable ?? true),
      selectable: editable && (node.selectable ?? true),
      connectable: editable && (node.connectable ?? true),
    }));
  }, [diagram.nodes, editable]);

  // Convert diagram edges to React Flow edges (removing diagramId for React Flow)
  const initialEdges: ReactFlowEdge[] = useMemo(() => {
    return (diagram.edges as any[]).map((edge): ReactFlowEdge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type || 'default',
      label: edge.label,
      data: edge.data,
      animated: edge.animated,
      style: edge.style,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.style?.stroke || '#b1b1b7',
      },
      hidden: edge.hidden,
      deletable: editable && (edge.deletable ?? true),
    }));
  }, [diagram.edges, editable]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodes, setSelectedNodes] = useState<ReactFlowNode[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<ReactFlowEdge[]>([]);

  // Helper to serialize nodes/edges for content comparison (excludes diagramId and React Flow internal properties)
  const serializeNodes = useCallback((nodesToSerialize: any[]) => {
    return JSON.stringify(
      nodesToSerialize.map(({ id, type, position, data, style, className }) => ({
        id,
        type,
        position,
        data,
        style,
        className,
      }))
    );
  }, []);

  const serializeEdges = useCallback((edgesToSerialize: any[]) => {
    return JSON.stringify(
      edgesToSerialize.map(({ id, source, target, sourceHandle, targetHandle, type, label, style }) => ({
        id,
        source,
        target,
        sourceHandle,
        targetHandle,
        type,
        label,
        style,
      }))
    );
  }, []);

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        type: 'custom',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#b1b1b7',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges] // setNodesState/setEdgesState functions are stable, this is safe
  );

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode) => {
      if (!editable) return;
      onNodeClick?.(node);
    },
    [editable, onNodeClick]
  );

  // Handle node double-click for drill-down navigation
  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode) => {
      onNodeDoubleClick?.(node);
    },
    [onNodeDoubleClick]
  );

  // Handle selection change
  const handleSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      setSelectedNodes(params.nodes);
      setSelectedEdges(params.edges);
      onSelectionChange?.(params.nodes, params.edges);
    },
    [onSelectionChange]
  );

  // Handle React Flow initialization
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);

  // Handle drop from node toolbar or template library
  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance || !editable) return;

      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;

      const dropData = JSON.parse(data);

      // Calculate position
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let newNode: ReactFlowNode;

      // Check if dropping a template
      if (dropData.type === 'template' && dropData.templateId) {
        // First try to get template from store (fast path)
        let template: Template | undefined | null = getTemplateById(dropData.templateId);

        // If not in store, try loading from storage (fallback)
        if (!template) {
          try {
            template = await templateStorage.get(dropData.templateId);
          } catch (error) {
            console.error(`Failed to load template ${dropData.templateId}:`, error);
            return;
          }
        }

        if (!template) {
          console.error(`Template ${dropData.templateId} not found`);
          return;
        }

        // templateToNode returns ReactFlow Node type
        newNode = templateToNode(template, position);
      } else {
        // Legacy: drop from NodeToolbar
        newNode = {
          id: `node-${Date.now()}`,
          type: dropData.type,
          position,
          data: {
            label: dropData.name,
            icon: dropData.icon,
          },
        };
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, editable, setNodes, getTemplateById]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut();
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.2 });
  }, [reactFlowInstance]);

  // Listen for edge delete events
  useEffect(() => {
    const handleDeleteEdge = (event: CustomEvent<{ id: string }>) => {
      const { id } = event.detail;
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
    };

    window.addEventListener('deleteEdge', handleDeleteEdge as EventListener);

    return () => {
      window.removeEventListener('deleteEdge', handleDeleteEdge as EventListener);
    };
  }, [setEdges]);

  // Sync local nodes/edges to global diagramStore for code editor bidirectional sync
  // This ensures that when nodes/edges change in the canvas, the code editor updates
  useEffect(() => {
    // Skip if not editable or if setters aren't available
    if (!editable || !setGlobalNodes || !setGlobalEdges) return;

    // Skip if this update was triggered by global → local sync
    if (isUpdatingFromGlobal.current) return;

    // Skip on initial mount - the initial values are already in sync
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Serialize current local state for comparison
    const currentNodesHash = serializeNodes(nodes);
    const currentEdgesHash = serializeEdges(edges);

    // Skip if content hasn't actually changed
    if (currentNodesHash === prevGlobalNodesRef.current && currentEdgesHash === prevGlobalEdgesRef.current) {
      return;
    }

    // Set flag immediately to prevent reverse sync
    isUpdatingFromLocal.current = true;

    // Update the global store with current nodes/edges
    // We use a timeout to avoid excessive updates during rapid changes (like dragging)
    const timeoutId = setTimeout(() => {
      // Add diagramId to nodes/edges for the global store (CustomNode/CustomEdge types)
      const nodesWithDiagramId = nodes.map((node) => ({
        ...node,
        diagramId: diagram.id,
      }));
      const edgesWithDiagramId = edges.map((edge) => ({
        ...edge,
        diagramId: diagram.id,
      }));

      setGlobalNodes(nodesWithDiagramId as CustomNode[]);
      setGlobalEdges(edgesWithDiagramId as CustomEdge[]);

      // Update cached hashes
      prevGlobalNodesRef.current = currentNodesHash;
      prevGlobalEdgesRef.current = currentEdgesHash;

      // Reset flag after update completes
      setTimeout(() => {
        isUpdatingFromLocal.current = false;
      }, 0);
    }, 100); // Debounce by 100ms

    return () => {
      clearTimeout(timeoutId);
      // Also reset flag on cleanup to prevent getting stuck
      isUpdatingFromLocal.current = false;
    };
  }, [nodes, edges, editable, setGlobalNodes, setGlobalEdges, diagram.id, serializeNodes, serializeEdges]);

  // Sync global nodes/edges to local state when changed from Properties Panel
  // This ensures that property changes appear in the canvas
  useEffect(() => {
    // Skip if not editable or if we're currently syncing from local
    if (!editable || isUpdatingFromLocal.current) return;

    // Skip on initial mount
    if (isInitialMount.current) return;

    // Serialize global state for content comparison
    const globalNodesHash = serializeNodes(globalNodes);

    // Check if content actually changed (not just reference)
    if (globalNodesHash !== prevGlobalNodesRef.current) {
      // Set flag immediately to prevent reverse sync
      isUpdatingFromGlobal.current = true;

      // Remove diagramId for React Flow (it doesn't use it)
      const nodesWithoutDiagramId: ReactFlowNode[] = globalNodes.map(({ diagramId: _diagramId, ...node }: { diagramId?: string; [key: string]: any }) => node);
      setNodes(nodesWithoutDiagramId);

      // Update cached hash
      prevGlobalNodesRef.current = globalNodesHash;

      // Reset flag after state update is applied (after current call stack)
      setTimeout(() => {
        isUpdatingFromGlobal.current = false;
      }, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalNodes, editable, serializeNodes]);

  // Same for edges - use content equality to catch all changes including deletions
  useEffect(() => {
    // Skip if not editable or if we're currently syncing from local
    if (!editable || isUpdatingFromLocal.current) return;

    // Skip on initial mount
    if (isInitialMount.current) return;

    // Serialize global state for content comparison
    const globalEdgesHash = serializeEdges(globalEdges);

    // Check if content actually changed (not just reference)
    if (globalEdgesHash !== prevGlobalEdgesRef.current) {
      // Set flag immediately to prevent reverse sync
      isUpdatingFromGlobal.current = true;

      // Remove diagramId for React Flow (it doesn't use it)
      const edgesWithoutDiagramId: ReactFlowEdge[] = globalEdges.map(({ diagramId: _diagramId, ...edge }: { diagramId?: string; [key: string]: any }) => edge);
      setEdges(edgesWithoutDiagramId);

      // Update cached hash
      prevGlobalEdgesRef.current = globalEdgesHash;

      // Reset flag after state update is applied (after current call stack)
      setTimeout(() => {
        isUpdatingFromGlobal.current = false;
      }, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalEdges, editable, serializeEdges]);

  return (
    <div
      ref={reactFlowWrapper}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      data-diagram-id={diagram.id}
    >
      {/* Inject custom CSS */}
      {customCSS && (
        <CssInjector
          css={customCSS}
          diagramId={diagram.id}
          enableScoping={true}
        />
      )}

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onSelectionChange={handleSelectionChange}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={editable}
        nodesConnectable={editable}
        elementsSelectable={editable}
        selectNodesOnDrag={editable}
        panOnScroll
        selectionOnDrag
        panOnDrag={editable ? [1, 2] : false}
        zoomOnScroll={editable}
        zoomOnPinch={editable}
        preventScrolling={!editable}
        defaultViewport={{
          x: 0,
          y: 0,
          zoom: 0.7,
        }}
        fitView={false}
        minZoom={0.1}
        maxZoom={4}
        attributionPosition="bottom-left"
      >
        <Background
          color="#d1d5db"
          gap={16}
          style={{
            backgroundColor: diagram.styles?.background || '#ffffff',
          }}
        />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.selected) return '#3b82f6';
            return '#e5e7eb';
          }}
          maskColor="rgba(0, 0, 0, 0.05)"
        />
      </ReactFlow>

      {/* Custom Zoom Controls */}
      <div className="absolute bottom-5 right-5 flex items-center gap-2 z-50">
        <div className="flex items-center bg-white/90 backdrop-blur-lg rounded-xl shadow-elevated border border-gray-200/50 p-1.5">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            <ZoomOut size={18} />
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button
            onClick={handleFitView}
            title="Fit View"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            <Maximize size={18} />
          </button>
          <ExportControls
            containerRef={reactFlowWrapper as React.RefObject<HTMLDivElement>}
            diagramName={diagram.name}
            backgroundColor={diagram.styles?.background}
          />
        </div>
      </div>

      {/* Selection info */}
      {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
        <div className="absolute bottom-5 left-5 px-4 py-2.5 bg-white/90 backdrop-blur-lg rounded-xl shadow-elevated border border-gray-200/50 text-sm text-gray-700 font-medium z-50 animate-slide-in">
          <span className="text-blue-600">
            {selectedNodes.length > 0 && `${selectedNodes.length} node${selectedNodes.length > 1 ? 's' : ''}`}
          </span>
          {selectedNodes.length > 0 && selectedEdges.length > 0 && (
            <span className="mx-2 text-gray-300">•</span>
          )}
          <span className="text-blue-600">
            {selectedEdges.length > 0 && `${selectedEdges.length} edge${selectedEdges.length > 1 ? 's' : ''}`}
          </span>
          <span className="ml-2 text-gray-500">selected</span>
        </div>
      )}
    </div>
  );
}

/**
 * Wrapped canvas with ReactFlowProvider
 */
export function DiagramCanvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}

export default DiagramCanvas;
