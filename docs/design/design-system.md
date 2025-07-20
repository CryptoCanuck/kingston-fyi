# Kingston.FYI Design System

## Overview

Kingston.FYI's design system is built on a sophisticated dark theme foundation with vibrant purple accents, creating a premium and modern interface for restaurant discovery. This system prioritizes readability, visual hierarchy, and elegant interactions while maintaining consistency across all touchpoints.

## Core Principles

1. **Dark-First Design**: Optimized for reduced eye strain and modern aesthetics
2. **Purple Accent Identity**: Strategic use of purple tones for brand recognition
3. **Card-Based Architecture**: Information organized in digestible, interactive cards
4. **Responsive Sidebar Navigation**: Adaptive navigation that scales gracefully
5. **Smooth Interactions**: Subtle animations that enhance user experience

## Color Palette

### Primary Colors

```css
/* Purple Accent Scale */
--purple-50: #faf5ff;
--purple-100: #f3e8ff;
--purple-200: #e9d5ff;
--purple-300: #d8b4fe;
--purple-400: #c084fc;
--purple-500: #a855f7;  /* Primary Purple */
--purple-600: #9333ea;
--purple-700: #7e22ce;
--purple-800: #6b21a8;
--purple-900: #581c87;
--purple-950: #3b0764;
```

### Dark Theme Foundation

```css
/* Background Colors */
--bg-primary: #0a0a0b;      /* Main background */
--bg-secondary: #111113;    /* Card backgrounds */
--bg-tertiary: #18181b;     /* Elevated surfaces */
--bg-hover: #1f1f23;        /* Hover states */

/* Surface Colors */
--surface-primary: #18181b;
--surface-secondary: #1f1f23;
--surface-tertiary: #27272a;
--surface-border: #27272a;
```

### Text Colors

```css
/* Text Hierarchy */
--text-primary: #fafafa;    /* Primary text */
--text-secondary: #a1a1aa;  /* Secondary text */
--text-tertiary: #71717a;   /* Muted text */
--text-inverse: #0a0a0b;   /* Text on light backgrounds */
```

### Semantic Colors

```css
/* Status Colors */
--success: #22c55e;
--success-bg: #14532d;
--warning: #f59e0b;
--warning-bg: #451a03;
--error: #ef4444;
--error-bg: #450a0a;
--info: #3b82f6;
--info-bg: #1e3a8a;
```

### Special Purpose

```css
/* Interactive Elements */
--accent-purple: #a855f7;
--accent-purple-hover: #9333ea;
--accent-purple-muted: rgba(168, 85, 247, 0.1);

/* Ratings */
--rating-star: #facc15;
--rating-star-bg: rgba(250, 204, 21, 0.1);
```

## Typography

### Font Families

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'JetBrains Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
```

### Type Scale

```css
/* Display */
--text-display-lg: 3.75rem;    /* 60px */
--text-display: 3rem;           /* 48px */
--text-display-sm: 2.25rem;     /* 36px */

/* Headings */
--text-h1: 1.875rem;            /* 30px */
--text-h2: 1.5rem;              /* 24px */
--text-h3: 1.25rem;             /* 20px */
--text-h4: 1.125rem;            /* 18px */

/* Body */
--text-lg: 1.125rem;            /* 18px */
--text-base: 1rem;              /* 16px */
--text-sm: 0.875rem;            /* 14px */
--text-xs: 0.75rem;             /* 12px */
```

### Font Weights

```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights

```css
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

## Spacing System

Based on an 8px grid system for consistency:

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

## Layout Grid

### Container Widths

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

### Grid System

```css
/* 12-column grid */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}

/* Responsive breakpoints */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

## Shadow & Elevation

### Dark Theme Shadows

```css
/* Elevation levels */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 0 rgba(0, 0, 0, 0.4);
--shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

/* Purple glow for special elements */
--shadow-purple: 0 0 30px rgba(168, 85, 247, 0.3);
--shadow-purple-lg: 0 0 60px rgba(168, 85, 247, 0.4);
```

### Elevation Scale

1. **Base Level**: Default cards and surfaces
2. **Raised**: Hover states and interactive elements
3. **Floating**: Dropdowns and tooltips
4. **Modal**: Overlays and dialogs

## Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem;   /* 4px */
--radius-base: 0.5rem;  /* 8px */
--radius-md: 0.75rem;   /* 12px */
--radius-lg: 1rem;      /* 16px */
--radius-xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

## Animation & Transitions

### Duration

```css
--duration-instant: 0ms;
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
--duration-slower: 500ms;
```

### Easing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Standard Transitions

```css
/* Default transition */
--transition-base: all var(--duration-normal) var(--ease-out);

/* Specific transitions */
--transition-colors: colors var(--duration-fast) var(--ease-out);
--transition-transform: transform var(--duration-normal) var(--ease-out);
--transition-opacity: opacity var(--duration-normal) var(--ease-out);
--transition-shadow: box-shadow var(--duration-normal) var(--ease-out);
```

## Z-Index Scale

```css
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-overlay: 300;
--z-modal: 400;
--z-popover: 500;
--z-tooltip: 600;
--z-notification: 700;
--z-maximum: 999;
```

## Implementation Guidelines

### CSS Custom Properties Setup

```css
:root {
  /* All design tokens as CSS custom properties */
  /* Colors, typography, spacing, etc. */
}

[data-theme="dark"] {
  /* Dark theme specific overrides */
}
```

### Utility Classes

```css
/* Background utilities */
.bg-primary { background-color: var(--bg-primary); }
.bg-secondary { background-color: var(--bg-secondary); }
.bg-tertiary { background-color: var(--bg-tertiary); }

/* Text utilities */
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.text-tertiary { color: var(--text-tertiary); }

/* Purple accent utilities */
.text-purple { color: var(--accent-purple); }
.bg-purple { background-color: var(--accent-purple); }
.border-purple { border-color: var(--accent-purple); }
```

### Dark Theme Best Practices

1. **Contrast Ratios**: Maintain WCAG AA compliance (4.5:1 for normal text)
2. **Surface Elevation**: Use lighter backgrounds for elevated elements
3. **Border Usage**: Subtle borders to define boundaries in dark UI
4. **Color Vibrancy**: Slightly muted colors to prevent eye strain
5. **Purple Accents**: Use sparingly for maximum impact

## Accessibility Considerations

1. **Focus States**: High contrast purple outline for keyboard navigation
2. **Color Contrast**: All text meets WCAG AA standards
3. **Motion Preferences**: Respect `prefers-reduced-motion`
4. **Dark Mode Toggle**: Allow users to switch themes
5. **Semantic Colors**: Consistent meaning across the system