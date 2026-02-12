/**
 * Edge Style Panel Component
 *
 * Provides UI controls for styling and configuring edges.
 */

import { useState, useCallback, useMemo } from 'react';
import { Edge, MarkerType } from '@reactflow/core';
import {
  Minus,
  Dot,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  MoveDown,
} from 'lucide-react';

interface EdgeStylePanelProps {
  edges: Edge[];
  selectedEdges: Edge[];
  onUpdateEdges: (edges: Edge[]) => void;
}

type EdgeStyle = 'solid' | 'dashed' | 'dotted';
type EdgeFlowType = 'default' | 'straight';
type EdgeArrow = 'none' | 'end' | 'start' | 'both';

// Helper to determine line style from strokeDasharray
function getLineStyleFromDasharray(dasharray?: string): EdgeStyle {
  if (!dasharray) return 'solid';
  if (dasharray.includes('5,5') || dasharray.includes('5 5')) return 'dashed';
  if (dasharray.includes('2,2') || dasharray.includes('2 2')) return 'dotted';
  return 'solid';
}

// Helper to determine arrow type from markers
function getArrowTypeFromMarkers(edge: Edge): EdgeArrow {
  const hasEnd = edge.markerEnd !== null && edge.markerEnd !== undefined;
  const hasStart = edge.markerStart !== null && edge.markerStart !== undefined;

  if (hasEnd && hasStart) return 'both';
  if (hasStart) return 'start';
  if (hasEnd) return 'end';
  return 'none';
}

export function EdgeStylePanel({
  edges,
  selectedEdges,
  onUpdateEdges,
}: EdgeStylePanelProps) {
  // Get the first selected edge to initialize state from
  const primaryEdge = useMemo(() => {
    return selectedEdges.length > 0 ? selectedEdges[0] : edges[0];
  }, [selectedEdges, edges]);

  // Initialize state from the primary edge's current values
  const [lineStyle, setLineStyle] = useState<EdgeStyle>(() => {
    const dasharray = primaryEdge?.style?.strokeDasharray as string | undefined;
    return getLineStyleFromDasharray(dasharray);
  });

  const [flowType, setFlowType] = useState<EdgeFlowType>(() => {
    return primaryEdge?.type === 'straight' ? 'straight' : 'default';
  });

  const [arrowType, setArrowType] = useState<EdgeArrow>(() => {
    return primaryEdge ? getArrowTypeFromMarkers(primaryEdge) : 'end';
  });

  const [strokeWidth, setStrokeWidth] = useState(() => {
    return (primaryEdge?.style?.strokeWidth as number) || 2;
  });

  const targetEdges = selectedEdges.length > 0 ? selectedEdges : edges;

  const handleApplyStyle = useCallback(
    (updates: Partial<Edge>[]) => {
      onUpdateEdges(updates);
    },
    [onUpdateEdges]
  );

  const handleLineStyleChange = (style: EdgeStyle) => {
    setLineStyle(style);
    let strokeDasharray: string | undefined;
    switch (style) {
      case 'dashed':
        strokeDasharray = '5,5';
        break;
      case 'dotted':
        strokeDasharray = '2,2';
        break;
      default:
        strokeDasharray = undefined;
    }

    const updatedEdges = targetEdges.map((edge) => ({
      ...edge,
      style: {
        ...(edge.style || {}),
        strokeDasharray,
      },
    }));
    handleApplyStyle(updatedEdges);
  };

  const handleFlowTypeChange = (type: EdgeFlowType) => {
    setFlowType(type);
    const edgeType = type === 'straight' ? 'straight' : 'default';

    const updatedEdges = targetEdges.map((edge) => ({
      ...edge,
      type: edgeType,
    }));
    handleApplyStyle(updatedEdges);
  };

  const handleArrowTypeChange = (arrow: EdgeArrow) => {
    setArrowType(arrow);

    const updatedEdges = targetEdges.map((edge) => {
      // Get the stroke color - check multiple possible locations
      const edgeStyle = edge.style as { stroke?: string; strokeWidth?: number } | undefined;
      const markerData = edge.markerEnd as { color?: string } | undefined;

      // Priority: edge.style.stroke > markerEnd.color > edge.data.color > default
      const color = edgeStyle?.stroke
        || markerData?.color
        || (edge.data as { color?: string })?.color
        || '#b1b1b7';

      const markerEnd = (arrow === 'end' || arrow === 'both')
        ? { type: MarkerType.ArrowClosed, color }
        : undefined;
      const markerStart = (arrow === 'start' || arrow === 'both')
        ? { type: MarkerType.ArrowClosed, color }
        : undefined;

      return {
        ...edge,
        markerEnd,
        markerStart,
      };
    });
    handleApplyStyle(updatedEdges);
  };

  const handleStrokeWidthChange = (width: number) => {
    setStrokeWidth(width);

    const updatedEdges = targetEdges.map((edge) => ({
      ...edge,
      style: {
        ...(edge.style || {}),
        strokeWidth: width,
      },
    }));
    handleApplyStyle(updatedEdges);
  };

  return (
    <div className="EdgeStylePanel p-4 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Edge Style</h3>
        <p className="text-xs text-gray-500">
          {selectedEdges.length > 0
            ? `${selectedEdges.length} edge${selectedEdges.length > 1 ? 's' : ''} selected`
            : 'Default style for new edges'}
        </p>
      </div>

      {/* Flow Type */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Flow Type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleFlowTypeChange('default')}
            className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${
              flowType === 'default'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <MoveDown className="w-4 h-4" />
            <span className="text-xs">Smooth (Default)</span>
          </button>
          <button
            onClick={() => handleFlowTypeChange('straight')}
            className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${
              flowType === 'straight'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Minus className="w-4 h-4" />
            <span className="text-xs">Straight</span>
          </button>
        </div>
      </div>

      {/* Line Style */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Line Style</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleLineStyleChange('solid')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
              lineStyle === 'solid'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Minus className="w-5 h-5" />
            <span className="text-xs">Solid</span>
          </button>
          <button
            onClick={() => handleLineStyleChange('dashed')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
              lineStyle === 'dashed'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" strokeDasharray="4 4" />
            </svg>
            <span className="text-xs">Dashed</span>
          </button>
          <button
            onClick={() => handleLineStyleChange('dotted')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
              lineStyle === 'dotted'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Dot className="w-5 h-5" />
            <span className="text-xs">Dotted</span>
          </button>
        </div>
      </div>

      {/* Stroke Width */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700">Stroke Width</label>
          <span className="text-xs text-gray-600">{strokeWidth}px</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={strokeWidth}
          onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Arrow Type */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Arrow Type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleArrowTypeChange('none')}
            className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${
              arrowType === 'none'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Minus className="w-4 h-4" />
            <span className="text-xs">None</span>
          </button>
          <button
            onClick={() => handleArrowTypeChange('end')}
            className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${
              arrowType === 'end'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span className="text-xs">End</span>
          </button>
          <button
            onClick={() => handleArrowTypeChange('start')}
            className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${
              arrowType === 'start'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs">Start</span>
          </button>
          <button
            onClick={() => handleArrowTypeChange('both')}
            className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${
              arrowType === 'both'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span className="text-xs">Both</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default EdgeStylePanel;
