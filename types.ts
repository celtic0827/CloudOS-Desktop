import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export type GridSize = '1x1' | '2x1' | '1x2' | '2x2' | '4x2';
export type WidgetStyle = 'standard' | 'vertical' | 'status' | 'dropzone' | 'horizontal';
export type HeroEffect = 'none' | 'shadow' | 'glow';

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
  heroIconName?: string; // New: Extra graphic for hero widgets
  
  // Hero Graphic Customization
  heroScale?: number;    // 1 to 20
  heroOpacity?: number;  // 0 to 100
  heroOffsetX?: number;  // -200 to 200
  heroOffsetY?: number;  // -200 to 200
  heroRotation?: number; // 0 to 360
  
  // Advanced Visuals
  heroEffect?: HeroEffect; 
  heroEffectIntensity?: number; // 0 to 100 (Blur radius)
  
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