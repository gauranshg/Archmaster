/**
 * Custom Edge Component
 *
 * Renders custom edges with labels, styling options, and interactive features.
 * Supports solid, dashed, and dotted styles with arrowheads.
 */

import { memo, useState, useMemo } from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  getMarkerEnd,
} from 'reactflow';
import { X } from 'lucide-react';
import type { EdgeData } from '@/types';

interface CustomEdgeProps extends EdgeProps<EdgeData> {
  /** Edge style type */
  edgeStyle?: 'solid' | 'dashed' | 'dotted';
}

/**
 * Custom edge component with label and delete button
 */
const CustomEdge = memo(({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
  style,
  edgeStyle = 'solid',
}: CustomEdgeProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate bezier path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Get marker end
  const markerEndUrl = getMarkerEnd(markerEnd);

  // Calculate stroke style
  const strokeDasharray = useMemo(() => {
    switch (edgeStyle) {
      case 'dashed':
        return '5,5';
      case 'dotted':
        return '2,2';
      default:
        return undefined;
    }
  }, [edgeStyle]);

  // Handle edge deletion
  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    // This will be handled by the parent component's onEdgesChange
    const deleteEvent = new CustomEvent('deleteEdge', { detail: { id } });
    window.dispatchEvent(deleteEvent);
  };

  return (
    <>
      {/* Edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEndUrl}
        style={{
          stroke: selected ? '#3b82f6' : '#b1b1b7',
          strokeWidth: selected ? 3 : 2,
          strokeDasharray,
          ...style,
        }}
      />

      {/* Edge label */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#374151',
              border: selected ? '2px solid #3b82f6' : '1px solid #d1d5db',
              pointerEvents: 'all',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            className="edge-label"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {data.label}

            {/* Delete button on hover */}
            {isHovered && (
              <button
                onClick={handleDelete}
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
                title="Delete edge"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';

export default CustomEdge;
