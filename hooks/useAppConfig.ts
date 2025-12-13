import { useState, useEffect, useMemo, useCallback } from 'react';
import { AppConfig, AppDefinition, ClockConfig } from '../types';
import { DEFAULT_USER_APPS, SYSTEM_APPS, WIDGET_REGISTRY, configToDefinition, widgetToDefinition } from '../constants';

const STORAGE_KEY_APPS = 'cloudos_user_apps';
const STORAGE_KEY_WIDGETS = 'cloudos_active_widgets';
const STORAGE_KEY_LAYOUT = 'cloudos_grid_layout_v2'; // Changed key for new data structure

// Fixed grid capacity to ensure enough drop zones for a desktop page
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

  // 3. Layout State (Sparse Array of IDs or Null)
  const [layout, setLayout] = useState<(string | null)[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LAYOUT);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure minimum capacity if loaded layout is smaller
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

  // 4. Compute Grid Items (Sparse Array of Definitions)
  const allApps = useMemo(() => {
    // Collect all active definitions
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
    const placedIds = new Set<string>();
    
    // Construct Grid from Layout
    let newGrid = [...layout];
    
    // Validate Layout: Map existing IDs to Definitions, clear invalid IDs
    newGrid = newGrid.map(id => {
        if (id && defMap.has(id)) {
            placedIds.add(id);
            return id; // Keep ID
        }
        return null; // Clear invalid ID or keep null
    });

    // Place unplaced apps (e.g. newly added) into first available empty slots
    definitions.forEach(def => {
        if (!placedIds.has(def.id)) {
            const emptyIndex = newGrid.findIndex(item => item === null);
            if (emptyIndex !== -1) {
                newGrid[emptyIndex] = def.id;
            } else {
                newGrid.push(def.id); // Expand grid if full
            }
        }
    });

    // Return the actual definitions in the grid slots
    return newGrid.map(id => (id ? defMap.get(id)! : null));
  }, [userApps, activeWidgetIds, layout, clockConfig]);


  // 5. CRUD & Move Logic
  const addApp = (newApp: AppConfig) => {
    setUserApps(prev => [...prev, newApp]);
  };

  const updateApp = (updatedApp: AppConfig) => {
    setUserApps(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app));
  };

  const deleteApp = (id: string) => {
    setUserApps(prev => prev.filter(app => app.id !== id));
    setLayout(prev => prev.map(item => item === id ? null : item));
  };

  const resetApps = () => {
    if (confirm('Reset all apps and layout?')) {
        setUserApps(DEFAULT_USER_APPS);
        setActiveWidgetIds(['clock-widget', 'gemini-assistant']);
        setLayout(Array(GRID_CAPACITY).fill(null)); 
        localStorage.removeItem(STORAGE_KEY_LAYOUT);
    }
  };

  const importApps = (importedApps: AppConfig[]) => {
    setUserApps(importedApps);
  };

  // Improved Move Logic for Grid: Swap or Place
  const moveApp = useCallback((sourceId: string, targetIndex: number) => {
    setLayout(prevLayout => {
      const newLayout = [...prevLayout];
      const sourceIndex = newLayout.indexOf(sourceId);
      
      if (sourceIndex === -1) return prevLayout; 
      if (sourceIndex === targetIndex) return prevLayout;

      // Extract source
      newLayout[sourceIndex] = null;

      // Check content at target
      const targetContent = newLayout[targetIndex];
      
      // Place source at target
      newLayout[targetIndex] = sourceId;

      // If target had something, move it to source's old spot (Swap)
      // This is the most stable behavior for manual grids without complex shifting algorithms
      if (targetContent) {
          newLayout[sourceIndex] = targetContent;
      }

      return newLayout;
    });
  }, []);

  const toggleWidget = (widgetId: string, enabled: boolean) => {
    setActiveWidgetIds(prev => {
      if (enabled) {
        return prev.includes(widgetId) ? prev : [...prev, widgetId];
      } else {
        const newIds = prev.filter(id => id !== widgetId);
        setLayout(l => l.map(item => item === widgetId ? null : item));
        return newIds;
      }
    });
  };

  return {
    userApps,
    allApps, // Now returns (AppDefinition | null)[]
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