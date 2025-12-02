# CloudOS Desktop

A React-based Web Desktop Environment (WebOS) designed with a "Low-key Luxury" aesthetic. It simulates a desktop operating system experience within the browser, featuring window management, a smart navigation dock, and persistent app shortcuts.

## Project Overview

CloudOS Desktop acts as a unified dashboard for your web applications, providing a focused, premium interface for managing your digital workflow.

*   **Core Logic**: Mimics a desktop environment with window management and task switching.
*   **Design System**: "Low-key Luxury" theme using deep dark backgrounds (#050505), amber gold accents (#f59e0b), and advanced glassmorphism effects.
*   **Persistence**: Uses `localStorage` to save your custom app shortcuts and dock position locally in your browser.
*   **PWA Support**: Installable as a standalone application on desktop and mobile devices.

## Features

*   **Desktop Environment**:
    *   **Customizable Icons**: Add external links with auto-fetched favicons or choose from a built-in library of 80+ Lucide icons.
    *   **Smart Floating Dock**: A draggable, single-button "Assistive Touch" style dock that expands into a shortcut menu. It remembers its position across sessions.
    *   **Live Clock**: Editorial-style clock widget with date display and sophisticated typography.
*   **App Management**:
    *   **Settings App**: A centralized hub to add, edit, or remove application shortcuts with a rich color picker and icon library.
    *   **Backup & Restore**: Export your configuration to a JSON file and restore it on another device.
    *   **Default Suite**: Comes pre-configured with useful tools (Creator Sync, Comfy Meta, Sonic Alchemy, etc.).
*   **WebFrame**:
    *   Launch external websites in a full-screen iframe environment (where supported by X-Frame-Options).
*   **Progressive Web App (PWA)**:
    *   Can be installed to the host OS.
    *   Runs in a standalone window without browser chrome (URL bar, tabs).
    *   Offline caching for core assets.

## Tech Stack

*   **Framework**: React 18+ (Vite)
*   **Styling**: Tailwind CSS (Arbitrary values, Backdrop filters, Gradients)
*   **Icons**: Lucide React
*   **PWA**: Vite Plugin PWA

## Key Components

*   `App.tsx`: The main orchestrator handling state, windows, and the background.
*   `components/desktop/DesktopIcon.tsx`: Renders the app shortcuts on the main screen.
*   `components/navigation/FloatingDock.tsx`: The draggable FAB (Floating Action Button) for multitasking.
*   `components/apps/Settings.tsx`: The system preferences application.
*   `components/apps/WebFrame.tsx`: The container for external web apps.

## Usage

1.  **Add App**: Open Settings -> Click "+" -> Enter Name and URL.
2.  **Move Dock**: Drag the floating button to any position on the screen. It supports "Click to Expand" and "Drag to Move" gestures.
3.  **Switch Apps**: Click the dock button when an app is open to switch or close it.
4.  **Install**: Click the install icon in your browser address bar to run as a native-like app.

## License

MIT