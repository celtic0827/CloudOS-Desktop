import React from 'react';
import { AppConfig, AppDefinition } from './types';
import { 
  Settings,
  Globe,
  // Generic Icons for Library
  Home, Search, User, Star, Heart, 
  FileText, Mail, Calendar, Calculator, Archive,
  Image, Music, Video, Play, Headphones, Camera,
  Cpu, Database, Cloud, Wifi, Terminal, Code, Laptop, Smartphone,
  ShoppingCart, CreditCard, Map, Gift, Coffee, Sun, Moon, Zap, Shield, Lock,
  Gamepad2, Radio, Tv, Briefcase, LucideIcon,
  // New Additions (13)
  Mic, Speaker, Battery, Bluetooth, Signal, Mouse, Keyboard, 
  Printer, HardDrive, FolderOpen, FileCode, TerminalSquare, Command
} from 'lucide-react';

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
  ShoppingCart, CreditCard, Map, Coffee, Zap, Shield, Lock,
  // New Additions
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
    iconName: 'Calendar'
  },
  {
    id: 'comfy-meta',
    name: 'Comfy Meta',
    color: 'bg-amber-600',
    description: 'Metadata Viewer',
    url: 'https://comfy-metadata.vercel.app/',
    iconUrl: '',
    iconName: 'FileCode'
  },
  {
    id: '2d57b6e9-1472-4c7e-a735-7770b1c87326',
    name: 'Sonic Alchemy',
    url: 'https://sonic-alchemy.vercel.app/',
    color: 'bg-amber-800',
    description: '',
    iconUrl: '',
    iconName: 'Music'
  },
  {
    id: 'b236b1d4-09a6-4ca7-a873-0b5f2ea138a6',
    name: 'Png2Jpg Batchbox',
    url: 'https://png2jpg-batchbox.vercel.app/',
    color: 'bg-teal-600',
    description: '',
    iconUrl: '',
    iconName: 'Image'
  },
  {
    id: '27f478d3-020a-474c-82f0-536a8dea712c',
    name: 'Prisma Flow',
    url: 'https://prismaflow-sigma.vercel.app/',
    color: 'bg-indigo-600',
    description: '',
    iconUrl: '',
    iconName: 'Keyboard'
  }
];

// System apps that cannot be deleted, only hidden (conceptually)
export const SYSTEM_APPS: AppDefinition[] = [
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