/**
 * Monaco Code Editor Component
 *
 * Provides a code editor with syntax highlighting for JSON and YAML.
 * Integrates with the diagram store for bidirectional synchronization.
 */

import { useEffect, useRef, useCallback } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useDiagramStore } from '@/store/diagramStore';
import { exportService } from '@/services/export';
import { validateJson, validateYaml } from './validators';
import { debounce } from '@/utils/debounce';
import './CodeEditor.css';

export interface CodeEditorProps {
  /** Language mode ('json' or 'yaml') */
  language: 'json' | 'yaml';

  /** Whether the editor is read-only */
  readOnly?: boolean;

  /** Callback when code changes */
  onChange?: (value: string) => void;

  /** Callback when code is saved (Ctrl+S) */
  onSave?: () => void;

  /** Additional CSS class name */
  className?: string;

  /** Editor height */
  height?: string | number;
}

/**
 * CodeEditor component with Monaco Editor integration
 */
export function CodeEditor({
  language,
  readOnly = false,
  onChange,
  onSave,
  className = '',
  height = '100%',
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const { currentDiagram, nodes, edges } = useDiagramStore();

  /**
   * Converts current diagram state to code string
   */
  const diagramToCode = useCallback((): string => {
    if (!currentDiagram) {
      return '';
    }

    // Create diagram object with current nodes and edges
    const diagram = {
      ...currentDiagram,
      nodes,
      edges,
    };

    // Export to JSON or YAML
    const result = exportService.exportDiagram(diagram, {
      format: language,
      includeMetadata: true,
      includeCustomCSS: true,
      includeLayout: true,
      pretty: true,
      indent: 2,
    });

    return result.data;
  }, [currentDiagram, nodes, edges, language]);

  /**
   * Validates code and returns error markers
   */
  const validateCode = useCallback((
    code: string,
    lang: 'json' | 'yaml'
  ): editor.IMarkerData[] => {
    const result = lang === 'json' ? validateJson(code) : validateYaml(code);

    if (!result.valid) {
      return result.errors.map((error) => ({
        severity: 'error',
        message: error.message,
        source: lang.toUpperCase(),
        startLineNumber: error.line || 1,
        endLineNumber: error.line || 1,
        startColumn: error.column || 1,
        endColumn: error.column || 100,
      }));
    }

    return [];
  }, []);

  /**
   * Updates error markers in the editor
   */
  const updateMarkers = useCallback((
    code: string,
    lang: 'json' | 'yaml',
    monaco: Monaco,
    model: editor.ITextModel
  ) => {
    const errors = validateCode(code, lang);
    const markers = errors.map((error) => ({
      ...error,
      severity: monaco.MarkerSeverity.Error,
    }));
    monaco.editor.setModelMarkers(model, 'owner', markers);
  }, [validateCode]);

  /**
   * Handles editor mount
   */
  const handleEditorDidMount = useCallback((
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.();
    });

    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      fontLigatures: true,
      lineNumbers: 'on',
      wordWrap: 'on',
      formatOnPaste: true,
      formatOnType: true,
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoIndent: 'full',
      tabSize: 2,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      rulers: [80],
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      readOnly,
    });

    // Set up JSON schema for autocomplete
    if (language === 'json') {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: 'https://custom-platform.com/schemas/diagram.json',
            fileMatch: ['*'],
            schema: getDiagramSchema(),
          },
        ],
      });
    }

    // Set up custom error diagnostics
    const model = editor.getModel();
    if (model) {
      const code = model.getValue();
      updateMarkers(code, language, monaco, model);
    }
  }, [language, readOnly, onSave, updateMarkers]);

  /**
   * Handles code changes
   */
  const handleChange = useCallback((value: string | undefined) => {
    const code = value || '';
    onChange?.(code);

    // Update validation markers (debounced)
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        const debouncedUpdate = debounce(() => {
          updateMarkers(code, language, monacoRef.current!, model);
        }, 300);
        debouncedUpdate();
      }
    }
  }, [onChange, language, updateMarkers]);

  /**
   * Update editor content when diagram changes
   */
  useEffect(() => {
    if (editorRef.current && !readOnly) {
      const code = diagramToCode();
      const model = editorRef.current.getModel();

      if (model && model.getValue() !== code) {
        // Only update if the content has actually changed
        model.setValue(code);
      }
    }
  }, [currentDiagram, nodes, edges, diagramToCode, readOnly]);

  /**
   * Update read-only state
   */
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly });
    }
  }, [readOnly]);

  // Get initial code value
  const initialValue = diagramToCode();

  return (
    <div className={`code-editor-wrapper ${className}`}>
      <Editor
        height={height}
        language={language}
        value={initialValue}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}

/**
 * JSON Schema for diagram autocomplete
 */
function getDiagramSchema(): unknown {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Diagram',
    type: 'object',
    required: ['id', 'name', 'type', 'workspaceId', 'nodes', 'edges', 'metadata'],
    properties: {
      id: {
        type: 'string',
        description: 'Unique identifier (UUID)',
        format: 'uuid',
      },
      name: {
        type: 'string',
        description: 'Diagram name',
        minLength: 1,
        maxLength: 200,
      },
      description: {
        type: 'string',
        description: 'Optional description',
      },
      type: {
        type: 'string',
        description: 'Diagram type',
        enum: ['system-context', 'container', 'component', 'code', 'generic'],
      },
      parentId: {
        type: 'string',
        description: 'Parent diagram ID for hierarchical navigation',
      },
      workspaceId: {
        type: 'string',
        description: 'Workspace this diagram belongs to',
      },
      nodes: {
        type: 'array',
        description: 'Nodes in this diagram',
        items: {
          type: 'object',
          required: ['id', 'diagramId', 'position', 'data'],
          properties: {
            id: { type: 'string' },
            diagramId: { type: 'string' },
            type: { type: 'string' },
            position: {
              type: 'object',
              properties: {
                x: { type: 'number' },
                y: { type: 'number' },
              },
            },
            data: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                htmlContent: { type: 'string' },
                cssClass: { type: 'string' },
              },
            },
            size: {
              type: 'object',
              properties: {
                width: { type: 'number' },
                height: { type: 'number' },
              },
            },
          },
        },
      },
      edges: {
        type: 'array',
        description: 'Edges between nodes',
        items: {
          type: 'object',
          required: ['id', 'diagramId', 'source', 'target'],
          properties: {
            id: { type: 'string' },
            diagramId: { type: 'string' },
            source: { type: 'string' },
            target: { type: 'string' },
            type: {
              type: 'string',
              enum: ['default', 'straight', 'step', 'smoothstep', 'bezier'],
            },
            label: { type: 'string' },
            animated: { type: 'boolean' },
            style: {
              type: 'object',
              properties: {
                stroke: { type: 'string' },
                strokeWidth: { type: 'number' },
              },
            },
          },
        },
      },
      customCSS: {
        type: 'string',
        description: 'Custom CSS for this diagram',
      },
      theme: {
        type: 'string',
        description: 'Theme name',
      },
      layout: {
        type: 'object',
        description: 'Layout configuration',
        properties: {
          type: {
            type: 'string',
            enum: ['manual', 'hierarchical', 'force-directed', 'circular'],
          },
          direction: {
            type: 'string',
            enum: ['TB', 'BT', 'LR', 'RL'],
          },
          spacing: {
            type: 'object',
            properties: {
              node: { type: 'number' },
              rank: { type: 'number' },
            },
          },
        },
      },
      styles: {
        type: 'object',
        description: 'Diagram-level styles',
        properties: {
          background: { type: 'string' },
          grid: {
            type: 'object',
            properties: {
              type: { enum: ['dots', 'lines', 'none'] },
              size: { type: 'number' },
              color: { type: 'string' },
            },
          },
          padding: { type: 'number' },
        },
      },
      metadata: {
        type: 'object',
        required: ['version', 'author', 'createdAt', 'modifiedAt'],
        properties: {
          version: { type: 'number' },
          author: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          modifiedAt: { type: 'string', format: 'date-time' },
          parentDiagramId: { type: 'string' },
          childDiagramIds: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  };
}

export default CodeEditor;
