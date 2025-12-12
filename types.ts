import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export type GridSize = '1x1' | '2x1' | '1x2' | '2x2' | '4x2';
export type WidgetStyle = 'standard' | 'status' | 'dropzone';

export interface ClockConfig {
  timezone: string;
  label: string;
  use24Hour: boolean;
  gridSize: GridSize; // Added for layout customization
}

export interface AppConfig {
  id: string;
  name: string;
  url: string;
  iconUrl?: string;
  iconName?: string;
  color: string;
  description: string;
  gridSize?: GridSize;
  widgetStyle?: WidgetStyle;
}

export interface AppDefinition {
  id: string;
  name: string;
  icon?: LucideIcon;
  iconUrl?: string;     
  color: string;
  component?: ReactNode; 
  widgetComponent?: ReactNode; 
  description: string;
  url?: string;         
  isExternal?: boolean; 
  isSystem?: boolean;
  isWidget?: boolean; // New flag to identify desktop widgets
  gridSize: GridSize;
}

export interface WidgetRegistryItem {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  defaultGridSize: GridSize;
  component: ReactNode; // The widget UI itself
  configComponent?: ReactNode; // Optional custom config UI
}

export interface SystemState {
  activeAppId: string | null;
  isMenuOpen: boolean;
}

export type Theme = 'light' | 'dark';