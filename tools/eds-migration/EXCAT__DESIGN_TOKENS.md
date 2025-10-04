# EDS Design Tokens Guide

## Overview

This guide provides a comprehensive reference for design tokens in Adobe Edge Delivery Services (EDS) projects. Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes such as colors, typography, spacing, and more.

## Purpose

When adapting an EDS project to match an existing design system, you need to:

1. **Identify** the design tokens in the target design system
2. **Map** those values to EDS CSS custom properties
3. **Apply** consistently across all blocks and styles

This document serves as both a reference for existing tokens and a template for adaptation.

## Visual Reference

A comprehensive visual mockup of all design tokens is available at:

**File:** `tools/eds-migration/design-tokens-visual-reference.html`

**To view:**
```bash
open -a "Google Chrome" tools/eds-migration/design-tokens-visual-reference.html
```

This mockup displays all design tokens with live examples including color swatches, typography samples, buttons, spacing, and block implementations.

## Design Token Categories

### 1. Colors

Colors form the foundation of visual identity. All color tokens should be defined in `:root` in `styles/styles.css`.

```css
:root {
  /* Primary colors */
  --background-color: white;
  --text-color: #131313;

  /* Accent colors */
  --light-color: #f8f8f8;
  --dark-color: #505050;

  /* Interactive colors */
  --link-color: #3b63fb;
  --link-hover-color: #1d3ecf;
}
```

**What to look for in existing design:**
- Primary brand color(s)
- Background colors (light/dark variants)
- Text colors (primary, secondary, muted)
- Link colors (default, hover, visited)
- Success, error, warning colors (if applicable)
- Border colors
- Shadow colors

### 2. Typography - Font Families

Font families define the typographic personality of the design.

```css
:root {
  --body-font-family: roboto, roboto-fallback, sans-serif;
  --heading-font-family: roboto-condensed, roboto-condensed-fallback, sans-serif;
}
```

**What to look for in existing design:**
- Body/paragraph font family
- Heading font family (may be same as body)
- Monospace font (for code blocks)
- Font loading strategy (web fonts vs system fonts)

**Important:** Always include fallback fonts for performance.

### 3. Typography - Font Sizes

Font sizes should be responsive and semantic.

```css
:root {
  /* Body sizes */
  --body-font-size-m: 22px;    /* Default body text */
  --body-font-size-s: 19px;    /* Small text */
  --body-font-size-xs: 17px;   /* Extra small text */

  /* Heading sizes */
  --heading-font-size-xxl: 55px;  /* h1 */
  --heading-font-size-xl: 44px;   /* h2 */
  --heading-font-size-l: 34px;    /* h3 */
  --heading-font-size-m: 27px;    /* h4 */
  --heading-font-size-s: 24px;    /* h5 */
  --heading-font-size-xs: 22px;   /* h6 */
}

@media (width >= 900px) {
  :root {
    --body-font-size-m: 18px;
    --body-font-size-s: 16px;
    --body-font-size-xs: 14px;

    --heading-font-size-xxl: 45px;
    --heading-font-size-xl: 36px;
    --heading-font-size-l: 28px;
    --heading-font-size-m: 22px;
    --heading-font-size-s: 20px;
    --heading-font-size-xs: 18px;
  }
}
```

**What to look for in existing design:**
- Base font size (usually 16px or 18px)
- Scale ratio (how sizes relate to each other)
- Mobile vs desktop sizes
- Line heights for different sizes
- Whether sizes are fixed or responsive

**Best Practice:** Use mobile-first approach with larger sizes on mobile, smaller on desktop (better for readability on small screens).

### 4. Typography - Weights & Line Heights

```css
body {
  line-height: 1.6;  /* Body line height */
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;      /* Heading weight */
  line-height: 1.25;     /* Heading line height */
}

header nav .nav-sections ul > li {
  font-weight: 500;  /* Nav item weight */
}

a.button:any-link, button {
  font-weight: 500;  /* Button font weight */
}
```

**What to look for in existing design:**
- Body text line height (usually 1.5-1.7)
- Heading line height (usually 1.1-1.3)
- Font weights used (light: 300, regular: 400, medium: 500, semibold: 600, bold: 700)
- Special weights for UI elements (buttons, navigation)

### 5. Spacing & Margins

Consistent spacing creates rhythm and hierarchy.

```css
/* Heading margins */
h1, h2, h3, h4, h5, h6 {
  margin-top: 0.8em;
  margin-bottom: 0.25em;
  scroll-margin: 40px;  /* For anchor links */
}

/* Block element margins */
p, dl, ol, ul, pre, blockquote {
  margin-top: 0.8em;
  margin-bottom: 0.25em;
}

/* Section spacing */
main > div {
  margin: 40px 16px;  /* Mobile */
}

main > .section {
  margin: 40px 0;
}

/* Card spacing */
.cards > ul {
  gap: 24px;  /* Grid gap */
}

.cards .cards-card-body {
  margin: 16px;  /* Inner padding */
}
```

**What to look for in existing design:**
- Base spacing unit (often 4px, 8px, or 16px)
- Spacing scale (e.g., 8, 16, 24, 32, 48, 64)
- Vertical rhythm between elements
- Grid gaps
- Component inner padding
- Section spacing (top/bottom)

**Best Practice:** Use a consistent spacing scale based on a base unit (e.g., multiples of 8px).

### 6. Layout Dimensions

```css
:root {
  --nav-height: 64px;
}

main > .section > div {
  max-width: 1200px;  /* Content max-width */
  margin: auto;
  padding: 0 24px;    /* Mobile horizontal padding */
}

@media (width >= 900px) {
  main > .section > div {
    padding: 0 32px;  /* Desktop horizontal padding */
  }
}
```

**What to look for in existing design:**
- Content max-width (container width)
- Header/navigation height
- Sidebar widths (if applicable)
- Horizontal padding (mobile vs desktop)
- Breakpoints for responsive design

### 7. Borders & Radius

```css
:root {
  --border-width-thin: 1px;
  --border-width-medium: 2px;
  --border-radius-small: 4px;
  --border-radius: 8px;
}

a.button:any-link, button {
  border: 2px solid transparent;
  border-radius: 2.4em;  /* Pill-shaped buttons */
}

.cards > ul > li {
  border: 1px solid #dadada;
}

pre {
  border-radius: 8px;
}
```

**What to look for in existing design:**
- Border widths (thin, medium, thick)
- Border radius values (sharp, slightly rounded, fully rounded)
- Border colors (often from color palette)
- Which elements have borders (cards, inputs, buttons, etc.)
- Consistent radius across similar elements

### 8. Button Styles

Buttons are critical interactive elements requiring careful token definition.

```css
a.button:any-link, button {
  /* Spacing */
  margin: 12px 0;
  padding: 0.5em 1.2em;

  /* Borders */
  border: 2px solid transparent;
  border-radius: 2.4em;

  /* Typography */
  font-family: var(--body-font-family);
  font-weight: 500;
  line-height: 1.25;
  text-align: center;

  /* Colors */
  background-color: var(--link-color);
  color: var(--background-color);

  /* Behavior */
  cursor: pointer;
  text-decoration: none;
}

a.button:hover, button:hover {
  background-color: var(--link-hover-color);
}

a.button.secondary, button.secondary {
  background-color: unset;
  border: 2px solid currentcolor;
  color: var(--text-color);
}

button:disabled {
  background-color: var(--light-color);
  cursor: unset;
}
```

**What to look for in existing design:**
- Button padding (vertical and horizontal)
- Button border radius (rounded corners or pill-shaped)
- Button colors (primary, secondary, tertiary)
- Hover states (color changes, shadows, transforms)
- Disabled state styling
- Button sizes (if multiple sizes exist)
- Icon button styling (if applicable)

### 9. Grid & Layout Patterns

```css
.cards > ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(257px, 1fr));
  gap: 24px;
}

.cards > ul > li img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}
```

**What to look for in existing design:**
- Grid column counts (2, 3, 4 columns)
- Minimum card/item width
- Grid gaps
- Image aspect ratios
- Object fit strategy (cover, contain, etc.)

### 10. Navigation Specific

```css
header nav {
  gap: 0 24px;      /* Mobile nav gap */
  max-width: 1248px;
  padding: 0 24px;  /* Mobile nav padding */
}

@media (width >= 900px) {
  header nav {
    gap: 0 32px;    /* Desktop nav gap */
    padding: 0 32px;
  }

  header nav .nav-sections ul {
    gap: 24px;  /* Desktop nav items gap */
  }

  header nav .nav-sections .default-content-wrapper > ul > li > ul {
    width: 200px;                        /* Dropdown width */
    padding: 16px;                       /* Dropdown padding */
    background-color: var(--light-color);  /* Dropdown background */
  }
}

header nav .nav-sections ul {
  font-size: var(--body-font-size-s);  /* Nav font size */
}
```

**What to look for in existing design:**
- Navigation item spacing
- Dropdown menu width
- Dropdown menu styling (background, padding, shadows)
- Mobile menu styling
- Navigation font size and weight
- Active/hover states for nav items

### 11. Section Variants

```css
main .section.light,
main .section.highlight {
  background-color: var(--light-color);
  margin: 0;
  padding: 40px 0;
}
```

**What to look for in existing design:**
- Section background variations
- Section padding for different variants
- Alternating section colors
- Special section styles (highlighted, featured, etc.)

### 12. Effects (Shadows, Transitions)

```css
:root {
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition-speed: 0.2s;
}

a {
  transition: color var(--transition-speed);
}

.cards > ul > li {
  box-shadow: var(--shadow-sm);
}
```

**What to look for in existing design:**
- Box shadows (size, color, blur)
- Text shadows (if any)
- Transition durations
- Animation timings
- Hover effects

## Adaptation Workflow

### Step 1: Audit Existing Design System

1. **Gather design specifications:**
   - Design system documentation
   - Figma/Sketch files
   - Brand guidelines
   - Style guide PDFs

2. **Identify token values:**
   - Extract colors (use browser inspector or design tools)
   - Measure spacing (use browser inspector)
   - Identify font families and sizes
   - Note border radius and shadows

3. **Document breakpoints:**
   - Mobile breakpoint
   - Tablet breakpoint
   - Desktop breakpoint

### Step 2: Map to EDS Tokens

1. **Update `styles/styles.css` `:root` section:**
   ```css
   :root {
     /* Map design system colors to EDS tokens */
     --background-color: [their background color];
     --text-color: [their primary text color];
     --link-color: [their link/primary color];
     /* ... etc */
   }
   ```

2. **Update responsive breakpoints if different:**
   ```css
   /* Change 900px to match design system breakpoint */
   @media (width >= 900px) {
     /* ... */
   }
   ```

3. **Update typography:**
   ```css
   body {
     font-family: var(--body-font-family);
     font-size: var(--body-font-size-m);
     line-height: [their line height];
   }
   ```

### Step 3: Update Block-Specific Styles

After updating global tokens, review each block and update any hard-coded values to use tokens:

**Before:**
```css
.cards > ul > li {
  border: 1px solid #dadada;
  background-color: white;
}
```

**After:**
```css
.cards > ul > li {
  border: var(--border-width-thin) solid var(--color-border);
  background-color: var(--background-color);
}
```

### Step 4: Test Across Breakpoints

1. **Test locally:**
   ```bash
   npx -y @adobe/aem-cli up --no-open
   ```

2. **Test at different viewport sizes:**
   - Mobile: 375px, 414px
   - Tablet: 768px, 834px
   - Desktop: 1024px, 1440px, 1920px

3. **Verify:**
   - ✅ Typography scales correctly
   - ✅ Colors are consistent
   - ✅ Spacing feels balanced
   - ✅ Buttons look correct
   - ✅ Navigation works at all sizes

### Step 5: Document Custom Tokens

If you add custom tokens not in the base EDS template, document them:

```css
:root {
  /* Custom tokens for [project name] */
  --color-accent: #ff6b35;
  --color-success: #28a745;
  --color-error: #dc3545;
  --spacing-xs: 8px;
  --spacing-sm: 16px;
  --spacing-md: 24px;
  --spacing-lg: 40px;
  --spacing-xl: 64px;
}
```

## Token Naming Conventions

Follow these conventions for consistency:

### Color Tokens
- `--color-[purpose]`: e.g., `--color-primary`, `--color-secondary`
- `--background-color-[variant]`: e.g., `--background-color-alt`
- `--text-color-[variant]`: e.g., `--text-color-light`, `--text-color-muted`

### Typography Tokens
- `--font-family-[context]`: e.g., `--font-family-body`, `--font-family-heading`
- `--font-size-[size]`: e.g., `--font-size-base`, `--font-size-small`
- `--font-weight-[weight]`: e.g., `--font-weight-normal`, `--font-weight-bold`

### Spacing Tokens
- `--spacing-[size]`: e.g., `--spacing-xs`, `--spacing-sm`, `--spacing-md`
- `--gap-[context]`: e.g., `--gap-cards`, `--gap-nav`

### Layout Tokens
- `--width-[context]`: e.g., `--width-content`, `--width-sidebar`
- `--height-[context]`: e.g., `--height-nav`, `--height-footer`

### Border Tokens
- `--border-width-[size]`: e.g., `--border-width-thin`, `--border-width-thick`
- `--border-radius-[size]`: e.g., `--border-radius-small`, `--border-radius-large`

### Effect Tokens
- `--shadow-[size]`: e.g., `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- `--transition-[property]`: e.g., `--transition-speed`, `--transition-ease`

## Best Practices

### 1. Keep Tokens Semantic

✅ **Good:**
```css
--color-primary: #3b63fb;
--color-success: #28a745;
```

❌ **Bad:**
```css
--color-blue: #3b63fb;
--color-green: #28a745;
```

**Why:** Semantic names describe purpose, not appearance. This allows colors to change without renaming variables.

### 2. Use Tokens Consistently

Always use tokens instead of hard-coded values:

✅ **Good:**
```css
.my-block {
  color: var(--text-color);
  background: var(--background-color);
  padding: var(--spacing-md);
}
```

❌ **Bad:**
```css
.my-block {
  color: #131313;
  background: white;
  padding: 24px;
}
```

### 3. Maintain a Single Source of Truth

All tokens should be defined in `styles/styles.css` `:root` section. Blocks should only reference tokens, not define them.

### 4. Document Responsive Values

When tokens change at breakpoints, document both values:

```css
:root {
  /* Mobile: 22px, Desktop: 18px */
  --body-font-size-m: 22px;
}

@media (width >= 900px) {
  :root {
    --body-font-size-m: 18px;
  }
}
```

### 5. Test Token Changes Globally

When changing a token value, test all pages and blocks since tokens are global.

## Tools & Resources

### Visual Reference
- `tools/eds-migration/design-tokens-visual-reference.html` - Interactive mockup of all tokens

### Extraction Tools
- Browser DevTools Inspector - For measuring and extracting values from existing sites
- Figma/Sketch - For extracting values from design files
- Browser extensions like "CSS Peeper" - For extracting CSS values

### Testing
```bash
# Start local development server
npx -y @adobe/aem-cli up --no-open

# Run linting
npm run lint

# Access preview environment
https://main--{repo}--{owner}.aem.page/
```

## Common Token Patterns

### Dark Mode Support

If the design system supports dark mode, use CSS custom properties that can be overridden:

```css
:root {
  --background-color: white;
  --text-color: #131313;
  --border-color: #dadada;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background-color: #1a1a1a;
    --text-color: #f0f0f0;
    --border-color: #404040;
  }
}
```

### Theme Variants

For sites with multiple themes or brands:

```css
:root {
  /* Default theme */
  --color-primary: #3b63fb;
}

body.theme-alt {
  --color-primary: #ff6b35;
}
```

## Summary

Design tokens provide a scalable, maintainable approach to styling EDS projects. Key principles:

1. **Define once, use everywhere** - All tokens in `styles/styles.css`
2. **Semantic naming** - Describe purpose, not appearance
3. **Responsive by default** - Use media queries for different viewport sizes
4. **Document thoroughly** - Comment token purposes and values
5. **Test globally** - Token changes affect entire project

Use the visual reference mockup and this guide as your starting point when adapting an EDS project to match an existing design system.
