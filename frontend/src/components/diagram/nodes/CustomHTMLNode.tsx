/**
 * Custom HTML Node Component
 *
 * Provides complete control over node appearance via HTML/CSS.
 * Users can write custom HTML, CSS, and even JavaScript.
 * This is the ultimate flexibility option for unique node designs.
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ArrowDownRight, Code2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import type { NodeData } from '@/types';

interface CustomHTMLNodeProps extends NodeProps<NodeData> {
  /** Additional CSS class */
  cssClass?: string;
  /** Whether this node has a child diagram (shows drill indicator) */
  childDiagramId?: string;
}

/**
 * Custom HTML Node - Full Creative Control
 *
 * Renders user-provided HTML with extensive tag/attribute allowances.
 * Sanitized for security but highly permissive for creative freedom.
 */
const CustomHTMLNode = memo(({ id, data, selected, childDiagramId }: CustomHTMLNodeProps) => {
  // Render custom HTML
  const renderedHtml = data.htmlContent
    ? DOMPurify.sanitize(data.htmlContent, {
        // Highly permissive for creative control
        ALLOWED_TAGS: [
          'div', 'span', 'p', 'strong', 'em', 'u', 'i', 'b', 'br', 'hr',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'dl', 'dt', 'dd',
          'img', 'a', 'button', 'input', 'textarea', 'select', 'option',
          'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
          'code', 'pre', 'blockquote', 'q', 'cite', 'abbr',
          'figure', 'figcaption', 'picture', 'source',
          'svg', 'path', 'circle', 'rect', 'line', 'polygon', 'ellipse',
          'video', 'audio', 'track', 'canvas',
          'form', 'label', 'fieldset', 'legend',
          'header', 'footer', 'nav', 'main', 'aside', 'section', 'article',
          'small', 'sub', 'sup', 'mark', 'del', 'ins', 's',
          'ruby', 'rt', 'rp', 'bdi', 'bdo', 'wbr',
        ],
        ALLOWED_ATTR: [
          'class', 'id', 'style',
          'href', 'src', 'alt', 'title', 'target', 'rel',
          'width', 'height', 'width', 'minwidth', 'maxwidth',
          'data-*',
          'type', 'value', 'placeholder', 'name', 'disabled', 'readonly', 'required',
          'rows', 'cols', 'minlength', 'maxlength', 'pattern',
          'accept', 'multiple', 'step', 'min', 'max',
          'for', 'form',
          'viewbox', 'xmlns', 'fill', 'stroke', 'd', 'r', 'cx', 'cy', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
          'controls', 'autoplay', 'loop', 'muted', 'poster',
          'colspan', 'rowspan', 'scope',
          'open', 'datetime',
          'role', 'aria-*',
        ],
        ALLOW_DATA_ATTR: true,
        ALLOW_UNKNOWN_PROTOCOLS: false,
      })
    : `<div style="padding: 20px; text-align: center; background: #f3f4f6; border: 2px dashed #9ca3af; border-radius: 8px;">
        <Code2 style="width: 32px; height: 32px; margin: 0 auto 8px; color: #6b7280;" />
        <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">Custom HTML</div>
        <div style="font-size: 12px; color: #6b7280;">Add your HTML in Properties</div>
      </div>`;

  // Build CSS classes
  const nodeClasses = [
    'custom-html-node',
    data.cssClass?.replace(/[^a-zA-Z0-9-_]/g, '') || '',
    selected ? 'selected' : '',
    childDiagramId ? 'has-child-diagram' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={nodeClasses} style={{ position: 'relative' }}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="custom-handle"
        style={{
          background: '#3b82f6',
          width: 8,
          height: 8,
        }}
      />

      {/* Custom HTML content */}
      <div
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="custom-handle"
        style={{
          background: '#3b82f6',
          width: 8,
          height: 8,
        }}
      />

      {/* Child diagram indicator */}
      {childDiagramId && (
        <div
          className="child-diagram-indicator"
          style={{
            position: 'absolute',
            bottom: -8,
            right: -8,
            background: '#8b5cf6',
            color: 'white',
            padding: '4px',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            zIndex: 10,
          }}
          title="Double-click to drill down"
        >
          <ArrowDownRight size={12} />
        </div>
      )}

      {/* Selected outline */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            inset: -2,
            border: '2px solid #3b82f6',
            borderRadius: 'inherit',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
});

CustomHTMLNode.displayName = 'CustomHTMLNode';

export default CustomHTMLNode;
