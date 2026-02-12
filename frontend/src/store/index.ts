/**
 * Zustand Stores Index
 *
 * Central export point for all Zustand stores.
 */

export { useDiagramStore } from './diagramStore';
export type { DiagramState } from './diagramStore';

export { useEditorStore } from './editorStore';
export type { EditorState } from './editorStore';

export { useUIStore } from './uiStore';
export type { UIState } from './uiStore';

export { useWorkspaceStore } from './workspaceStore';
export type { WorkspaceState } from './workspaceStore';

export { useViewStore } from './viewStore';
export type { ViewState } from './viewStore';

export { useTemplateStore } from './templateStore';
export type { TemplateState } from './templateStore';
export { useFilteredTemplates, useTemplatesByCategory, useTemplateCategories } from './templateStore';

export { useArchitectureTemplateStore } from './architectureTemplateStore';
export { useTemplateStats, useTemplate } from './architectureTemplateStore';
