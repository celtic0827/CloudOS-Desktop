import { useState, useEffect, useMemo, useCallback } from 'react';
import { AppConfig, AppDefinition, ClockConfig } from '../types';
import { DEFAULT_USER_APPS, SYSTEM_APPS, WIDGET_REGISTRY, configToDefinition, widgetToDefinition } from '../constants';

const STORAGE_KEY_APPS = 'cloudos_user_apps';
const STORAGE_KEY_WIDGETS = 'cloudos_active_widgets';
const STORAGE_KEY_ORDER = 'cloudos_layout_order';

// Now accepts clockConfig to sync widget sizes
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

  // 2. Active Widgets State (List of IDs from Registry)
  const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WIDGETS);
      // Default: Enable Clock and Gemini if storage is empty
      return stored ? JSON.parse(stored) : ['clock-widget', 'gemini-assistant'];
    } catch (e) {
      return ['clock-widget', 'gemini-assistant'];
    }
  });

  // 3. Layout Order State
  const [layoutOrder, setLayoutOrder] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ORDER);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
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
    if (layoutOrder.length > 0) {
      localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(layoutOrder));
    }
  }, [layoutOrder]);

  // 4. Compute All Apps (Unordered)
  const rawAllApps: AppDefinition[] = useMemo(() => {
    const userDefinitions = userApps.map(configToDefinition);
    
    // Map active widget IDs to definitions
    const widgetDefinitions = activeWidgetIds
      .filter(id => WIDGET_REGISTRY[id])
      .map(id => {
          const def = widgetToDefinition(WIDGET_REGISTRY[id]);
          // Override Grid Size for System Clock based on config
          if (id === 'clock-widget' && clockConfig) {
              def.gridSize = clockConfig.gridSize;
          }
          return def;
      });

    // Combine: System (Settings) + Widgets + User Apps
    return [...SYSTEM_APPS, ...widgetDefinitions, ...userDefinitions];
  }, [userApps, activeWidgetIds, clockConfig]); // Depend on clockConfig

  // 5. Compute Ordered Apps
  const allApps = useMemo(() => {
    if (layoutOrder.length === 0) {
      // Heuristic sort
      const sorted = [...rawAllApps].sort((a, b) => {
        const getScore = (app: AppDefinition) => {
          if (app.id === 'clock-widget') return 100;
          if (app.id === 'gemini-assistant') return 90;
          if (app.gridSize === '2x2') return 80;
          if (app.gridSize === '2x1') return 70;
          return 1;
        };
        return getScore(b) - getScore(a);
      });
      return sorted;
    }

    const appMap = new Map(rawAllApps.map(app => [app.id, app]));
    const ordered: AppDefinition[] = [];
    const processedIds = new Set<string>();

    layoutOrder.forEach(id => {
      const app = appMap.get(id);
      if (app) {
        ordered.push(app);
        processedIds.add(id);
      }
    });

    // Append new items
    rawAllApps.forEach(app => {
      if (!processedIds.has(app.id)) {
        ordered.push(app);
      }
    });

    return ordered;
  }, [rawAllApps, layoutOrder]);

  // Sync layoutOrder only when raw content changes meaningfully
  useEffect(() => {
    const currentIds = allApps.map(a => a.id);
    const isMismatch = JSON.stringify(currentIds) !== JSON.stringify(layoutOrder);
    if (isMismatch) {
        setLayoutOrder(currentIds);
    }
  }, [allApps]);

  // CRUD
  const addApp = (newApp: AppConfig) => {
    setUserApps(prev => [...prev, newApp]);
  };

  const updateApp = (updatedApp: AppConfig) => {
    setUserApps(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app));
  };

  const deleteApp = (id: string) => {
    setUserApps(prev => prev.filter(app => app.id !== id));
    setLayoutOrder(prev => prev.filter(orderId => orderId !== id));
  };

  const resetApps = () => {
    if (confirm('Reset all apps and layout?')) {
        setUserApps(DEFAULT_USER_APPS);
        setActiveWidgetIds(['clock-widget', 'gemini-assistant']);
        setLayoutOrder([]); 
        localStorage.removeItem(STORAGE_KEY_ORDER);
    }
  };

  const importApps = (importedApps: AppConfig[]) => {
    setUserApps(importedApps);
  };

  const moveApp = useCallback((sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setLayoutOrder(prevOrder => {
      const newOrder = [...prevOrder];
      const sourceIndex = newOrder.indexOf(sourceId);
      const targetIndex = newOrder.indexOf(targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prevOrder;
      const [movedId] = newOrder.splice(sourceIndex, 1);
      newOrder.splice(targetIndex, 0, movedId);
      return newOrder;
    });
  }, []);

  // Widget Management
  const toggleWidget = (widgetId: string, enabled: boolean) => {
    setActiveWidgetIds(prev => {
      if (enabled) {
        return prev.includes(widgetId) ? prev : [...prev, widgetId];
      } else {
        const newIds = prev.filter(id => id !== widgetId);
        // Also clean up order
        setLayoutOrder(currentOrder => currentOrder.filter(id => id !== widgetId));
        return newIds;
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