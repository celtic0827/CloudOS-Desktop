# CloudOS Desktop

A React-based Web Desktop Environment (WebOS) designed with a "Low-key Luxury" aesthetic. It simulates a desktop operating system experience within the browser, featuring window management, a floating dock, and integrated application shortcuts.

## Project Overview

CloudOS Desktop acts as a unified dashboard for your web applications.

*   **Core Logic**: Mimics a desktop environment with window management and task switching.
*   **Design System**: "Low-key Luxury" theme using deep dark backgrounds (#050505), amber gold accents (#f59e0b), and glassmorphism effects.
*   **Persistence**: Uses `localStorage` to save your custom app shortcuts and configurations locally in your browser.

## Features

*   **Desktop Environment**:
    *   **Customizable Icons**: Add external links with auto-fetched favicons or choose from a built-in library of Lucide icons.
    *   **Drag-and-Drop Dock**: A floating navigation dock that can be positioned anywhere on the screen.
    *   **Live Clock**: Editorial-style clock widget with date display.
*   **App Management**:
    *   **Settings App**: A centralized hub to add, edit, or remove application shortcuts.
    *   **Backup & Restore**: Export your configuration to a JSON file and restore it on another device.
    *   **Visual Editor**: Real-time preview of icon colors and styles.
*   **WebFrame**:
    *   Launch external websites in a full-screen iframe environment (where supported by X-Frame-Options).
*   **AI Integration**:
    *   Built-in support for Google Gemini AI (via `GeminiChat` component, currently optional/hidden in default config).

## Tech Stack

*   **Framework**: React 18+ (Vite)
*   **Styling**: Tailwind CSS (Arbitrary values, Backdrop filters)
*   **Icons**: Lucide React
*   **AI SDK**: Google GenAI SDK (`@google/genai`)

## Key Components

*   `App.tsx`: The main orchestrator handling state, windows, and the background.
*   `components/desktop/DesktopIcon.tsx`: Renders the app shortcuts on the main screen.
*   `components/navigation/FloatingDock.tsx`: The draggable bottom bar for multitasking.
*   `components/apps/Settings.tsx`: The system preferences application.
*   `components/apps/WebFrame.tsx`: The container for external web apps.

## Usage

1.  **Add App**: Open Settings -> Click "+" -> Enter Name and URL.
2.  **Move Dock**: Grab the handle on the left of the dock and drag it to any position.
3.  **Switch Apps**: Click icons in the dock to switch between active windows.
4.  **Show Desktop**: Click the grid icon in the dock menu to minimize the active window.

## License

MIT
