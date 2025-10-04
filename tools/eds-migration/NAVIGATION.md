# Navigation Setup and Management for AEM Edge Delivery Services

## Overview

This document provides comprehensive guidance for setting up and managing navigation in Adobe Edge Delivery Services (EDS) projects. It covers the navigation structure, content authoring in Document Authoring (DA), and troubleshooting common issues.

## Navigation Structure

### Three-Section Architecture

The header block implementation expects navigation content structured in exactly **3 sections**:

1. **Brand Section** (`nav-brand`) - Logo and primary branding link
2. **Sections Section** (`nav-sections`) - Main navigation menu with optional dropdowns
3. **Tools Section** (`nav-tools`) - Utility links (e.g., Subscribe, Login, Cart)

This structure is enforced by the header block's JavaScript (`blocks/header/header.js` lines 122-126):

```javascript
const classes = ['brand', 'sections', 'tools'];
classes.forEach((c, i) => {
  const section = nav.children[i];
  if (section) section.classList.add(`nav-${c}`);
});
```

**Important:** Do not change this 3-section structure. When migrating navigation from other sites, map the content to fit within these three sections.

## Content Authoring in Document Authoring

### File Location

Navigation content is authored in `/nav.html` in Document Authoring (DA).

### Content Structure Example

```html
<body>
  <header></header>
  <main>
    <!-- Section 1: Brand -->
    <div>
      <p><a href="/">Fashion Blog</a></p>
      <p><br></p>
    </div>

    <!-- Section 2: Main Navigation -->
    <div>
      <ul>
        <li>
          <p>Trends</p>
          <ul>
            <li><a href="/fashion-insights">Streetwear</a></li>
            <li><a href="/fashion-insights">Sporty</a></li>
            <li><a href="/fashion-insights">Party</a></li>
          </ul>
        </li>
        <li><a href="/fashion-trends-of-the-season">About</a></li>
        <li><a href="/fashion-insights">Blog</a></li>
        <li>
          <p>Support</p>
          <ul>
            <li><a href="/faq">Contact</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
        </li>
      </ul>
      <p><br></p>
    </div>

    <!-- Section 3: Tools -->
    <div>
      <p><a href="#">Subscribe</a></p>
    </div>
  </main>
  <footer></footer>
</body>
```

### Authoring Guidelines

1. **Maintain 3 `<div>` elements** in `<main>` - one for each navigation section
2. **Dropdowns** - Use nested `<ul>` with parent text in `<p>` tags:
   ```html
   <li>
     <p>Dropdown Label</p>
     <ul>
       <li><a href="/link1">Item 1</a></li>
       <li><a href="/link2">Item 2</a></li>
     </ul>
   </li>
   ```
3. **Simple Links** - Wrap in `<li>` without nested `<ul>`:
   ```html
   <li><a href="/about">About</a></li>
   ```

## Common Issue: Links Rendering as Buttons

### Problem Description

Navigation links may render as blue buttons instead of regular text links.

**Visual symptom:** Links like "About" and "Blog" appear with button styling (blue background, padding, rounded corners).

### Root Cause

Document Authoring (DA) automatically wraps certain links in `<p>` tags during the upload/save process:

**Input to DA:**
```html
<li><a href="/about">About</a></li>
```

**Output from DA:**
```html
<li><p><a href="/about">About</a></p></li>
```

When EDS processes this HTML:
- Links within `<p>` tags get converted to `.button` class
- Parent `<p>` becomes `.button-container` class
- Result: Link displays as a button

### Solution Implementation

The header block (`blocks/header/header.js`) includes code to strip button classes from navigation links.

**Code location:** Lines 135-144

```javascript
const navSections = nav.querySelector('.nav-sections');
if (navSections) {
  // Remove button classes from all links in nav-sections
  navSections.querySelectorAll('.button').forEach((button) => {
    button.className = '';
    const buttonContainer = button.closest('.button-container');
    if (buttonContainer) {
      buttonContainer.className = '';
    }
  });

  navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
    // ... rest of navigation logic
  });
}
```

This solution:
1. Finds all elements with `.button` class in `nav-sections`
2. Removes the `button` class from the link
3. Finds the closest `.button-container` parent
4. Removes the `button-container` class from the parent

**Note:** The same pattern is applied to the brand section (lines 128-133) to handle the logo link.

### Why This Approach Works

- **Non-intrusive:** Doesn't require changing DA content authoring
- **Maintainable:** Authors can work naturally without worrying about button classes
- **Robust:** Handles DA's automatic `<p>` wrapping behavior
- **Extensible:** Can be applied to other navigation sections if needed

## Updating Navigation Content

### Process Overview

1. **Analyze source navigation** - Identify structure and content from the original site
2. **Map to 3 sections** - Determine best fit for Brand, Sections, and Tools
3. **Create HTML structure** - Build content with proper nesting for dropdowns
4. **Upload to DA** - Use CLI tool to upload to `/nav.html`
5. **Test in preview** - Verify links render correctly without button styling

### CLI Commands

#### Download current navigation
```bash
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/{owner}/{repo}/nav.html --output nav-backup.html
```

#### Upload updated navigation
```bash
node tools/eds-migration/cli.js upload-da ./nav-updated.html --owner {owner} --repo {repo} --path nav.html
```

### Example: Mapping Complex Navigation

**Source site navigation:**
- Logo
- Products (dropdown: Product A, Product B, Product C)
- Solutions (dropdown: Enterprise, SMB)
- Resources
- Blog
- About
- Contact
- Login
- Cart

**Mapping to 3 sections:**

**Section 1 (Brand):**
- Logo link

**Section 2 (Sections):**
- Products (dropdown)
- Solutions (dropdown)
- Resources
- Blog
- About
- Contact

**Section 3 (Tools):**
- Login
- Cart

## Testing Navigation Changes

### 1. Local Testing

Start the development server:
```bash
npx -y @adobe/aem-cli up --no-open
```

Open: `http://localhost:3000/`

**Check:**
- Navigation structure displays correctly
- Dropdowns expand/collapse on click
- Links are clickable and route correctly
- No links have button styling

### 2. Preview Environment Testing

After committing changes:
```bash
git add blocks/header/header.js
git commit -m "Update navigation"
git push
```

Wait ~3-5 seconds for deployment, then test:
```
https://main--{repo}--{owner}.aem.page/
```

### 3. DOM Inspection

Use browser console or Playwright to verify link classes:

```javascript
const nav = document.getElementById('nav');
const navSections = nav.querySelector('.nav-sections');
const links = navSections.querySelectorAll('a');
Array.from(links).map(link => ({
  text: link.textContent.trim(),
  classes: link.className,
  parentClasses: link.parentElement.className
}));
```

**Expected result:**
- All links should have `classes: ""`
- All links should have `parentClasses: ""` (or no button-related classes)

### 4. Visual Inspection

Take full-page screenshot and verify:
- Links appear as regular text (not buttons)
- Hover states work correctly
- Mobile hamburger menu functions properly
- Dropdown menus display and hide correctly

## Troubleshooting

### Issue: Changes not appearing in preview

**Cause:** Code changes not committed to git

**Solution:**
```bash
git status  # Check for uncommitted changes
git add blocks/header/header.js
git commit -m "Fix navigation"
git push
```

### Issue: Dropdowns not working

**Cause:** Incorrect HTML structure in `/nav.html`

**Check:**
- Dropdown label should be in `<p>` tag
- Dropdown items should be in nested `<ul>`
- Parent `<li>` should wrap both `<p>` and `<ul>`

**Correct structure:**
```html
<li>
  <p>Dropdown Label</p>
  <ul>
    <li><a href="#">Item</a></li>
  </ul>
</li>
```

### Issue: Navigation not loading at all

**Cause:** `/nav.html` file missing or corrupted in DA

**Solution:**
1. Download current nav: `dl-da` command
2. Verify HTML structure is valid
3. Re-upload if necessary: `upload-da` command

### Issue: Mobile menu not working

**Cause:** JavaScript not executing or CSS not loaded

**Check:**
- Browser console for errors
- `blocks/header/header.css` loaded
- `blocks/header/header.js` loaded without errors
- Hamburger icon visible on mobile viewport

## Best Practices

### DO:
- ✅ Keep the 3-section structure
- ✅ Use semantic HTML (ul/li for menus)
- ✅ Test on mobile and desktop viewports
- ✅ Commit and push header.js changes when modifying navigation logic
- ✅ Backup `/nav.html` before major changes
- ✅ Use consistent URL patterns across navigation

### DON'T:
- ❌ Don't modify the 3-section structure
- ❌ Don't manually try to prevent DA from wrapping links
- ❌ Don't add custom CSS classes in DA content
- ❌ Don't nest blocks within navigation
- ❌ Don't forget to test after changes

## Reference Files

- **Navigation Content:** `/nav.html` in Document Authoring
- **Header Block JS:** `/blocks/header/header.js` (lines 110-175)
- **Header Block CSS:** `/blocks/header/header.css`
- **CLI Tool:** `/tools/eds-migration/cli.js` (upload-da, dl-da commands)
- **DA Integration:** `/tools/eds-migration/EXCAT__AEM_DA.md`

## Related Documentation

- [EDS Header Block](https://www.aem.live/developer/block-collection/header)
- [Document Authoring Guide](EXCAT__AEM_DA.md)
- [Agentic Workflow](EXCAT__AGENTIC_WORKFLOW.md)
- [AEM Edge Delivery Documentation](https://www.aem.live/docs/)

## Case Study: WKND Trendsetters Navigation

### Original Site Analysis

Source: https://www.wknd-trendsetters.site/

**Navigation structure identified:**
- Logo: "Fashion Blog"
- Main menu:
  - Trends (dropdown: Streetwear, Sporty, Party, Tennis, Beach, Festival)
  - About
  - Blog
  - Support (dropdown: Contact, FAQ)
- Tools: Subscribe

### Mapping Decision

**Section 1 (Brand):**
- Fashion Blog (logo link)

**Section 2 (Sections):**
- Trends dropdown with 6 items
- About
- Blog
- Support dropdown with 2 items

**Section 3 (Tools):**
- Subscribe

### Implementation

1. Created `/nav.html` structure with proper nesting
2. Uploaded to DA using: `upload-da nav.html --path nav.html`
3. DA automatically wrapped About and Blog links in `<p>` tags
4. Links initially rendered as buttons
5. header.js button removal code (lines 137-144) stripped button classes
6. Committed changes to git
7. Tested in preview - all links render correctly

### Lessons Learned

- DA's `<p>` wrapping is automatic and unavoidable
- Solution must be in JavaScript, not DA content
- Testing after git commit is essential (local changes don't appear in preview)
- DOM inspection is valuable for debugging class issues

## Summary

Navigation in EDS projects follows a strict 3-section structure that must be maintained. Document Authoring automatically wraps content in ways that can cause styling issues, but these are handled by the header block's JavaScript. When updating navigation:

1. Map content to 3 sections
2. Author HTML with proper structure
3. Upload to DA
4. Commit any header.js changes
5. Test thoroughly in preview environment

The current implementation handles DA's quirks automatically, allowing authors to work naturally without worrying about button styling issues.
