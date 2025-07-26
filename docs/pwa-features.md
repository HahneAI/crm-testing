# PWA Features

This document outlines the Progressive Web App (PWA) features implemented in the TradeSphere CRM application.

## 1. Web App Manifest

The `public/manifest.json` file provides the core metadata for the PWA, enabling it to be installed on a user's home screen. Key properties include:

- **`name`** and **`short_name`**: "TradeSphere CRM" and "TradeSphere".
- **`display`**: `standalone` for an app-like feel.
- **`theme_color`** and **`background_color`**: Consistent with the app's branding.
- **`start_url`**: `/dashboard`.
- **`icons`**: A set of icons for various device resolutions.

## 2. Service Worker

The `public/sw.js` service worker provides offline capabilities by caching the application shell. The caching strategy is as follows:

- **Cache First**: For core assets like HTML, CSS, and JavaScript, the service worker will first try to serve them from the cache. If a resource is not in the cache, it will be fetched from the network.
- **Offline Fallback**: If the network is unavailable, the service worker will serve a user-friendly `offline.html` page.

## 3. Installation Prompts

The application is configured to prompt users to install the PWA on their devices, providing a seamless, native-app-like experience. This is handled by the Vite PWA plugin and the service worker registration in `src/main.tsx`.
