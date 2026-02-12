/**
 * Custom Node Component
 *
 * Renders custom HTML nodes for the diagram canvas.
 * TEMPLATE-FIRST APPROACH:
 * - Uses templateId to get template and Jinja template
 * - Merges template defaults with node properties
 * - Renders with zero wrapper styling (fully transparent)
 *
 * LEGACY: Supports direct htmlContent and jinjaTemplate for backward compatibility.
 */

import { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ArrowDownRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import type { NodeData, NodeStyle } from '@/types';
import { renderJinjaTemplate, buildTemplateContext } from '@/services/jinja/jinjaService';
import { useTemplateStore } from '@/store/templateStore';
import { mergeTemplateValues } from '@/services/templates/templateVariables';

interface CustomNodeProps extends NodeProps<NodeData> {
  /** Additional CSS class */
  cssClass?: string;
  /** Whether this node has a child diagram (shows drill indicator) */
  childDiagramId?: string;
}

/**
 * Custom HTML node component with safe rendering
 * TEMPLATE-FIRST: Always uses template-based rendering with transparent wrapper
 */
const CustomNode = memo(({ id, data, selected, childDiagramId }: CustomNodeProps) => {
  const { getTemplateById } = useTemplateStore();

  // ========== TEMPLATE-FIRST RENDERING ==========
  const renderedHtml = useMemo(() => {
    // 1. Try template-based rendering first (new approach)
    if (data.templateId) {
      const template = getTemplateById(data.templateId);
      if (template?.jinjaTemplate) {
        // Merge template defaults with node properties
        const mergedValues = mergeTemplateValues(
          template.defaultValues || {},
          (data.properties || {}) as Record<string, any>
        );

        // Build enhanced context with merged values
        const context = {
          ...buildTemplateContext(data),
          ...mergedValues
        };

        const result = renderJinjaTemplate(template.jinjaTemplate, context);
        if (result.success) {
          return result.html;
        } else {
          console.error('Template rendering failed:', result.error);
        }
      }
    }

    // 2. Fallback to direct Jinja template (legacy)
    if (data.jinjaTemplate) {
      const context = buildTemplateContext(data);
      const result = renderJinjaTemplate(data.jinjaTemplate, context);
      if (result.success) {
        return result.html;
      } else {
        console.error('Jinja template rendering failed:', result.error);
      }
    }

    // 3. Fallback to static HTML (legacy)
    if (data.htmlContent) {
      return DOMPurify.sanitize(data.htmlContent, {
        ALLOWED_TAGS: ['div', 'span', 'p', 'strong', 'em', 'u', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'img', 'a', 'code', 'pre'],
        ALLOWED_ATTR: ['class', 'style', 'href', 'src', 'alt', 'title', 'id'],
      });
    }

    return null;
  }, [data.templateId, data.properties, data.jinjaTemplate, data.htmlContent, data, getTemplateById]);

  // Build CSS classes
  const nodeClasses = useMemo(() => {
    const classes = ['custom-node'];

    // Add custom CSS class from node data
    if (data.cssClass) {
      // Sanitize class name to prevent injection
      const sanitizedClass = data.cssClass.replace(/[^a-zA-Z0-9-_]/g, '');
      classes.push(sanitizedClass);
    }

    if (selected) classes.push('selected');
    if (data.icon) classes.push('has-icon');
    if (childDiagramId) classes.push('has-child-diagram');
    return classes.join(' ');
  }, [data.cssClass, selected, data.icon, childDiagramId]);

  // Build CSS ID (sanitized)
  const nodeId = useMemo(() => {
    if (!data.cssId) return undefined;
    // Sanitize ID to prevent injection
    return data.cssId.replace(/[^a-zA-Z0-9-_]/g, '');
  }, [data.cssId]);

  return (
    <div
      id={nodeId}
      className={nodeClasses}
      data-node-id={id}
      data-node-type="custom"
      data-custom-html={renderedHtml ? 'true' : 'false'}
      style={{
        // TEMPLATE-FIRST: Always transparent wrapper (all styling in template)
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: '0',
        minWidth: 'auto',
        minHeight: 'auto',
        position: 'relative',
        cursor: childDiagramId ? 'pointer' : 'default',
      }}
      title={childDiagramId ? 'Double-click to view child diagram' : data.label}
    >
      {/* Input handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="custom-handle !transition-transform hover:!scale-125"
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#3b82f6',
          border: '3px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />

      {/* Drill-down indicator (shown when node has a child diagram) */}
      {childDiagramId && (
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

      {/* Icon section */}
      {data.icon && (
        <div
          className="node-icon"
          style={{
            fontSize: '28px',
            marginBottom: renderedHtml ? '10px' : '0',
            textAlign: 'center',
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
          }}
        >
          {data.icon}
        </div>
      )}

      {/* Custom HTML content */}
      {renderedHtml && (
        <div
          className="node-content"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
          style={{
            fontSize: '14px',
            color: '#1f2937',
            textAlign: 'center',
            wordBreak: 'break-word',
            lineHeight: '1.5',
          }}
        />
      )}

      {/* Label (fallback if no HTML content) */}
      {!renderedHtml && data.label && (
        <div
          className="node-label"
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937',
            textAlign: 'center',
            letterSpacing: '-0.01em',
          }}
        >
          {data.label}
        </div>
      )}

      {/* Description */}
      {data.description && (
        <div
          className="node-description"
          style={{
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center',
            marginTop: '6px',
            lineHeight: '1.4',
          }}
        >
          {data.description}
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
          backgroundColor: '#3b82f6',
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
          backgroundColor: '#3b82f6',
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
          backgroundColor: '#3b82f6',
          border: '3px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
