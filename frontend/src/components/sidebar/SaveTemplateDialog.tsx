/**
 * Save Template Dialog Component
 *
 * Modal dialog for saving selected nodes as reusable templates.
 * Users can name, describe, and categorize their templates.
 */

import { useState, useEffect } from 'react';
import { X, Loader2, Check, Image } from 'lucide-react';
import { useTemplateStore } from '@/store/templateStore';
import { nodeToTemplate, generateTemplateId, validateTemplate, suggestTemplateCategory } from '@/services/templates/templateUtils';
import { generateThumbnailFromElement } from '@/services/templates/thumbnailGenerator';
import type { Node } from 'reactflow';
import type { Template, TemplateCategory } from '@/types';
import clsx from 'clsx';

/**
 * Save Template Dialog Props
 */
interface SaveTemplateDialogProps {
  /** Nodes to save as template */
  nodes: Node[];

  /** Whether dialog is open */
  isOpen: boolean;

  /** Callback when dialog is closed */
  onClose: () => void;

  /** Callback when template is saved */
  onSave?: (template: Template) => void;

  /** Author name for template */
  author?: string;
}

/**
 * Template category options
 */
const CATEGORIES: { value: TemplateCategory; label: string; icon: string }[] = [
  { value: 'database', label: 'Database', icon: '🗄️' },
  { value: 'service', label: 'Service', icon: '⚙️' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
  { value: 'external', label: 'External', icon: '🔗' },
  { value: 'component', label: 'Component', icon: '🧩' },
  { value: 'container', label: 'Container', icon: '📦' },
  { value: 'custom', label: 'Custom', icon: '✨' },
];

/**
 * Save Template Dialog Component
 */
export function SaveTemplateDialog({
  nodes,
  isOpen,
  onClose,
  onSave,
  author = 'User',
}: SaveTemplateDialogProps) {
  const { createTemplate } = useTemplateStore();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('custom');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | undefined>();
  const [previewNode, setPreviewNode] = useState<Node | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState({
    name: '',
    category: 'custom' as TemplateCategory,
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen && nodes.length > 0) {
      // Auto-suggest name and category from first node
      const firstNode = nodes[0];
      const suggestedName = (firstNode.data as { label?: string })?.label || 'Untitled Template';
      const suggestedCategory = suggestTemplateCategory(firstNode) as TemplateCategory;

      setName(suggestedName);
      setCategory(suggestedCategory);
      setDescription(`Template created from ${nodes.length} node${nodes.length > 1 ? 's' : ''}`);
      setTags([]);
      setTagInput('');
      setThumbnail(undefined);
      setError(null);

      setPreviewNode(firstNode);
      setSuggestions({
        name: suggestedName,
        category: suggestedCategory,
      });
    }
  }, [isOpen, nodes]);

  // Generate thumbnail on mount
  useEffect(() => {
    if (isOpen && previewNode && !thumbnail) {
      generateThumbnail();
    }
  }, [isOpen, previewNode]);

  // Generate thumbnail
  const generateThumbnail = async () => {
    if (!previewNode) return;

    setIsGeneratingThumbnail(true);
    try {
      // Create a temporary element to render the node
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.top = '-9999px';
      element.style.left = '-9999px';
      element.style.width = '200px';
      element.style.padding = '16px';
      element.style.backgroundColor = (previewNode.style as any)?.backgroundColor || '#ffffff';
      element.style.border = '1px solid #e5e7eb';
      element.style.borderRadius = '12px';

      const content = document.createElement('div');
      content.innerHTML = (previewNode.data as any).htmlContent || (previewNode.data as any).label || '';
      element.appendChild(content);

      document.body.appendChild(element);

      const generatedThumbnail = await generateThumbnailFromElement(element, {
        width: 200,
        height: 150,
      });

      document.body.removeChild(element);
      setThumbnail(generatedThumbnail);
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      // Continue without thumbnail
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  // Add tag
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Handle tag input key press
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!previewNode) return;

    // Validate
    const templateData = {
      name,
      description,
      category,
      author,
      isPublic: false,
      tags,
      data: previewNode.data,
      style: previewNode.style || {},
      className: previewNode.className,
      thumbnail,
    };

    const validation = validateTemplate(templateData);
    if (!validation.valid) {
      setError(validation.error || 'Invalid template data');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Create template
      await createTemplate(templateData);

      // Call success callback
      onSave?.({
        ...templateData,
        id: generateTemplateId(name),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Template);

      // Close dialog
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save template';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Save as Template</h2>
            <p className="text-sm text-gray-500 mt-1">
              Create a reusable template from {nodes.length} node{nodes.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSaving}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Template name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Template"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSaving}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isSaving}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={clsx(
                    'flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border-2 transition-all',
                    category === cat.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  disabled={isSaving}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                    disabled={isSaving}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isSaving}
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                disabled={isSaving || !tagInput.trim()}
              >
                Add
              </button>
            </div>
          </div>

          {/* Thumbnail preview */}
          {thumbnail && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preview
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <img
                  src={thumbnail}
                  alt="Template thumbnail"
                  className="w-24 h-18 object-cover rounded-lg border border-gray-200"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{name}</div>
                  <div className="text-xs text-gray-500 mt-1">{CATEGORIES.find(c => c.value === category)?.label}</div>
                </div>
                {isGeneratingThumbnail && (
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                )}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-500 mt-0.5">
                <X size={16} />
              </div>
              <div className="text-sm text-red-700 flex-1">{error}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all',
              isSaving || !name.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            )}
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={18} />
                Save Template
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveTemplateDialog;
