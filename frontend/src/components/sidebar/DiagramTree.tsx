/**
 * Diagram Tree Component
 *
 * Displays hierarchical tree of diagrams in the sidebar.
 * Supports expand/collapse, drill-down navigation, and diagram type icons.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Box,
  GitBranch,
  Code,
  Layers,
} from 'lucide-react';
import type { Diagram } from '@/types';

interface DiagramTreeNode {
  id: string;
  name: string;
  type: Diagram['type'];
  children: DiagramTreeNode[];
  level: number;
}

interface DiagramTreeProps {
  diagrams: Diagram[];
  currentDiagramId?: string;
  onDiagramSelect?: (diagramId: string) => void;
  className?: string;
}

/**
 * Get icon for diagram type
 */
function getDiagramIcon(type: Diagram['type']) {
  switch (type) {
    case 'system-context':
      return Layers;
    case 'container':
      return Box;
    case 'component':
      return GitBranch;
    case 'code':
      return Code;
    default:
      return FileText;
  }
}

/**
 * Get color for diagram type
 */
function getDiagramColor(type: Diagram['type']): string {
  switch (type) {
    case 'system-context':
      return 'text-blue-600';
    case 'container':
      return 'text-purple-600';
    case 'component':
      return 'text-green-600';
    case 'code':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Build tree structure from flat diagram list
 */
function buildDiagramTree(diagrams: Diagram[]): DiagramTreeNode[] {
  // Create a map of all diagrams
  const diagramMap = new Map<string, DiagramTreeNode>();

  // First pass: create all nodes
  diagrams.forEach((diagram) => {
    diagramMap.set(diagram.id, {
      id: diagram.id,
      name: diagram.name,
      type: diagram.type,
      children: [],
      level: 0,
    });
  });

  // Second pass: build hierarchy
  const rootNodes: DiagramTreeNode[] = [];

  diagrams.forEach((diagram) => {
    const node = diagramMap.get(diagram.id)!;
    const parentId = diagram.metadata.parentDiagramId;

    if (parentId && diagramMap.has(parentId)) {
      // Add to parent's children
      const parent = diagramMap.get(parentId)!;
      parent.children.push(node);
      node.level = parent.level + 1;
    } else {
      // This is a root node
      rootNodes.push(node);
    }
  });

  return rootNodes;
}

/**
 * Recursive tree node component
 */
interface TreeNodeProps {
  node: DiagramTreeNode;
  currentDiagramId?: string;
  onDiagramSelect?: (diagramId: string) => void;
  level: number;
}

function TreeNode({ node, currentDiagramId, onDiagramSelect, level }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const Icon = getDiagramIcon(node.type);
  const isActive = node.id === currentDiagramId;

  const handleClick = () => {
    if (onDiagramSelect) {
      onDiagramSelect(node.id);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      {/* Node Row */}
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
          isActive
            ? 'bg-blue-50 border-l-4 border-blue-600'
            : 'hover:bg-gray-50 border-l-4 border-transparent'
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="p-0.5 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Diagram Type Icon */}
        <Icon className={`w-4 h-4 flex-shrink-0 ${getDiagramColor(node.type)}`} />

        {/* Diagram Name */}
        <span
          className={`text-sm truncate ${
            isActive ? 'font-semibold text-blue-900' : 'text-gray-700'
          }`}
        >
          {node.name}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              currentDiagramId={currentDiagramId}
              onDiagramSelect={onDiagramSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Main DiagramTree component
 */
export function DiagramTree({
  diagrams,
  currentDiagramId,
  onDiagramSelect,
  className = '',
}: DiagramTreeProps) {
  const navigate = useNavigate();

  // Build tree structure
  const treeNodes = useMemo(() => buildDiagramTree(diagrams), [diagrams]);

  // Handle diagram selection
  const handleDiagramSelect = (diagramId: string) => {
    if (onDiagramSelect) {
      onDiagramSelect(diagramId);
    } else {
      // Default behavior: navigate to diagram
      navigate(`/editor/${diagramId}`);
    }
  };

  if (diagrams.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <FileText className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500 text-center">No diagrams yet</p>
        <p className="text-xs text-gray-400 text-center mt-1">
          Create your first diagram to get started
        </p>
      </div>
    );
  }

  return (
    <div className={`DiagramTree ${className}`}>
      {treeNodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          currentDiagramId={currentDiagramId}
          onDiagramSelect={handleDiagramSelect}
          level={0}
        />
      ))}
    </div>
  );
}

export default DiagramTree;
