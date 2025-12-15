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
  Printer, HardDrive, FolderOpen, FileCode, TerminalSquare, Command, Sparkles,
  LayoutTemplate
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
  Globe, Home, Search, User, Star, Heart, Sparkles, LayoutTemplate,
  FileText, Mail, Calendar, Calculator, Briefcase, Archive,
  Image, Music, Video, Headphones, Camera, Gamepad2, Radio, Tv,
  Cpu, Database, Cloud, Wifi, Terminal, Code, Laptop, Smartphone,
  ShoppingCart, CreditCard, Map, Coffee, Zap, Shield, Lock,
  Mic, Speaker, Battery, Bluetooth, Signal, Mouse, Keyboard,
  Printer, HardDrive, FolderOpen, FileCode, TerminalSquare, Command
};

export const DEFAULT_USER_APPS: AppConfig[] = [
  {
    id: "creator-sync",
    name: "Creator Sync",
    color: "bg-sky-700",
    description: "Sync your content",
    url: "https://creator-sync-one.vercel.app/",
    iconUrl: "",
    iconName: "Calendar",
    widgetStyle: "vertical",
    gridSize: "1x2",
    heroIconName: "Calendar",
    heroScale: 10,
    heroOpacity: 10,
    heroOffsetX: 40,
    heroOffsetY: 5,
    heroRotation: 25,
    heroColor: "#fbbf24",
    heroEffect: "glow",
    heroEffectIntensity: 1.5
  },
  {
    id: "b236b1d4-09a6-4ca7-a873-0b5f2ea138a6",
    name: "Batchbox",
    url: "https://png2jpg-batchbox.vercel.app/",
    color: "bg-teal-600",
    description: "",
    iconUrl: "",
    iconName: "Image",
    widgetStyle: "horizontal",
    gridSize: "2x1",
    heroIconName: "Image",
    heroScale: 10,
    heroOpacity: 10,
    heroOffsetX: 35,
    heroOffsetY: 50,
    heroRotation: -25,
    heroColor: "#fde68a",
    heroEffect: "glow",
    heroEffectIntensity: 1
  },
  {
    id: "comfy-meta",
    name: "Comfy Meta",
    color: "bg-amber-600",
    description: "Metadata Viewer",
    url: "https://comfy-metadata.vercel.app/",
    iconUrl: "",
    iconName: "FileCode",
    heroIconName: "FileCode",
    heroScale: 8,
    heroOpacity: 15,
    heroOffsetX: 10,
    heroOffsetY: 10,
    heroRotation: -30,
    heroColor: "#f59e0b",
    heroEffect: "glow",
    heroEffectIntensity: 1.5,
    widgetStyle: "vertical",
    gridSize: "1x2"
  },
  {
    id: "2d57b6e9-1472-4c7e-a735-7770b1c87326",
    name: "Sonic Alchemy",
    url: "https://sonicalchemy-1007091753870.us-west1.run.app/",
    color: "bg-amber-800",
    description: "",
    iconUrl: "",
    iconName: "Music",
    heroIconName: "Music",
    heroScale: 10.5,
    heroOpacity: 15,
    heroOffsetX: -15,
    heroOffsetY: 0,
    heroRotation: 15,
    heroColor: "#b45309",
    heroEffect: "glow",
    heroEffectIntensity: 1.5,
    widgetStyle: "horizontal",
    gridSize: "2x1"
  },
  {
    id: "27f478d3-020a-474c-82f0-536a8dea712c",
    name: "Prisma Flow",
    url: "https://prismaflow-sigma.vercel.app/",
    color: "bg-violet-700",
    description: "",
    iconUrl: "",
    iconName: "Keyboard",
    heroIconName: "Keyboard",
    heroScale: 13,
    heroOpacity: 15,
    heroOffsetX: 25,
    heroOffsetY: 10,
    heroRotation: -35,
    heroColor: "#fbbf24",
    heroEffect: "glow",
    heroEffectIntensity: 1,
    widgetStyle: "horizontal",
    gridSize: "2x1"
  }
];

// 1. Core System Apps
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

// 2. Widget Registry
export const WIDGET_REGISTRY: Record<string, WidgetRegistryItem> = {
  'clock-widget': {
    id: 'clock-widget',
    name: 'System Clock',
    description: 'Large digital clock with timezone support',
    icon: Globe,
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

// --- PRE-CONFIGURED LAYOUT ---
// We manually construct the layout array to ensure widgets don't overlap
// and sit in aesthetic positions.
// Grid is assumed to be 8 columns wide on desktop.
export const DEFAULT_LAYOUT: (string | null)[] = new Array(48).fill(null);

// Row 1 & 2 (Top Area)
// Clock (2x2) at 0,1 / 8,9
DEFAULT_LAYOUT[0] = 'clock-widget';
// Gemini (2x2) at 2,3 / 10,11
DEFAULT_LAYOUT[2] = 'gemini-assistant';
// Creator Sync (1x2 Vertical) at 4 / 12
DEFAULT_LAYOUT[4] = 'creator-sync';
// Comfy Meta (1x2 Vertical) at 5 / 13
DEFAULT_LAYOUT[5] = 'comfy-meta';
// Settings (1x1) at 6
DEFAULT_LAYOUT[6] = 'settings';

// Row 3 (Index starts at 16)
// Batchbox (2x1) at 16,17
DEFAULT_LAYOUT[16] = 'b236b1d4-09a6-4ca7-a873-0b5f2ea138a6'; 
// Sonic Alchemy (2x1) at 18,19
DEFAULT_LAYOUT[18] = '2d57b6e9-1472-4c7e-a735-7770b1c87326'; 
// Prisma Flow (2x1) at 20,21
DEFAULT_LAYOUT[20] = '27f478d3-020a-474c-82f0-536a8dea712c';


// Helper: Convert user config to runtime definition
export const configToDefinition = (config: AppConfig): AppDefinition => {
  const ResolvedIcon = (config.iconName && ICON_LIBRARY[config.iconName]) 
    ? ICON_LIBRARY[config.iconName] 
    : Globe;
  
  let heroIconName = config.heroIconName;
  if (config.widgetStyle === 'dropzone' && !heroIconName) {
      heroIconName = 'Upload';
  }

  const HeroIcon = (heroIconName && ICON_LIBRARY[heroIconName])
    ? ICON_LIBRARY[heroIconName]
    : undefined;

  let WidgetComp = undefined;
  
  const style = config.widgetStyle === 'dropzone' ? 'horizontal' : (config.widgetStyle || 'standard');
  let finalGridSize = config.gridSize;
  
  if (!finalGridSize) {
      if (style === 'status' || style === 'horizontal') {
          finalGridSize = '2x1';
      } else if (style === 'vertical') {
          finalGridSize = '1x2';
      } else {
          finalGridSize = '1x1';
      }
  }

  if (style !== 'standard') {
      if (HeroIcon) {
          WidgetComp = <DropZoneWidget 
            name={config.name} 
            icon={ResolvedIcon} 
            color={config.color} 
            gridSize={finalGridSize} 
            heroIcon={HeroIcon}
            heroSettings={{
                scale: config.heroScale ?? 8,
                opacity: config.heroOpacity ?? 30,
                x: config.heroOffsetX ?? 40,
                y: config.heroOffsetY ?? 0,
                rotate: config.heroRotation ?? 0,
                color: config.heroColor, 
                effect: config.heroEffect ?? 'none',
                effectIntensity: config.heroEffectIntensity ?? 5
            }}
          />;
      } else {
          WidgetComp = <StatusWidget name={config.name} icon={ResolvedIcon} color={config.color} description={config.description} gridSize={finalGridSize} />;
      }
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
    gridSize: finalGridSize,
    widgetComponent: WidgetComp
  };
};

export const widgetToDefinition = (widget: WidgetRegistryItem): AppDefinition => {
  return {
    id: widget.id,
    name: widget.name,
    icon: widget.icon,
    color: 'bg-transparent',
    description: widget.description,
    isExternal: false,
    isSystem: true,
    isWidget: true,
    gridSize: widget.defaultGridSize,
    component: widget.id === 'gemini-assistant' ? <GeminiChat /> : null,
    widgetComponent: widget.component
  };
};