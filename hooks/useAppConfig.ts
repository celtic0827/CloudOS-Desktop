import { useState, useEffect, useMemo, useCallback } from 'react';
import { AppConfig, AppDefinition, ClockConfig } from '../types';
import { DEFAULT_USER_APPS, SYSTEM_APPS, WIDGET_REGISTRY, configToDefinition, widgetToDefinition } from '../constants';

const STORAGE_KEY_APPS = 'cloudos_user_apps';
const STORAGE_KEY_WIDGETS = 'cloudos_active_widgets';
const STORAGE_KEY_LAYOUT = 'cloudos_grid_layout_v3'; // Bumped version to v3 to reset and apply new logic cleanly

// Fixed grid capacity
const GRID_CAPACITY = 48;

export const useAppConfig = (clockConfig?: ClockConfig) => {
  // 1. User Apps State
  const [userApps, setUserApps] = useState<AppConfig[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_APPS);
      return stored ? JSON.parse(stored) : DEFAULT_USER_APPS;
    } catch (e) {
      return DEFAULT_USER_APPS;
    }
  });

  // 2. Active Widgets State
  const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WIDGETS);
      return stored ? JSON.parse(stored) : ['clock-widget', 'gemini-assistant'];
    } catch (e) {
      return ['clock-widget', 'gemini-assistant'];
    }
  });

  // 3. Layout State (The Single Source of Truth for Positioning)
  const [layout, setLayout] = useState<(string | null)[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LAYOUT);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length < GRID_CAPACITY) {
            return [...parsed, ...Array(GRID_CAPACITY - parsed.length).fill(null)];
        }
        return parsed;
      }
      return Array(GRID_CAPACITY).fill(null);
    } catch (e) {
      return Array(GRID_CAPACITY).fill(null);
    }
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(userApps));
  }, [userApps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WIDGETS, JSON.stringify(activeWidgetIds));
  }, [activeWidgetIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LAYOUT, JSON.stringify(layout));
  }, [layout]);

  // --- CRITICAL FIX: Synchronize Layout with Apps ---
  // If an app exists in userApps/widgets but NOT in layout, place it.
  // If an app exists in layout but NOT in userApps/widgets, remove it.
  useEffect(() => {
      let hasChanges = false;
      const newLayout = [...layout];
      
      // 1. Get all currently valid IDs
      const validIds = new Set([
          ...SYSTEM_APPS.map(a => a.id),
          ...activeWidgetIds,
          ...userApps.map(a => a.id)
      ]);

      // 2. Cleanup: Remove IDs from layout that no longer exist
      for (let i = 0; i < newLayout.length; i++) {
          const id = newLayout[i];
          if (id && !validIds.has(id)) {
              newLayout[i] = null;
              hasChanges = true;
          }
      }

      // 3. Placement: Add missing IDs to the first available empty slot
      validIds.forEach(id => {
          if (!newLayout.includes(id)) {
              const emptyIndex = newLayout.indexOf(null);
              if (emptyIndex !== -1) {
                  newLayout[emptyIndex] = id;
                  hasChanges = true;
              }
          }
      });

      // Only update state if changes occurred to prevent infinite loops
      if (hasChanges) {
          setLayout(newLayout);
      }
  }, [userApps, activeWidgetIds, layout]); // Dependencies trigger check whenever apps change

  // 4. Compute Grid Items for Rendering
  // Now simpler: strictly maps the layout array to definitions
  const allApps = useMemo(() => {
    // Create a lookup map for definitions
    const definitions = [
        ...SYSTEM_APPS,
        ...activeWidgetIds
            .filter(id => WIDGET_REGISTRY[id])
            .map(id => {
                const def = widgetToDefinition(WIDGET_REGISTRY[id]);
                if (id === 'clock-widget' && clockConfig) {
                    def.gridSize = clockConfig.gridSize;
                }
                return def;
            }),
        ...userApps.map(configToDefinition)
    ];
    
    const defMap = new Map(definitions.map(d => [d.id, d]));

    // Map the layout to definitions. 
    // If layout has an ID but defMap doesn't (rare sync race), return null.
    return layout.map(id => (id ? defMap.get(id) || null : null));
  }, [layout, userApps, activeWidgetIds, clockConfig]);


  // 5. Actions
  const addApp = (newApp: AppConfig) => {
    setUserApps(prev => [...prev, newApp]);
    // Layout sync will handle placement in the useEffect
  };

  const updateApp = (updatedApp: AppConfig) => {
    setUserApps(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app));
  };

  const deleteApp = (id: string) => {
    setUserApps(prev => prev.filter(app => app.id !== id));
    // Layout sync will handle removal
  };

  const resetApps = () => {
    if (confirm('Reset all apps and layout?')) {
        setUserApps(DEFAULT_USER_APPS);
        setActiveWidgetIds(['clock-widget', 'gemini-assistant']);
        setLayout(Array(GRID_CAPACITY).fill(null)); 
    }
  };

  const importApps = (importedApps: AppConfig[]) => {
    setUserApps(importedApps);
  };

  // Move Logic: Swaps content in the layout array
  const moveApp = useCallback((sourceId: string, targetIndex: number) => {
    setLayout(prevLayout => {
      const sourceIndex = prevLayout.indexOf(sourceId);
      
      // Safety check: if source isn't found (shouldn't happen with sync), abort
      if (sourceIndex === -1) return prevLayout; 
      if (sourceIndex === targetIndex) return prevLayout;

      const newLayout = [...prevLayout];
      
      // 1. Get content at both spots
      const sourceContent = newLayout[sourceIndex]; // Should be sourceId
      const targetContent = newLayout[targetIndex]; // Could be an app ID or null
      
      // 2. Perform the Swap
      newLayout[targetIndex] = sourceContent;
      newLayout[sourceIndex] = targetContent;

      return newLayout;
    });
  }, []);

  const toggleWidget = (widgetId: string, enabled: boolean) => {
    setActiveWidgetIds(prev => {
      if (enabled) {
        return prev.includes(widgetId) ? prev : [...prev, widgetId];
      } else {
        return prev.filter(id => id !== widgetId);
      }
    });
  };

  return {
    userApps,
    allApps, 
    activeWidgetIds,
    addApp,
    updateApp,
    deleteApp,
    resetApps,
    importApps,
    moveApp,
    toggleWidget
  };
};