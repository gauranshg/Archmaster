/**
 * Thumbnail Generator
 *
 * Generates template thumbnails using html-to-image.
 * Thumbnails are used in the template library for preview.
 */

import { toPng } from 'html-to-image';
import type { Template } from '@/types';
import { createThumbnailPlaceholder } from './templateUtils';

/**
 * Generate a thumbnail from a DOM element
 *
 * @param element - DOM element to capture
 * @param options - Generation options
 * @returns Promise resolving to base64 data URL
 */
export async function generateThumbnailFromElement(
  element: HTMLElement,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    backgroundColor?: string;
  } = {}
): Promise<string> {
  const {
    width = 200,
    height = 150,
    quality = 0.9,
    backgroundColor = '#ffffff',
  } = options;

  try {
    // Ensure element has dimensions
    if (element.offsetWidth === 0 || element.offsetHeight === 0) {
      console.warn('Element has no dimensions, using placeholder');
      throw new Error('Element has no dimensions');
    }

    const dataUrl = await toPng(element, {
      width,
      height,
      quality,
      backgroundColor,
      pixelRatio: 2, // Retina quality
      cacheBust: true,
      style: {
        margin: '0',
        padding: '10px',
        transform: 'scale(1)',
        transformOrigin: 'top left',
      },
    });

    return dataUrl;
  } catch (error) {
    console.error('Failed to generate thumbnail:', error);
    throw error;
  }
}

/**
 * Generate a thumbnail from a template
 *
 * @param template - Template to generate thumbnail for
 * @param container - Optional container element to render in
 * @returns Promise resolving to base64 data URL
 */
export async function generateTemplateThumbnail(
  template: Template,
  container?: HTMLElement
): Promise<string> {
  try {
    // If container provided, render template and capture
    if (container) {
      const element = renderTemplateForThumbnail(template, container);
      const thumbnail = await generateThumbnailFromElement(element);
      cleanupTemplateForThumbnail(element);
      return thumbnail;
    }

    // Otherwise, generate placeholder
    return createThumbnailPlaceholder(template);
  } catch (error) {
    console.error('Failed to generate template thumbnail:', error);
    return createThumbnailPlaceholder(template);
  }
}

/**
 * Render a template element for thumbnail generation
 *
 * @param template - Template to render
 * @param container - Container element
 * @returns Rendered DOM element
 */
function renderTemplateForThumbnail(
  template: Template,
  container: HTMLElement
): HTMLElement {
  // Create wrapper element
  const wrapper = document.createElement('div');
  wrapper.style.position = 'absolute';
  wrapper.style.top = '-9999px';
  wrapper.style.left = '-9999px';
  wrapper.style.width = '200px';
  wrapper.style.height = '150px';
  wrapper.style.padding = '10px';
  wrapper.style.backgroundColor = template.style?.backgroundColor || '#ffffff';
  wrapper.style.border = `${template.style?.borderWidth || 1}px solid ${
    template.style?.borderColor || '#ccc'
  }`;
  wrapper.style.borderRadius = `${template.style?.borderRadius || 8}px`;
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';

  // Create content element
  const content = document.createElement('div');
  content.style.textAlign = 'center';
  content.innerHTML = template.data.htmlContent || template.data.label || '';

  wrapper.appendChild(content);
  document.body.appendChild(wrapper);

  return wrapper;
}

/**
 * Cleanup thumbnail element
 *
 * @param element - Element to remove
 */
function cleanupTemplateForThumbnail(element: HTMLElement): void {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/**
 * Generate thumbnail batch for multiple templates
 *
 * @param templates - Templates to generate thumbnails for
 * @param onProgress - Progress callback
 * @returns Promise resolving when all thumbnails are generated
 */
export async function generateTemplateThumbnails(
  templates: Template[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const container = document.createElement('div');
  container.id = 'thumbnail-generation-container';
  document.body.appendChild(container);

  try {
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];

      // Skip if already has thumbnail
      if (template.thumbnail) {
        continue;
      }

      try {
        const thumbnail = await generateTemplateThumbnail(template, container);
        template.thumbnail = thumbnail;
      } catch (error) {
        console.error(`Failed to generate thumbnail for ${template.name}:`, error);
        template.thumbnail = createThumbnailPlaceholder(template);
      }

      onProgress?.(i + 1, templates.length);
    }
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Optimize thumbnail data URL size
 *
 * @param dataUrl - Original data URL
 * @param maxSize - Maximum size in bytes
 * @returns Optimized data URL or original if under limit
 */
export function optimizeThumbnailSize(
  dataUrl: string,
  maxSize: number = 50000 // 50KB default
): string {
  const size = dataUrl.length * 0.75; // Approximate byte size for base64

  if (size <= maxSize) {
    return dataUrl;
  }

  // If too large, return a placeholder instead
  console.warn(
    `Thumbnail size (${Math.round(size)} bytes) exceeds limit (${maxSize} bytes), using placeholder`
  );

  // Extract template info from data URL context if available
  // For now, return a minimal placeholder
  return createThumbnailPlaceholder({
    name: 'Template',
    category: 'custom',
  } as Template);
}

/**
 * Convert data URL to blob for storage
 *
 * @param dataUrl - Base64 data URL
 * @returns Promise resolving to Blob
 */
export function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const parts = dataUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      resolve(new Blob([u8arr], { type: mime }));
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Convert blob to data URL
 *
 * @param blob - Blob to convert
 * @returns Promise resolving to data URL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
