/**
 * cn Utility Function
 *
 * Combines class names using clsx and tailwind-merge.
 * This ensures proper Tailwind CSS class precedence.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind CSS merge support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
