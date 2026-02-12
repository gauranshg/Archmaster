/**
 * Service Node Component
 *
 * Renders a service/microservice node for diagrams.
 * Supports full custom HTML content with early return pattern.
 * Supports Jinja template rendering.
 */

import { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ArrowDownRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import type { NodeData } from '@/types';
import { renderJinjaTemplate, buildTemplateContext } from '@/services/jinja/jinjaService';

interface ServiceNodeData extends NodeData {
  /** Service-specific metadata */
  serviceType?: 'rest' | 'graphql' | 'grpc' | 'websocket' | 'microservice';
}

const ServiceNode = memo(({ id, data, selected }: NodeProps<ServiceNodeData>) => {
  const serviceType = data.serviceType || 'rest';

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
    const classes = ['service-node'];

    if (selected) classes.push('selected');
    if (data.cssClass) {
      const sanitizedClass = data.cssClass.replace(/[^a-zA-Z0-9-_]/g, '');
      classes.push(sanitizedClass);
    }

    return classes.join(' ');
  }, [selected, data.cssClass]);

  // Service-specific colors
  const getBackgroundColor = () => {
    if (selected) return '#eff6ff';
    return '#ffffff';
  };

  const getBorderColor = () => {
    if (selected) return '#3b82f6';
    return '#10b981';
  };

  // If full custom HTML is provided, render that instead of default structure
  if (renderedHtml) {
    return (
      <div
        className={nodeClasses}
        data-node-id={id}
        data-node-type="service"
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
            backgroundColor: '#10b981',
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
            backgroundColor: '#10b981',
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
      data-node-type="service"
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
          backgroundColor: '#10b981',
          border: '3px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />

      {/* Service Icon */}
      <div
        className="service-icon"
        style={{
          fontSize: '32px',
          textAlign: 'center',
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
        }}
      >
        ⚙️
      </div>

      {/* Label */}
      <div
        className="service-label"
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

      {/* Service type badge */}
      <div
        className="service-type-badge"
        style={{
          fontSize: '10px',
          fontWeight: '500',
          color: '#10b981',
          backgroundColor: '#ecfdf5',
          padding: '2px 8px',
          borderRadius: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {serviceType}
      </div>

      {/* Description (if provided) */}
      {data.description && (
        <div
          className="service-description"
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
          backgroundColor: '#10b981',
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
          backgroundColor: '#10b981',
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
          backgroundColor: '#10b981',
          border: '3px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />
    </div>
  );
});

ServiceNode.displayName = 'ServiceNode';

export default ServiceNode;
