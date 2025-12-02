import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export interface AppConfig {
  id: string;
  name: string;
  url: string;
  iconUrl?: string;     // Custom URL for an image icon
  iconName?: string;    // Name of the specific Lucide icon selected from the library
  color: string;
  description: string;
}

export interface AppDefinition {
  id: string;
  name: string;
  icon?: LucideIcon;    // The actual component resolved from iconName or default
  iconUrl?: string;     
  color: string;
  component?: ReactNode; 
  description: string;
  url?: string;         
  isExternal?: boolean; 
  isSystem?: boolean;   
}

export interface SystemState {
  activeAppId: string | null;
  isMenuOpen: boolean;
}

export type Theme = 'light' | 'dark';