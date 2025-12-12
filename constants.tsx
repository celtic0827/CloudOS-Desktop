import React from 'react';
import { AppConfig, AppDefinition, WidgetRegistryItem } from './types';
import { 
  Settings, Globe, Home, Search, User, Star, Heart, 
  FileText, Mail, Calendar, Calculator, Archive,
  Image, Music, Video, Play, Headphones, Camera,
  Cpu, Database, Cloud, Wifi, Terminal, Code, Laptop, Smartphone,
  ShoppingCart, CreditCard, Map, Gift, Coffee, Sun, Moon, Zap, Shield, Lock,
  Gamepad2, Radio, Tv, Briefcase, LucideIcon,
  Mic, Speaker, Battery, Bluetooth, Signal, Mouse, Keyboard, 
  Printer, HardDrive, FolderOpen, FileCode, TerminalSquare, Command, Sparkles
} from 'lucide-react';
import { GeminiChat } from './components/apps/GeminiChat';
import { ClockWidget, AIWidget, DropZoneWidget, StatusWidget } from './components/widgets/HeroWidgets';

// Helper to get high-quality favicon
export const getFavicon = (url: string) => {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
  } catch {
    return undefined;
  }
};

export const ICON_LIBRARY: Record<string, LucideIcon> = {
  Globe, Home, Search, User, Star, Heart, Sparkles,
  FileText, Mail, Calendar, Calculator, Briefcase, Archive,
  Image, Music, Video, Headphones, Camera, Gamepad2, Radio, Tv,
  Cpu, Database, Cloud, Wifi, Terminal, Code, Laptop, Smartphone,
  ShoppingCart, CreditCard, Map, Coffee, Zap, Shield, Lock,
  Mic, Speaker, Battery, Bluetooth, Signal, Mouse, Keyboard,
  Printer, HardDrive, FolderOpen, FileCode, TerminalSquare, Command
};

export const DEFAULT_USER_APPS: AppConfig[] = [
  {
    id: 'creator-sync',
    name: 'Creator Sync',
    color: 'bg-sky-700',
    description: 'Sync your content',
    url: 'https://creator-sync-one.vercel.app/',
    iconUrl: '',
    iconName: 'Calendar',
    gridSize: '2x1',
    widgetStyle: 'status'
  },
  {
    id: 'b236b1d4-09a6-4ca7-a873-0b5f2ea138a6',
    name: 'Png2Jpg Box',
    url: 'https://png2jpg-batchbox.vercel.app/',
    color: 'bg-teal-600',
    description: 'Drop images to convert',
    iconUrl: '',
    iconName: 'Image',
    gridSize: '2x1',
    widgetStyle: 'dropzone'
  },
  {
    id: 'comfy-meta',
    name: 'Comfy Meta',
    color: 'bg-amber-600',
    description: 'Metadata Viewer',
    url: 'https://comfy-metadata.vercel.app/',
    iconUrl: '',
    iconName: 'FileCode',
    gridSize: '1x1',
    widgetStyle: 'standard'
  },
  {
    id: '2d57b6e9-1472-4c7e-a735-7770b1c87326',
    name: 'Sonic Alchemy',
    url: 'https://sonic-alchemy.vercel.app/',
    color: 'bg-amber-800',
    description: 'Audio Tools',
    iconUrl: '',
    iconName: 'Music',
    gridSize: '1x1',
    widgetStyle: 'standard'
  }
];

// 1. Core System Apps (Always present, usually tools like Settings)
export const SYSTEM_APPS: AppDefinition[] = [
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    color: 'bg-slate-700',
    description: 'Configure CloudOS',
    isExternal: false,
    isSystem: true,
    gridSize: '1x1'
  },
];

// 2. Widget Registry (Available to be added to desktop)
export const WIDGET_REGISTRY: Record<string, WidgetRegistryItem> = {
  'clock-widget': {
    id: 'clock-widget',
    name: 'System Clock',
    description: 'Large digital clock with timezone support',
    icon: Calendar,
    defaultGridSize: '2x2',
    component: <ClockWidget />
  },
  'gemini-assistant': {
    id: 'gemini-assistant',
    name: 'Gemini AI',
    description: 'AI Assistant shortcut',
    icon: Sparkles,
    defaultGridSize: '2x2',
    component: <AIWidget />
  }
};

// Helper: Convert user config to runtime definition
export const configToDefinition = (config: AppConfig): AppDefinition => {
  const ResolvedIcon = (config.iconName && ICON_LIBRARY[config.iconName]) 
    ? ICON_LIBRARY[config.iconName] 
    : Globe;

  let WidgetComp = undefined;
  
  const style = config.widgetStyle || 'standard';

  if (style === 'dropzone') {
      WidgetComp = <DropZoneWidget name={config.name} icon={ResolvedIcon} color={config.color} />;
  } else if (style === 'status') {
      WidgetComp = <StatusWidget name={config.name} icon={ResolvedIcon} color={config.color} description={config.description} />;
  }

  let finalGridSize = config.gridSize;
  if (style === 'dropzone' || style === 'status') {
      finalGridSize = '2x1';
  } else {
      finalGridSize = '1x1';
  }

  return {
    id: config.id,
    name: config.name,
    icon: ResolvedIcon, 
    iconUrl: config.iconUrl,
    color: config.color,
    description: config.description,
    url: config.url,
    isExternal: true,
    isSystem: false,
    gridSize: finalGridSize || '1x1',
    widgetComponent: WidgetComp
  };
};

// Helper: Convert Registry Item to Runtime Definition
export const widgetToDefinition = (widget: WidgetRegistryItem): AppDefinition => {
  return {
    id: widget.id,
    name: widget.name,
    icon: widget.icon,
    color: 'bg-transparent', // Widgets handle their own bg usually
    description: widget.description,
    isExternal: false,
    isSystem: true,
    isWidget: true, // Key flag
    gridSize: widget.defaultGridSize,
    component: widget.id === 'gemini-assistant' ? <GeminiChat /> : null, // Special case for AI which has a window
    widgetComponent: widget.component
  };
};