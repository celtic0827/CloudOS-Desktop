import { useState, useEffect, useMemo } from 'react';
import { AppConfig, AppDefinition } from '../types';
import { DEFAULT_USER_APPS, SYSTEM_APPS, configToDefinition } from '../constants';

const STORAGE_KEY = 'cloudos_user_apps';

export const useAppConfig = () => {
  // State for user-defined/external apps
  const [userApps, setUserApps] = useState<AppConfig[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_USER_APPS;
    } catch (e) {
      console.error("Failed to load apps", e);
      return DEFAULT_USER_APPS;
    }
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userApps));
  }, [userApps]);

  // Merge System apps + User apps
  const allApps: AppDefinition[] = useMemo(() => {
    const userDefinitions = userApps.map(configToDefinition);
    return [...userDefinitions, ...SYSTEM_APPS];
  }, [userApps]);

  // CRUD Handlers
  const addApp = (newApp: AppConfig) => {
    setUserApps(prev => [...prev, newApp]);
  };

  const updateApp = (updatedApp: AppConfig) => {
    setUserApps(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app));
  };

  const deleteApp = (id: string) => {
    setUserApps(prev => prev.filter(app => app.id !== id));
  };

  const resetApps = () => {
    setUserApps(DEFAULT_USER_APPS);
  };

  const importApps = (importedApps: AppConfig[]) => {
    setUserApps(importedApps);
  };

  // Drag and Drop Reordering
  const reorderApps = (sourceId: string, targetId: string) => {
    const sourceIndex = userApps.findIndex(app => app.id === sourceId);
    const targetIndex = userApps.findIndex(app => app.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const newUserApps = [...userApps];
    const [movedApp] = newUserApps.splice(sourceIndex, 1);
    newUserApps.splice(targetIndex, 0, movedApp);

    setUserApps(newUserApps);
  };

  return {
    userApps,
    allApps,
    addApp,
    updateApp,
    deleteApp,
    resetApps,
    importApps,
    reorderApps
  };
};