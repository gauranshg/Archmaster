/**
 * C4 Queue Node Component
 *
 * Renders a Queue/Messaging node for C4 model diagrams following official C4 notation.
 * - Message queues, event streams, pub/sub systems
 * - Distinct styling to differentiate from other elements
 * - Shows technology/protocol
 * - Shows description on hover
 * - Supports Jinja template rendering
 *
 * @see https://c4model.com/
 */

import { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ArrowDownRight, MessageSquare } from 'lucide-react';
import DOMPurify from 'dompurify';
import type { NodeData } from '@/types';
import type { C4ElementMetadata } from '@/types/c4';
import { renderJinjaTemplate, buildTemplateContext } from '@/services/jinja/jinjaService';

interface C4QueueNodeData extends NodeData {
  /** C4-specific metadata */
  c4Metadata?: C4ElementMetadata;
}

const C4QueueNode = memo(({ id, data, selected }: NodeProps<C4QueueNodeData>) => {
  const c4Metadata = data.c4Metadata;
  const isExternal = c4Metadata?.isExternal ?? false;
  const description = c4Metadata?.description || data.description;
  const technology = c4Metadata?.technology;

  // Try Jinja template first
  const jinjaRenderedHtml = useMemo(() => {
    if (!data.jinjaTemplate) return null;

    const context = buildTemplateContext(data);
    const result = renderJinjaTemplate(data.jinjaTemplate, context);

    if (!result.success) {
      console.error('Jinja template rendering failed:', result.error);
      return null;
    }

    return result.html;
  }, [data.jinjaTemplate, data]);

  // Fallback to static HTML content
  const sanitizedHtml = useMemo(() => {
    if (!data.htmlContent) return null;
    return DOMPurify.sanitize(data.htmlContent, {
      ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'br', 'hr', 'small', 'ul', 'ol', 'li', 'img', 'a', 'b', 'i', 'code', 'pre', 'blockquote', 'table', 'tr', 'td', 'th', 'thead', 'tbody'],
      ALLOWED_ATTR: ['class', 'style', 'title', 'href', 'src', 'alt', 'target', 'rel', 'colspan', 'rowspan'],
    });
  }, [data.htmlContent]);

  // Use Jinja-rendered HTML or fallback to static HTML
  const renderedHtml = jinjaRenderedHtml || sanitizedHtml;

  // Build CSS classes
  const nodeClasses = useMemo(() => {
    const classes = ['c4-queue-node'];

    if (selected) classes.push('selected');
    if (isExternal) classes.push('external');

    return classes.join(' ');
  }, [selected, isExternal]);

  // C4 Queue specific colors
  const getBackgroundColor = () => {
    if (isExternal) return '#f8fafc';
    return '#fef2f2';
  };

  const getBorderColor = () => {
    if (selected) return '#3b82f6';
    if (isExternal) return '#94a3b8';
    return '#dc2626';
  };

  const getBorderWidth = () => {
    if (selected) return 2;
    return 2;
  };

  const getBorderStyle = () => {
    if (isExternal) return 'dashed';
    return 'solid';
  };

  // If full custom HTML is provided, render that instead of default structure
  if (renderedHtml) {
    return (
      <div
        className={nodeClasses}
        data-node-id={id}
        data-c4-element-type="queue"
        data-custom-html="true"
        style={{
          border: `${getBorderWidth()}px ${getBorderStyle()} ${getBorderColor()}`,
          borderRadius: '8px',
          backgroundColor: getBackgroundColor(),
          boxShadow: selected
            ? '0 0 0 4px rgba(59, 130, 246, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            : '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: '140px',
          minHeight: '100px',
          padding: '14px 18px',
          position: 'relative',
        }}
        title={description || data.label}
      >
        {/* Input handle (top) */}
        <Handle
          type="target"
          position={Position.Top}
          className="c4-handle"
          style={{
            width: '10px',
            height: '10px',
            backgroundColor: '#dc2626',
            border: '2px solid #ffffff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        />

        {/* Output handle (bottom) */}
        <Handle
          type="source"
          position={Position.Bottom}
          className="c4-handle"
          style={{
            width: '10px',
            height: '10px',
            backgroundColor: '#dc2626',
            border: '2px solid #ffffff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        />

        {/* Full custom HTML content */}
        <div
          className="node-full-content"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
          style={{
            fontSize: '13px',
            color: '#1e293b',
            lineHeight: '1.4',
          }}
        />

        {/* External indicator */}
        {isExternal && (
          <div
            className="external-indicator"
            style={{
              position: 'absolute',
              top: '-6px',
              left: '-6px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
            title="External element"
          />
        )}

        {/* Drill-down indicator */}
        {data.childDiagramId && (
          <div
            className="drill-down-indicator"
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
            title="Double-click to drill down"
          >
            <ArrowDownRight size={14} strokeWidth={2.5} />
          </div>
        )}
      </div>
    );
  }

  // Default rendering when no custom HTML provided
  return (
    <div
      className={nodeClasses}
      data-node-id={id}
      data-c4-element-type="queue"
      style={{
        border: `${getBorderWidth()}px ${getBorderStyle()} ${getBorderColor()}`,
        borderRadius: '8px',
        backgroundColor: getBackgroundColor(),
        boxShadow: selected
          ? '0 0 0 4px rgba(59, 130, 246, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          : '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        minWidth: '140px',
        minHeight: '100px',
        padding: '14px 18px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
      }}
      title={description || data.label}
    >
      {/* Input handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="c4-handle"
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: '#dc2626',
          border: '2px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />

      {/* Queue Icon - stacked message representation */}
      <div
        className="c4-queue-icon"
        style={{
          position: 'relative',
          width: '44px',
          height: '44px',
          backgroundColor: isExternal ? '#e2e8f0' : '#fee2e2',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isExternal ? '#64748b' : '#dc2626',
        }}
      >
        <MessageSquare size={24} strokeWidth={2} />
        {/* Small indicator dots for queued messages */}
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isExternal ? '#64748b' : '#dc2626',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '10px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isExternal ? '#94a3b8' : '#f87171',
          }}
        />
      </div>

      {/* Label */}
      <div
        className="c4-node-label"
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#1e293b',
          textAlign: 'center',
          wordBreak: 'break-word',
          lineHeight: '1.4',
        }}
      >
        {data.label}
      </div>

      {/* Technology - prominently shown for queues */}
      {technology && (
        <div
          className="c4-technology"
          style={{
            fontSize: '12px',
            fontWeight: '500',
            color: '#dc2626',
            textAlign: 'center',
            padding: '2px 8px',
            backgroundColor: isExternal ? '#e2e8f0' : '#fee2e2',
            borderRadius: '4px',
          }}
        >
          {technology}
        </div>
      )}

      {/* Custom HTML content (if provided) */}
      {renderedHtml && (
        <div
          className="node-content"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
          style={{
            fontSize: '12px',
            color: '#475569',
            textAlign: 'center',
          }}
        />
      )}

      {/* External indicator */}
      {isExternal && (
        <div
          className="external-indicator"
          style={{
            position: 'absolute',
            top: '-6px',
            left: '-6px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#f59e0b',
            border: '2px solid #ffffff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          title="External element"
        />
      )}

      {/* Drill-down indicator */}
      {data.childDiagramId && (
        <div
          className="drill-down-indicator"
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#8b5cf6',
            border: '2px solid #ffffff',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
          title="Double-click to view child diagram"
        >
          <ArrowDownRight size={14} color="white" strokeWidth={2.5} />
        </div>
      )}

      {/* Output handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="c4-handle"
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: '#dc2626',
          border: '2px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />

      {/* Left handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="c4-handle"
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: '#dc2626',
          border: '2px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />

      {/* Right handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="c4-handle"
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: '#dc2626',
          border: '2px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />
    </div>
  );
});

C4QueueNode.displayName = 'C4QueueNode';

export default C4QueueNode;
