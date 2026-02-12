/**
 * C4 Preset Utilities
 *
 * Helper functions for converting C4 presets to nodes and other operations.
 */

import type { C4Preset } from './presets';
import type { Node, NodeData, NodeStyle } from '@/types';

/**
 * Convert a C4 preset to a React Flow Node
 *
 * @param preset - The C4 preset to convert
 * @param position - Position where the node should be placed
 * @param id - Optional custom ID (defaults to timestamp-based)
 * @returns React Flow Node created from preset
 */
export function presetToNode(
  preset: C4Preset,
  position: { x: number; y: number },
  id?: string
): Node {
  const nodeId = id || `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: nodeId,
    type: 'custom',
    position,
    data: {
      ...preset.data,
      id: nodeId,
      label: preset.data.label,
      htmlContent: preset.data.htmlContent || generateHTMLContent(preset),
      cssClass: preset.className,
      properties: {
        elementType: preset.elementType,
        presetId: preset.id,
        exampleTechnology: preset.exampleTechnology,
      },
    } as NodeData,
    style: { ...preset.style, width: preset.width, height: preset.height } as NodeStyle,
    className: preset.className,
    draggable: true,
    selectable: true,
    connectable: true,
  };
}

/**
 * Generate HTML content for a C4 preset
 *
 * @param preset - The C4 preset
 * @returns HTML content string
 */
function generateHTMLContent(preset: C4Preset): string {
  const { icon, name, description, exampleTechnology } = preset;

  return `
    <div class="c4-preset-content">
      <div class="c4-preset-icon">${icon}</div>
      <div class="c4-preset-label">${name}</div>
      ${description ? `<div class="c4-preset-description">${description}</div>` : ''}
      ${exampleTechnology ? `<div class="c4-preset-technology">${exampleTechnology}</div>` : ''}
    </div>
  `;
}

/**
 * Create a node from a preset at a random position
 *
 * @param preset - The C4 preset
 * @param bounds - Optional bounds for random position { xMin, xMax, yMin, yMax }
 * @returns React Flow Node
 */
export function createNodeFromPreset(
  preset: C4Preset,
  bounds?: { xMin: number; xMax: number; yMin: number; yMax: number }
): Node {
  const defaultBounds = { xMin: 100, xMax: 500, yMin: 100, yMax: 400 };
  const { xMin, xMax, yMin, yMax } = bounds || defaultBounds;

  const position = {
    x: xMin + Math.random() * (xMax - xMin),
    y: yMin + Math.random() * (yMax - yMin),
  };

  return presetToNode(preset, position);
}

/**
 * Batch create nodes from multiple presets
 *
 * @param presets - Array of C4 presets
 * @param startPosition - Starting position for first node
 * @param spacing - Spacing between nodes
 * @returns Array of React Flow Nodes
 */
export function createNodesFromPresets(
  presets: C4Preset[],
  startPosition: { x: number; y: number } = { x: 100, y: 100 },
  spacing: { x: number; y: number } = { x: 200, y: 150 }
): Node[] {
  return presets.map((preset, index) => {
    const position = {
      x: startPosition.x + (index % 3) * spacing.x,
      y: startPosition.y + Math.floor(index / 3) * spacing.y,
    };

    return presetToNode(preset, position);
  });
}

/**
 * Get preset display name for UI
 *
 * @param preset - The C4 preset
 * @returns Formatted display name
 */
export function getPresetDisplayName(preset: C4Preset): string {
  return preset.name;
}

/**
 * Get preset category label
 *
 * @param category - The category key
 * @returns Category display label
 */
export function getCategoryLabel(
  category: C4Preset['category']
): string {
  const labels: Record<C4Preset['category'], string> = {
    person: 'Person',
    system: 'Software System',
    container: 'Container',
    component: 'Component',
    infrastructure: 'Infrastructure',
  };

  return labels[category] || category;
}

/**
 * Check if preset is suitable for diagram type
 *
 * @param preset - The C4 preset
 * @param diagramType - The diagram type
 * @returns True if preset is suitable
 */
export function isPresetSuitableForDiagram(
  preset: C4Preset,
  diagramType: 'system-context' | 'container' | 'component' | 'generic'
): boolean {
  switch (diagramType) {
    case 'system-context':
      return ['person', 'system'].includes(preset.category);
    case 'container':
      return ['person', 'system', 'container', 'infrastructure'].includes(preset.category);
    case 'component':
      return true; // All presets suitable for component diagrams
    case 'generic':
      return true; // All presets suitable for generic diagrams
    default:
      return true;
  }
}

/**
 * Get recommended presets for diagram type
 *
 * @param diagramType - The diagram type
 * @param limit - Maximum number of presets to return
 * @returns Array of recommended presets
 */
export function getRecommendedPresets(
  diagramType: 'system-context' | 'container' | 'component' | 'generic',
  limit: number = 6
): C4Preset[] {
  const allPresets = C4_PRESETS; // Will be imported from presets.ts

  const suitable = allPresets.filter((preset) =>
    isPresetSuitableForDiagram(preset, diagramType)
  );

  // Return first N presets (could be enhanced with popularity/relevance)
  return suitable.slice(0, limit);
}

// Import C4_PRESETS at the bottom to avoid circular dependency
import { C4_PRESETS } from './presets';
