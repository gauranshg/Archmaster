/**
 * Database Node Component
 *
 * Renders a database node for diagrams.
 * Supports full custom HTML content with early return pattern.
 * Supports Jinja template rendering.
 */

import { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ArrowDownRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import type { NodeData } from '@/types';
import { renderJinjaTemplate, buildTemplateContext } from '@/services/jinja/jinjaService';

interface DatabaseNodeData extends NodeData {
  /** Database-specific metadata */
  databaseType?: 'relational' | 'document' | 'key-value' | 'graph' | 'time-series';
}

const DatabaseNode = memo(({ id, data, selected }: NodeProps<DatabaseNodeData>) => {
  const databaseType = data.databaseType || 'relational';

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
    const classes = ['database-node'];

    if (selected) classes.push('selected');
    if (data.cssClass) {
      const sanitizedClass = data.cssClass.replace(/[^a-zA-Z0-9-_]/g, '');
      classes.push(sanitizedClass);
    }

    return classes.join(' ');
  }, [selected, data.cssClass]);

  // Database-specific colors
  const getBackgroundColor = () => {
    if (selected) return '#eff6ff';
    return '#ffffff';
  };

  const getBorderColor = () => {
    if (selected) return '#3b82f6';
    return '#8b5cf6';
  };

  // If full custom HTML is provided, render that instead of default structure
  if (renderedHtml) {
    return (
      <div
        className={nodeClasses}
        data-node-id={id}
        data-node-type="database"
        data-custom-html="true"
        style={{
          border: `2px solid ${getBorderColor()}`,
          borderRadius: '12px',
          backgroundColor: getBackgroundColor(),
          boxShadow: selected
            ? '0 0 0 4px rgba(59, 130, 246, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            : '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: '140px',
          minHeight: '80px',
          padding: '14px',
          position: 'relative',
        }}
        title={data.description || data.label}
      >
        {/* Input handle (top) */}
        <Handle
          type="target"
          position={Position.Top}
          className="custom-handle !transition-transform hover:!scale-125"
          style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#8b5cf6',
            border: '3px solid #ffffff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        />

        {/* Output handle (bottom) */}
        <Handle
          type="source"
          position={Position.Bottom}
          className="custom-handle !transition-transform hover:!scale-125"
          style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#8b5cf6',
            border: '3px solid #ffffff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        />

        {/* Full custom HTML content */}
        <div
          className="node-full-content"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
          style={{
            fontSize: '14px',
            color: '#1f2937',
            lineHeight: '1.5',
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
              backgroundColor: '#8b5cf6',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
            title="Double-click to drill down"
          >
            <ArrowDownRight size={14} color="white" strokeWidth={2.5} />
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
      data-node-type="database"
      style={{
        border: `2px solid ${getBorderColor()}`,
        borderRadius: '12px',
        backgroundColor: getBackgroundColor(),
        boxShadow: selected
          ? '0 0 0 4px rgba(59, 130, 246, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          : '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        minWidth: '140px',
        minHeight: '80px',
        padding: '14px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
      title={data.description || data.label}
    >
      {/* Input handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="custom-handle !transition-transform hover:!scale-125"
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#8b5cf6',
          border: '3px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />

      {/* Database Icon */}
      <div
        className="database-icon"
        style={{
          fontSize: '32px',
          textAlign: 'center',
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
        }}
      >
        🗄️
      </div>

      {/* Label */}
      <div
        className="database-label"
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#1f2937',
          textAlign: 'center',
          wordBreak: 'break-word',
          lineHeight: '1.4',
        }}
      >
        {data.label}
      </div>

      {/* Description (if provided) */}
      {data.description && (
        <div
          className="database-description"
          style={{
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center',
            marginTop: '4px',
            lineHeight: '1.4',
          }}
        >
          {data.description}
        </div>
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
          title="Double-click to drill down"
        >
          <ArrowDownRight size={14} color="white" strokeWidth={2.5} />
        </div>
      )}

      {/* Output handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="custom-handle !transition-transform hover:!scale-125"
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#8b5cf6',
          border: '3px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />

      {/* Left handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="custom-handle !transition-transform hover:!scale-125"
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#8b5cf6',
          border: '3px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />

      {/* Right handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="custom-handle !transition-transform hover:!scale-125"
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#8b5cf6',
          border: '3px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />
    </div>
  );
});

DatabaseNode.displayName = 'DatabaseNode';

export default DatabaseNode;
