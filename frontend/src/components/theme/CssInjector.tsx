/**
 * CSS Injector Component
 *
 * Safely injects custom CSS into the document scope for a specific diagram.
 * Ensures CSS is scoped to prevent bleeding into other diagrams.
 */

import { useEffect, useRef } from 'react';
import { cssService } from '@/services/cssService';

interface CssInjectorProps {
  /** CSS to inject */
  css: string;
  /** Diagram ID for scoping */
  diagramId: string;
  /** Whether to enable CSS scoping */
  enableScoping?: boolean;
}

/**
 * CSS Injector component
 */
export function CssInjector({ css, diagramId, enableScoping = true }: CssInjectorProps) {
  const styleElementRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!css || css.trim().length === 0) {
      // Clean up if no CSS
      if (styleElementRef.current) {
        styleElementRef.current.remove();
        styleElementRef.current = null;
      }
      return;
    }

    // Sanitize CSS first
    const sanitized = cssService.sanitizeCSS(css);

    // Scope CSS to diagram
    const scoped = enableScoping ? cssService.scopeCSS(sanitized, diagramId) : sanitized;

    // Generate unique style element ID
    const styleId = cssService.generateStyleId(diagramId);

    // Create or get style element
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.setAttribute('data-diagram-css', diagramId);

      // Add CSP nonce if available
      const nonce = document.querySelector('meta[property="csp-nonce"]')?.getAttribute('content');
      if (nonce) {
        styleElement.nonce = nonce;
      }

      document.head.appendChild(styleElement);
    }

    // Store reference
    styleElementRef.current = styleElement;

    // Inject scoped CSS
    styleElement.textContent = scoped;

    // Cleanup on unmount
    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.remove();
      }
      styleElementRef.current = null;
    };
  }, [css, diagramId, enableScoping]);

  // This component doesn't render anything
  return null;
}

/**
 * Hook to inject CSS imperatively
 */
export function useCssInjection(diagramId: string) {
  const injectCss = (css: string, enableScoping = true) => {
    const sanitized = cssService.sanitizeCSS(css);
    const scoped = enableScoping ? cssService.scopeCSS(sanitized, diagramId) : sanitized;
    const styleId = cssService.generateStyleId(diagramId);

    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.setAttribute('data-diagram-css', diagramId);
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = scoped;
  };

  const removeCss = () => {
    const styleId = cssService.generateStyleId(diagramId);
    const styleElement = document.getElementById(styleId);
    if (styleElement) {
      styleElement.remove();
    }
  };

  return { injectCss, removeCss };
}
