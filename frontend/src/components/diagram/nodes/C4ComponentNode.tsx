/**
 * C4 Component Node Component
 *
 * Renders a Component node for C4 model diagrams following official C4 notation.
 * - Modular parts of a container
 * - Simpler representation than containers
 * - Shows technology/implementation details
 * - Can show responsibilities
 * - Supports Jinja template rendering
 *
 * @see https://c4model.com/
 */

import { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Package, ArrowDownRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import type { NodeData } from '@/types';
import type { C4ElementMetadata } from '@/types/c4';
import { renderJinjaTemplate, buildTemplateContext } from '@/services/jinja/jinjaService';

interface C4ComponentNodeData extends NodeData {
  /** C4-specific metadata */
  c4Metadata?: C4ElementMetadata;
}

const C4ComponentNode = memo(({ id, data, selected }: NodeProps<C4ComponentNodeData>) => {
  const c4Metadata = data.c4Metadata;
  const description = c4Metadata?.description || data.description;
  const technology = c4Metadata?.technology;
  const responsibilities = c4Metadata?.responsibilities;

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
    const classes = ['c4-component-node'];

    if (selected) classes.push('selected');

    return classes.join(' ');
  }, [selected]);

  // C4 Component specific colors
  const getBackgroundColor = () => {
    return '#ffffff';
  };

  const getBorderColor = () => {
    if (selected) return '#3b82f6';
    return '#7c3aed';
  };

  // If full custom HTML is provided, render that instead of default structure
  if (renderedHtml) {
    return (
      <div
        className={nodeClasses}
        data-node-id={id}
        data-c4-element-type="component"
        data-custom-html="true"
        style={{
          border: `2px solid ${getBorderColor()}`,
          borderRadius: '6px',
          backgroundColor: getBackgroundColor(),
          boxShadow: selected
            ? '0 0 0 4px rgba(59, 130, 246, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            : '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: '130px',
          minHeight: '80px',
          padding: '12px 16px',
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
            backgroundColor: '#7c3aed',
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
            backgroundColor: '#7c3aed',
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
      data-c4-element-type="component"
      style={{
        border: `2px solid ${getBorderColor()}`,
        borderRadius: '6px',
        backgroundColor: getBackgroundColor(),
        boxShadow: selected
          ? '0 0 0 4px rgba(59, 130, 246, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          : '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        minWidth: '130px',
        minHeight: '80px',
        padding: '12px 16px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
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
          backgroundColor: '#7c3aed',
          border: '2px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />

      {/* Component Icon */}
      <div
        className="c4-component-icon"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          backgroundColor: '#ede9fe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#7c3aed',
        }}
      >
        <Package size={18} strokeWidth={2} />
      </div>

      {/* Label */}
      <div
        className="c4-node-label"
        style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#1e293b',
          textAlign: 'center',
          wordBreak: 'break-word',
          lineHeight: '1.4',
        }}
      >
        {data.label}
      </div>

      {/* Technology (if provided) */}
      {technology && (
        <div
          className="c4-technology"
          style={{
            fontSize: '10px',
            color: '#7c3aed',
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          {technology}
        </div>
      )}

      {/* Responsibilities (if provided) */}
      {responsibilities && responsibilities.length > 0 && (
        <div
          className="c4-responsibilities"
          style={{
            fontSize: '10px',
            color: '#64748b',
            textAlign: 'center',
            maxWidth: '160px',
            lineHeight: '1.3',
          }}
        >
          {responsibilities.slice(0, 2).join(' | ')}
          {responsibilities.length > 2 && '...'}
        </div>
      )}

      {/* Custom HTML content (if provided) */}
      {renderedHtml && (
        <div
          className="node-content"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
          style={{
            fontSize: '11px',
            color: '#475569',
            textAlign: 'center',
          }}
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
          backgroundColor: '#7c3aed',
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
          backgroundColor: '#7c3aed',
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
          backgroundColor: '#7c3aed',
          border: '2px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />
    </div>
  );
});

C4ComponentNode.displayName = 'C4ComponentNode';

export default C4ComponentNode;
