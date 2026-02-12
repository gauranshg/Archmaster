/**
 * PNG Export Service
 *
 * Handles exporting diagrams to PNG image format using html-to-image.
 * Supports high-resolution exports, custom backgrounds, and large diagrams.
 */

import { toPng, toBlob } from 'html-to-image';

/**
 * PNG Export Options
 */
export interface PNGExportOptions {
  /** Resolution scale factor (1 = standard, 2 = retina, 3 = ultra HD) */
  scale?: number;

  /** Background color (default: white) */
  backgroundColor?: string;

  /** Image quality for PNG (0-1, though PNG is lossless) */
  quality?: number;

  /** Output filename (without extension) */
  filename?: string;

  /** Cache busting for external images */
  cacheBust?: boolean;

  /** Pixel ratio for high-DPI displays */
  pixelRatio?: number;

  /** Whether to show a loading indicator during export */
  showProgress?: boolean;

  /** Progress callback for large diagrams */
  onProgress?: (progress: number) => void;

  /** Custom width (overrides auto-detection) */
  width?: number;

  /** Custom height (overrides auto-detection) */
  height?: number;

  /** Whether to fit the diagram in view before export */
  fitView?: boolean;

  /** Padding around the diagram (in pixels) */
  padding?: number;
}

/**
 * PNG Export Result
 */
export interface PNGExportResult {
  /** The data URL of the exported image */
  dataUrl: string;

  /** The Blob of the exported image */
  blob: Blob;

  /** The filename used */
  filename: string;

  /** The dimensions of the exported image */
  width: number;
  height: number;

  /** The scale factor used */
  scale: number;
}

/**
 * Default PNG export options
 */
export const defaultPNGOptions: PNGExportOptions = {
  scale: 2,
  backgroundColor: '#ffffff',
  quality: 1,
  cacheBust: true,
  pixelRatio: 2,
  showProgress: false,
  padding: 20,
};

/**
 * Generates a safe filename from a string
 *
 * @param name - The name to sanitize
 * @returns Safe filename
 */
const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 200);
};

/**
 * Gets the actual React Flow canvas element from a wrapper
 *
 * @param wrapper - The wrapper element containing React Flow
 * @returns The React Flow canvas element or null
 */
const getReactFlowCanvas = (wrapper: HTMLElement): HTMLElement | null => {
  // React Flow renders a div with class "react-flow" inside the wrapper
  return wrapper.querySelector('.react-flow') as HTMLElement;
};

/**
 * Calculates the bounding box of all nodes in the diagram
 *
 * @param element - The React Flow canvas element
 * @returns Bounding box with padding
 */
const calculateDiagramBounds = (
  element: HTMLElement,
  padding: number = 20
): { width: number; height: number; x: number; y: number } => {
  const nodes = element.querySelectorAll('.react-flow__node');
  if (nodes.length === 0) {
    return {
      width: element.offsetWidth + padding * 2,
      height: element.offsetHeight + padding * 2,
      x: 0,
      y: 0,
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const rect = node.getBoundingClientRect();
    const canvasRect = element.getBoundingClientRect();

    // Calculate position relative to canvas
    const x = rect.left - canvasRect.left;
    const y = rect.top - canvasRect.top;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + rect.width);
    maxY = Math.max(maxY, y + rect.height);
  });

  return {
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
  };
};

/**
 * Exports a diagram element to PNG
 *
 * @param element - The HTML element to export (wrapper or canvas)
 * @param options - Export options
 * @returns Promise resolving to export result
 */
export async function exportAsPNG(
  element: HTMLElement,
  options: PNGExportOptions = {}
): Promise<PNGExportResult> {
  const mergedOptions = { ...defaultPNGOptions, ...options };
  const {
    scale = 2,
    backgroundColor = '#ffffff',
    filename = 'diagram',
    cacheBust = true,
    width,
    height,
    padding = 20,
  } = mergedOptions;

  // Get the actual React Flow canvas if a wrapper was provided
  let targetElement = element;
  const canvasElement = getReactFlowCanvas(element);
  if (canvasElement) {
    targetElement = canvasElement;
  }

  // Calculate dimensions if not provided
  const bounds = calculateDiagramBounds(targetElement, padding);
  const exportWidth = width || bounds.width;
  const exportHeight = height || bounds.height;

  // Store original transform and background
  const originalStyle = targetElement.getAttribute('style');

  try {
    // Ensure white background for export
    const bgElement = targetElement.querySelector('.react-flow__background') as HTMLElement;
    const originalBg = bgElement?.style.background;
    const originalBgColor = bgElement?.style.backgroundColor;

    if (bgElement) {
      bgElement.style.background = backgroundColor;
      bgElement.style.backgroundColor = backgroundColor;
    }

    // Add a temporary white background overlay to prevent transparency
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = backgroundColor;
    overlay.style.zIndex = '-1';
    targetElement.insertBefore(overlay, targetElement.firstChild);

    // Export using html-to-image
    const dataUrl = await toPng(targetElement, {
      width: exportWidth,
      height: exportHeight,
      quality: 1,
      pixelRatio: scale,
      cacheBust,
      backgroundColor,
      style: {
        transform: 'none',
        transformOrigin: 'top left',
      },
    });

    // Remove overlay
    targetElement.removeChild(overlay);

    // Restore original background
    if (bgElement) {
      if (originalBg !== undefined) {
        bgElement.style.background = originalBg;
      }
      if (originalBgColor !== undefined) {
        bgElement.style.backgroundColor = originalBgColor;
      }
    }

    // Convert to blob
    const blob = await toBlob(targetElement, {
      width: exportWidth,
      height: exportHeight,
      quality: 1,
      pixelRatio: scale,
      cacheBust,
      backgroundColor,
    }) as Blob;

    // Generate safe filename
    const safeFilename = sanitizeFilename(filename);
    const fullFilename = `${safeFilename}.png`;

    return {
      dataUrl,
      blob,
      filename: fullFilename,
      width: exportWidth,
      height: exportHeight,
      scale,
    };
  } catch (error) {
    throw new Error(
      `Failed to export diagram as PNG: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    // Restore original style if it was modified
    if (originalStyle !== null) {
      targetElement.setAttribute('style', originalStyle);
    }
  }
}

/**
 * Exports a diagram and triggers a file download
 *
 * @param element - The HTML element to export
 * @param options - Export options
 * @returns Promise resolving when download is triggered
 */
export async function exportAndDownloadPNG(
  element: HTMLElement,
  options: PNGExportOptions = {}
): Promise<void> {
  try {
    const result = await exportAsPNG(element, options);

    // Create download link
    const link = document.createElement('a');
    link.href = result.dataUrl;
    link.download = result.filename;
    link.style.display = 'none';

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);

    // No need to revoke dataUrl as it's not a blob URL
  } catch (error) {
    throw new Error(
      `Failed to download PNG: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Exports a diagram to PNG with progress indication
 * Useful for large diagrams with many nodes
 *
 * @param element - The HTML element to export
 * @param options - Export options
 * @returns Promise resolving to export result
 */
export async function exportAsPNGWithProgress(
  element: HTMLElement,
  options: PNGExportOptions = {}
): Promise<PNGExportResult> {
  const { onProgress, showProgress = true } = options;

  // Show initial progress
  if (showProgress && onProgress) {
    onProgress(0);
  }

  // Simulate progress (html-to-image doesn't provide real progress)
  const progressInterval = onProgress
    ? setInterval(() => {
        onProgress(Math.random() * 50); // 0-50% during processing
      }, 100)
    : null;

  try {
    const result = await exportAsPNG(element, options);

    if (progressInterval) {
      clearInterval(progressInterval);
    }

    if (showProgress && onProgress) {
      onProgress(100);
    }

    return result;
  } catch (error) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    throw error;
  }
}

/**
 * PNG Export Service
 */
export const pngExportService = {
  exportAsPNG,
  exportAndDownloadPNG,
  exportAsPNGWithProgress,
};
