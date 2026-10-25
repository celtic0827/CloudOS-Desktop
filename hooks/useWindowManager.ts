import { useState, useCallback, useEffect } from 'react';
import { ViewMode, DockState } from '../types';

const STORAGE_VIEW_MODE = 'cloudos_view_mode';
const STORAGE_DOCKS_STATE = 'cloudos_docks_active_v1';

export const useWindowManager = () => {
  // 1. Docks list - supports primary dock ('dock-1') and optional secondary dock ('dock-2')
  const [docks, setDocks] = useState<DockState[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DOCKS_STATE);
      if (saved) {
        const parsed: DockState[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(d => ({
            ...d,
            // Keep activeAppId, reset refreshTrigger
            refreshTrigger: 0,
            isAppOpen: !!d.activeAppId
          }));
        }
      }
    } catch (e) {
      console.warn("Failed to load docks state", e);
    }
    return [
      { id: 'dock-1', activeAppId: null, isAppOpen: false, refreshTrigger: 0 }
    ];
  });

  // 2. Focused Dock ID (for workspace mode and focus indicators)
  const [activeDockId, setActiveDockId] = useState<string>('dock-1');

  // 3. View Mode: 'split' (side by side 50/50) or 'workspace' (full screen tab)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VIEW_MODE) as ViewMode;
      if (saved === 'split' || saved === 'workspace') return saved;
    } catch (e) {}
    return 'split';
  });

  // Persist viewMode
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VIEW_MODE, viewMode);
    } catch (e) {}
  }, [viewMode]);

  // Persist docks minimal state
  useEffect(() => {
    try {
      const toSave = docks.map(d => ({
        id: d.id,
        activeAppId: d.activeAppId,
        isAppOpen: d.isAppOpen,
        refreshTrigger: 0
      }));
      localStorage.setItem(STORAGE_DOCKS_STATE, JSON.stringify(toSave));
    } catch (e) {}
  }, [docks]);

  // Add Secondary Dock (Dock 2)
  const addSecondaryDock = useCallback(() => {
    setDocks(prev => {
      if (prev.some(d => d.id === 'dock-2')) return prev;
      return [
        ...prev,
        { id: 'dock-2', activeAppId: null, isAppOpen: false, refreshTrigger: 0 }
      ];
    });
    setActiveDockId('dock-2');
  }, []);

  // Remove Secondary Dock (Dock 2)
  const removeSecondaryDock = useCallback(() => {
    setDocks(prev => prev.filter(d => d.id !== 'dock-2'));
    setActiveDockId('dock-1');
  }, []);

  // Open App in a specific dock (or active dock by default)
  const openApp = useCallback((appId: string, dockId?: string) => {
    const targetDockId = dockId || activeDockId || 'dock-1';
    
    setDocks(prev => prev.map(dock => {
      if (dock.id === targetDockId) {
        return {
          ...dock,
          activeAppId: appId,
          isAppOpen: true
        };
      }
      return dock;
    }));
    setActiveDockId(targetDockId);
  }, [activeDockId]);

  // Close App in a specific dock (or active dock by default)
  const closeApp = useCallback((dockId?: string) => {
    const targetDockId = dockId || activeDockId || 'dock-1';

    setDocks(prev => prev.map(dock => {
      if (dock.id === targetDockId) {
        return {
          ...dock,
          isAppOpen: false,
          activeAppId: null
        };
      }
      return dock;
    }));
  }, [activeDockId]);

  // Reload a specific dock's web app
  const reloadApp = useCallback((dockId: string) => {
    setDocks(prev => prev.map(dock => {
      if (dock.id === dockId) {
        return {
          ...dock,
          refreshTrigger: dock.refreshTrigger + 1
        };
      }
      return dock;
    }));
  }, []);

  // Toggle View Mode between Split and Workspace
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => (prev === 'split' ? 'workspace' : 'split'));
  }, []);

  // Primary active app for desktop visibility check (if any app is open across all docks)
  const anyAppOpen = docks.some(d => !!d.activeAppId && d.isAppOpen);
  const primaryDock = docks.find(d => d.id === 'dock-1') || docks[0];
  const secondaryDock = docks.find(d => d.id === 'dock-2');

  return {
    docks,
    activeDockId,
    setActiveDockId,
    viewMode,
    setViewMode,
    toggleViewMode,
    addSecondaryDock,
    removeSecondaryDock,
    openApp,
    closeApp,
    reloadApp,
    anyAppOpen,
    primaryDock,
    secondaryDock
  };
};