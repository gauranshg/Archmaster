/**
 * Enhanced Edge Component
 *
 * Supports curved edges, animations, custom arrowheads, and HTML labels.
 */

import { useCallback, memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getMarkerEnd,
  Position,
} from 'reactflow';
import { createPortal } from 'react-dom';
import DOMPurify from 'dompurify';

type EdgeType = 'straight' | 'step' | 'smoothstep' | 'bezier';

interface EnhancedEdgeData {
  label?: string;
  labelHtml?: string;
  animated?: boolean;
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  labelBgStyle?: React.CSSProperties;
  markerEnd?: string;
  markerStart?: string;
}

/**
 * Enhanced edge component with support for:
 * - Curved edges (bezier)
 * - Animated edges
 * - Custom arrowheads
 * - HTML labels
 */
export const EnhancedEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    style = {},
    markerEnd,
    markerStart,
    selected,
  }: EdgeProps<EnhancedEdgeData>) => {
    const edgeData = data || {};

    // Get bezier path for smooth curves
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    // Get marker end (arrowhead)
    const markerEndId = getMarkerEnd(markerEnd);

    // Render HTML label if provided
    const renderLabel = useCallback(() => {
      if (!edgeData.label && !edgeData.labelHtml) {
        return null;
      }

      const labelContent = edgeData.labelHtml
        ? DOMPurify.sanitize(edgeData.labelHtml)
        : edgeData.label || '';

      return (
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            fontSize: 12,
            fontWeight: 500,
            pointerEvents: 'all',
            ...edgeData.labelStyle,
          }}
          className="nodrag nopan"
        >
          {edgeData.labelHtml ? (
            <div
              dangerouslySetInnerHTML={{ __html: labelContent }}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                ...edgeData.labelBgStyle,
              }}
            />
          ) : (
            <div
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                color: '#475569',
                ...edgeData.labelBgStyle,
              }}
            >
              {labelContent}
            </div>
          )}
        </div>
      );
    }, [edgeData.label, edgeData.labelHtml, edgeData.labelStyle, edgeData.labelBgStyle, labelX, labelY]);

    return (
      <>
        {/* Edge path */}
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEndId}
          markerStart={markerStart}
          style={{
            ...style,
            ...(edgeData.animated && {
              strokeDasharray: '5',
              animation: 'dash 1s linear infinite',
            }),
            ...(selected && {
              stroke: '#3b82f6',
              strokeWidth: 2,
            }),
          }}
        />

        {/* Edge label */}
        {edgeData.label || edgeData.labelHtml ? (
          <EdgeLabelRenderer>
            {renderLabel()}
          </EdgeLabelRenderer>
        ) : null}

        {/* Add keyframes for animation */}
        <style>{`
          @keyframes dash {
            to {
              stroke-dashoffset: -10;
            }
          }
        `}</style>
      </>
    );
  }
);

EnhancedEdge.displayName = 'EnhancedEdge';

/**
 * Edge type registry
 */
export const edgeTypes = {
  enhanced: EnhancedEdge,
};

export default EnhancedEdge;
