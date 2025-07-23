# Performance Monitoring Guide

This guide details the performance monitoring utilities implemented in the TradeSphere CRM application.

## 1. Core Web Vitals

Core Web Vitals are tracked using the `web-vitals` library. The `src/utils/performance/WebVitals.ts` utility reports on:

- **Largest Contentful Paint (LCP)**
- **First Input Delay (FID)**
- **Cumulative Layout Shift (CLS)**

These metrics are displayed on the **Performance Dashboard**.

## 2. AI Response Time Monitoring

The `src/utils/performance/AIResponseMonitor.ts` utility tracks the response times of AI-related network requests.

- **Threshold**: An alert is triggered if a response takes longer than 3 seconds.
- **Alerts**: A toast notification is displayed to the user, and a message is logged to the console.

## 3. Performance Alerts

The `src/utils/performance/PerformanceAlerts.ts` utility provides a centralized way to send performance-related alerts. Alerts can be categorized by severity (`low`, `medium`, `high`) and are displayed as toast notifications.
