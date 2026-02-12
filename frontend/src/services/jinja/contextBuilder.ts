/**
 * Template Context Builder
 *
 * Helper for building rich template contexts from node data.
 */

import type { NodeData, NodeStyle } from '@/types';
import type { JinjaTemplateContext } from '@/types/jinja';

/**
 * Build template context from node data
 */
export function buildTemplateContext(
  nodeData: NodeData,
  nodeStyle?: NodeStyle
): JinjaTemplateContext {
  return {
    label: nodeData.label || '',
    description: nodeData.description,
    icon: nodeData.icon,
    image: nodeData.image,
    cssClass: nodeData.cssClass,
    cssId: nodeData.cssId,
    width: nodeData.width,
    height: nodeData.height,
    childDiagramId: nodeData.childDiagramId,
    properties: nodeData.properties || {},
    style: {
      backgroundColor: nodeStyle?.backgroundColor,
      borderColor: nodeStyle?.borderColor,
      borderWidth: nodeStyle?.borderWidth,
      borderRadius: nodeStyle?.borderRadius,
      padding: nodeStyle?.padding,
      margin: nodeStyle?.margin,
      fontSize: nodeStyle?.fontSize,
      fontFamily: nodeStyle?.fontFamily,
      color: nodeStyle?.color,
      boxShadow: nodeStyle?.boxShadow,
      ...nodeStyle
    },
    hasDescription: Boolean(nodeData.description),
    hasIcon: Boolean(nodeData.icon),
    hasImage: Boolean(nodeData.image),
    hasProperties: Boolean(nodeData.properties && Object.keys(nodeData.properties).length > 0),
  };
}

/**
 * Create sample context for template preview
 */
export function createSampleContext(): JinjaTemplateContext {
  return {
    label: 'Sample Service',
    description: 'This is a sample description',
    icon: '⚙️',
    image: undefined,
    cssClass: 'sample-class',
    cssId: 'sample-id',
    width: 200,
    height: 100,
    childDiagramId: 'child-diagram-123',
    properties: {
      version: '1.0.0',
      environment: 'production',
      port: 8080,
    },
    style: {
      backgroundColor: '#ffffff',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 8,
    },
    hasDescription: true,
    hasIcon: true,
    hasImage: false,
    hasProperties: true,
  };
}

/**
 * Create context for specific node type
 */
export function createNodeSpecificContext(
  nodeType: string,
  baseData: Partial<NodeData> = {}
): JinjaTemplateContext {
  const defaults: Record<string, Partial<NodeData>> = {
    person: {
      label: 'User',
      description: 'Application user',
      icon: '👤',
    },
    system: {
      label: 'Software System',
      description: 'Main system',
      icon: '🖥️',
    },
    container: {
      label: 'Web Application',
      description: 'React SPA',
      icon: '🌐',
    },
    component: {
      label: 'API Controller',
      description: 'REST endpoints',
      icon: '⚙️',
    },
    database: {
      label: 'Database',
      description: 'PostgreSQL',
      icon: '🗄️',
    },
    queue: {
      label: 'Message Queue',
      description: 'Event bus',
      icon: '📬',
    },
  };

  const data = { ...defaults[nodeType], ...baseData };

  return buildTemplateContext(data as NodeData);
}
