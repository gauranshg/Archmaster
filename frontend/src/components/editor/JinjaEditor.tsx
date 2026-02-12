/**
 * Jinja Template Editor Component
 *
 * Simple Monaco-based editor for Jinja templates.
 * Supports HTML syntax highlighting with Jinja variable syntax.
 */

import { useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

export interface JinjaEditorProps {
  /** Initial Jinja template content */
  value: string;

  /** Callback when content changes */
  onChange?: (value: string) => void;

  /** Editor height */
  height?: string | number;

  /** Read-only mode */
  readOnly?: boolean;

  /** Additional CSS classes */
  className?: string;
}

export function JinjaEditor({
  value,
  onChange,
  height = '300px',
  readOnly = false,
  className = '',
}: JinjaEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = useCallback((
    editor: editor.IStandaloneCodeEditor,
    monaco: any
  ) => {
    editorRef.current = editor;

    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 13,
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
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      readOnly,
    });

    // Add custom Jinja syntax highlighting
    monaco.languages.registerCompletionItemProvider('html', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // Jinja variable suggestions
        const suggestions = [
          {
            label: '{{ variable }}',
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: '{{ ${1:variable} }}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            documentation: 'Jinja2 variable output',
          },
          {
            label: '{% if %}',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '{% if ${1:condition} %}\n  ${2:content}\n{% endif %}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            documentation: 'Jinja2 conditional statement',
          },
          {
            label: '{% for %}',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '{% for ${1:item} in ${2:items} %}\n  ${3:content}\n{% endfor %}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            documentation: 'Jinja2 loop statement',
          },
          {
            label: '{# comment #}',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '{# ${1:comment} #}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            documentation: 'Jinja2 comment',
          },
        ];

        return { suggestions };
      },
    });
  }, [readOnly]);

  const handleChange = useCallback((value: string | undefined) => {
    onChange?.(value || '');
  }, [onChange]);

  return (
    <div className={`jinja-editor-wrapper ${className}`}>
      <Editor
        height={height}
        language="html"
        value={value}
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
