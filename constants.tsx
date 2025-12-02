import React from 'react';
import { AppConfig, AppDefinition } from './types';
import { 
  Bot, 
  StickyNote, 
  Settings,
  Globe,
  // Generic Icons for Library
  Home, Search, User, Star, Heart, 
  FileText, Mail, Calendar, Calculator, Archive,
  Image, Music, Video, Play, Headphones, Camera,
  Cpu, Database, Cloud, Wifi, Terminal, Code, Laptop, Smartphone,
  ShoppingCart, CreditCard, Map, Gift, Coffee, Sun, Moon, Zap, Shield, Lock,
  Gamepad2, Radio, Tv, Briefcase, LucideIcon
} from 'lucide-react';
import { GeminiChat } from './components/apps/GeminiChat';
import { NotePad } from './components/apps/NotePad';

// Helper to get high-quality favicon using Google's service
export const getFavicon = (url: string) => {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
  } catch {
    return undefined;
  }
};

// Registry of available icons for the user to select
export const ICON_LIBRARY: Record<string, LucideIcon> = {
  Globe, Home, Search, User, Star, Heart,
  FileText, Mail, Calendar, Calculator, Briefcase, Archive,
  Image, Music, Video, Headphones, Camera, Gamepad2, Radio, Tv,
  Cpu, Database, Cloud, Wifi, Terminal, Code, Laptop, Smartphone,
  ShoppingCart, CreditCard, Map, Coffee, Zap, Shield, Lock
};

export const DEFAULT_USER_APPS: AppConfig[] = [
  {
    id: 'creator-sync',
    name: 'Creator Sync',
    color: 'bg-indigo-600',
    description: 'Sync your content',
    url: 'https://creator-sync-one.vercel.app/',
    iconUrl: getFavicon('https://creator-sync-one.vercel.app/')
  },
  {
    id: 'png-box',
    name: 'PNG Box',
    color: 'bg-pink-500',
    description: 'Batch Image Converter',
    url: 'https://png2jpg-batchbox.vercel.app/',
    iconUrl: getFavicon('https://png2jpg-batchbox.vercel.app/')
  },
  {
    id: 'comfy-meta',
    name: 'Comfy Meta',
    color: 'bg-emerald-600',
    description: 'Metadata Viewer',
    url: 'https://comfy-metadata.vercel.app/',
    iconUrl: getFavicon('https://comfy-metadata.vercel.app/')
  }
];

// System apps that cannot be deleted, only hidden (conceptually)
export const SYSTEM_APPS: AppDefinition[] = [
  {
    id: 'gemini',
    name: 'AI Assistant',
    icon: Bot,
    color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    component: <GeminiChat />,
    description: 'Ask Gemini anything',
    isExternal: false,
    isSystem: true
  },
  {
    id: 'notes',
    name: 'Notes',
    icon: StickyNote,
    color: 'bg-amber-400',
    component: <NotePad />,
    description: 'Write it down',
    isExternal: false,
    isSystem: true
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    color: 'bg-slate-500',
    description: 'Configure CloudOS',
    isExternal: false,
    isSystem: true
  },
];

// Helper to convert a stored config to a runtime definition
export const configToDefinition = (config: AppConfig): AppDefinition => {
  // Resolve the icon component: 
  // 1. If iconName is provided and exists in library, use it.
  // 2. Fallback to Globe.
  const ResolvedIcon = (config.iconName && ICON_LIBRARY[config.iconName]) 
    ? ICON_LIBRARY[config.iconName] 
    : Globe;

  return {
    id: config.id,
    name: config.name,
    icon: ResolvedIcon, 
    iconUrl: config.iconUrl,
    color: config.color,
    description: config.description,
    url: config.url,
    isExternal: true,
    isSystem: false
  };
};