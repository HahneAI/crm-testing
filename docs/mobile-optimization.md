# Mobile Optimization Guidelines

This document provides guidelines for maintaining and extending the mobile optimization of the TradeSphere CRM application.

## 1. Responsive Design

All components should be designed with a mobile-first approach. Use Tailwind CSS's responsive utility variants (e.g., `md:`, `lg:`) to adapt layouts for different screen sizes.

## 2. Mobile-Specific Components

For complex UI patterns that require a different experience on mobile, create dedicated mobile components in the `src/components/mobile/` directory. Examples include:

- `MobileNav`
- `MobileHeader`
- `MobileCards`
- `MobileModal`

## 3. Touch-Friendly Interfaces

Ensure that all interactive elements are large enough to be easily tapped on a touch screen. Buttons and links should have adequate padding.

## 4. Performance

- **Lazy Loading**: Use `React.lazy()` to code-split and lazy-load components that are not immediately needed.
- **Image Optimization**: Compress and resize images to reduce their file size.
- **Bundle Size**: Regularly analyze the bundle size and identify opportunities for optimization.
