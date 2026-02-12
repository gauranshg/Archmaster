/**
 * UI Store
 *
 * UI state management using Zustand.
 * Manages sidebar, panels, theme, loading, and error states.
 *
 * Note: Theme state is managed by ThemeContext, but we keep a reference here
 * for backward compatibility. Theme persistence is handled by ThemeContext.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Theme } from '@/types';

/**
 * UI state interface
 */
export interface UIState {
  // State
  sidebarOpen: boolean;
  propertiesPanelOpen: boolean;
  activePanel: string | null;
  theme: Theme;
  isLoading: boolean;
  error: string | null;
  loadingMessage: string | null;
  notifications: Notification[];

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setPropertiesPanelOpen: (open: boolean) => void;
  setActivePanel: (panel: string | null) => void;
  setTheme: (theme: Theme) => void;
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  toggleSidebar: () => void;
  togglePropertiesPanel: () => void;
}

/**
 * Notification interface
 */
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: string;
}

/**
 * UI store with persistence and devtools
 */
export const useUIStore = create<UIState>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        sidebarOpen: true,
        propertiesPanelOpen: false,
        activePanel: null,
        theme: 'light',
        isLoading: false,
        error: null,
        loadingMessage: null,
        notifications: [],

        // Set sidebar open state
        setSidebarOpen: (open) =>
          set((state) => {
            state.sidebarOpen = open;
          }),

        // Set properties panel open state
        setPropertiesPanelOpen: (open) =>
          set((state) => {
            state.propertiesPanelOpen = open;
          }),

        // Set active panel
        setActivePanel: (panel) =>
          set((state) => {
            state.activePanel = panel;
          }),

        // Set theme
        setTheme: (theme) =>
          set((state) => {
            state.theme = theme;
            // Apply theme to document
            if (typeof document !== 'undefined') {
              document.documentElement.setAttribute('data-theme', theme);
            }
          }),

        // Set loading state
        setLoading: (loading, message) =>
          set((state) => {
            state.isLoading = loading;
            state.loadingMessage = message || null;
          }),

        // Set error
        setError: (error) =>
          set((state) => {
            state.error = error;
          }),

        // Add notification
        addNotification: (notification) =>
          set((state) => {
            const newNotification: Notification = {
              ...notification,
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date().toISOString(),
            };
            state.notifications.push(newNotification);

            // Auto-remove notification after duration
            if (notification.duration !== 0) {
              const duration = notification.duration || 5000;
              setTimeout(() => {
                set((innerState) => {
                  innerState.notifications = innerState.notifications.filter(
                    (n) => n.id !== newNotification.id
                  );
                });
              }, duration);
            }
          }),

        // Remove notification
        removeNotification: (id) =>
          set((state) => {
            state.notifications = state.notifications.filter((n) => n.id !== id);
          }),

        // Clear all notifications
        clearNotifications: () =>
          set((state) => {
            state.notifications = [];
          }),

        // Toggle sidebar
        toggleSidebar: () =>
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          }),

        // Toggle properties panel
        togglePropertiesPanel: () =>
          set((state) => {
            state.propertiesPanelOpen = !state.propertiesPanelOpen;
          }),
      })),
      {
        name: 'ui-storage',
        // Persist theme, sidebar, and properties panel state
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          propertiesPanelOpen: state.propertiesPanelOpen,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);
