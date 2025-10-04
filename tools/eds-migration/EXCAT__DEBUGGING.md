# EDS Debugging Guide

## Overview

This guide provides systematic debugging approaches for common issues in Adobe Edge Delivery Services (EDS) development and content migration.

## General Debugging Strategy

1. **Start with verification** - Confirm what works before investigating what doesn't
2. **Use multiple tools** - Browser console, curl, CLI tools, file inspection
3. **Compare working vs broken** - Find differences between working examples and broken ones
4. **Check each layer** - Source files, DA storage, rendered output, block code
5. **Verify timing** - Code changes need 3-5 seconds to sync to preview

## Common Issues

### Issue: Images Show "about:error"

**Symptom:** All images render with `src="about:error"` in the browser.

**Debugging Steps:**

1. **Verify image exists in git:**
   ```bash
   ls -la images/
   git log --oneline -- images/hero.webp
   ```

2. **Check CDN accessibility:**
   ```bash
   curl -I https://main--{repo}--{owner}.aem.page/images/hero.webp
   # Expected: HTTP/2 200
   ```

3. **Check DA storage:**
   ```bash
   node tools/eds-migration/cli.js dl-da \
     https://admin.da.live/source/{owner}/{repo}/path/page.html \
     --output downloaded.html

   # Inspect image paths
   grep -o 'src="[^"]*"' downloaded.html
   ```

4. **Check rendered output:**
   ```bash
   curl -s "https://main--{repo}--{owner}.aem.page/path/page" \
     | grep -o '<img[^>]*>' \
     | head -5
   ```

5. **Verify block implementation:**
   - Check block imports `createOptimizedPicture`
   - Confirm it's called on all images
   - Verify timing (after DOM restructuring)

**See:** [EXCAT__IMAGE_TROUBLESHOOTING.md](./EXCAT__IMAGE_TROUBLESHOOTING.md) for detailed solutions.

---

### Issue: Blocks Not Rendering

**Symptom:** Content appears as plain divs without block styling.

**Debugging Steps:**

1. **Check block name format:**
   ```bash
   # Download from DA and check block markup
   node tools/eds-migration/cli.js dl-da \
     https://admin.da.live/source/{owner}/{repo}/page.html \
     --output check.html

   # Look for block class names
   grep -o 'class="[^"]*"' check.html | grep -v "^$"
   ```

2. **Verify block exists:**
   ```bash
   ls -la blocks/{blockname}/
   # Should show: blockname.js and blockname.css
   ```

3. **Check block is decorated:**
   ```bash
   # In browser console
   document.querySelectorAll('[class*="block"]').forEach(b => {
     console.log(b.className, b.dataset);
   });
   ```

4. **Check for JavaScript errors:**
   - Open browser console (F12)
   - Look for red error messages
   - Check Network tab for failed JS loads

5. **Verify block export:**
   ```javascript
   // blocks/myblock/myblock.js should have:
   export default function decorate(block) {
     // decoration code
   }
   ```

---

### Issue: Markdown Table Formatting Errors

**Symptom:** Tables don't convert properly or appear as literal text in HTML.

**Debugging Steps:**

1. **Check column alignment:**
   ```bash
   # Use cat to see exact spacing
   cat content.md | grep -A 3 "^+"
   ```

2. **Count column markers:**
   - All `+` characters must align vertically
   - All `|` characters must align with `+` markers
   - Use a monospace editor for visual verification

3. **Validate table structure:**
   ```markdown
   # Correct format:
   +-------+-------+
   | **Block Name** |
   +-------+-------+
   | Cell  | Cell  |
   +-------+-------+

   # ❌ Wrong - misaligned markers:
   +-------+-------+
   | **Block Name** |
   +------+--------+
   ```

4. **Test conversion:**
   ```bash
   node tools/eds-migration/cli.js convert-html content.md \
     --url https://example.com \
     > test.html

   # Check for table artifacts
   grep -E '[\+\|]' test.html
   ```

---

### Issue: CSS Styles Not Applied

**Symptom:** Blocks appear unstyled or use default browser styles.

**Debugging Steps:**

1. **Check CSS file exists:**
   ```bash
   ls -la blocks/{blockname}/{blockname}.css
   ```

2. **Verify CSS loaded:**
   ```bash
   # Check Network tab in browser for CSS file
   # Or use curl:
   curl -I https://main--{repo}--{owner}.aem.page/blocks/{blockname}/{blockname}.css
   ```

3. **Check CSS syntax:**
   ```bash
   # Run linter
   npm run lint:css
   ```

4. **Verify class names:**
   ```javascript
   // In browser console
   document.querySelectorAll('.{blockname}').forEach(el => {
     console.log(el.className, getComputedStyle(el).display);
   });
   ```

5. **Check CSS specificity:**
   - Inspect element in browser DevTools
   - Look at Styles panel to see which rules apply
   - Check for !important overrides

---

### Issue: Code Changes Not Appearing

**Symptom:** After git push, changes don't show on preview site.

**Debugging Steps:**

1. **Verify commit and push:**
   ```bash
   git status
   git log --oneline -1
   git push
   ```

2. **Wait for sync:**
   ```bash
   # Code sync takes 3-5 seconds
   sleep 5
   ```

3. **Check code sync status:**
   ```bash
   # If using gh CLI
   gh run list --limit 3
   ```

4. **Hard refresh browser:**
   - Chrome/Firefox: Ctrl+Shift+R (Cmd+Shift+R on Mac)
   - Or clear browser cache

5. **Verify file on CDN:**
   ```bash
   # Check if updated file is served
   curl -s https://main--{repo}--{owner}.aem.page/blocks/{blockname}/{blockname}.js \
     | grep "your-new-code"
   ```

---

### Issue: Links Render as Buttons

**Symptom:** Regular navigation links appear styled as buttons.

**Debugging Steps:**

1. **Check DA HTML structure:**
   ```bash
   node tools/eds-migration/cli.js dl-da \
     https://admin.da.live/source/{owner}/{repo}/nav.html \
     --output nav-check.html

   # Look for button classes
   grep -E 'button|<p>' nav-check.html
   ```

2. **Check for `<p>` wrapper:**
   ```html
   <!-- DA may wrap links in <p> tags -->
   <li><p><a href="/about">About</a></p></li>
   <!-- This causes button styling -->
   ```

3. **Verify block removes button classes:**
   ```javascript
   // In header.js or nav block
   navSections.querySelectorAll('.button').forEach((button) => {
     button.className = ''; // Remove button class
     const buttonContainer = button.closest('.button-container');
     if (buttonContainer) buttonContainer.className = '';
   });
   ```

**See:** [NAVIGATION.md](./NAVIGATION.md) for detailed navigation debugging.

---

### Issue: Section Backgrounds Not Working

**Symptom:** Section Metadata block doesn't apply background colors.

**Debugging Steps:**

1. **Check CSS variable defined:**
   ```bash
   grep "background-sage" styles/styles.css
   ```

2. **Check section class exists:**
   ```bash
   grep "\.section\.background" styles/styles.css
   ```

3. **Verify metadata format:**
   ```markdown
   +-----------------------------------------------+
   | **Section Metadata**                          |
   +-----------------------------------------------+
   | Style (background-sage)                       |
   +-----------------------------------------------+
   ```

4. **Check rendered section:**
   ```javascript
   // In browser console
   document.querySelectorAll('.section').forEach(s => {
     console.log(s.className, getComputedStyle(s).backgroundColor);
   });
   ```

---

## Debugging Tools

### Browser Console Commands

```javascript
// Check all images and their load status
document.querySelectorAll('img').forEach(img => {
  console.log(img.src, img.complete, img.naturalWidth);
});

// Check all blocks
document.querySelectorAll('[class*="block"]').forEach(block => {
  console.log(block.className, block.children.length);
});

// Check loaded CSS files
Array.from(document.styleSheets).map(s => s.href);

// Check loaded JS files
Array.from(document.scripts).map(s => s.src);

// Get computed styles for an element
const el = document.querySelector('.my-block');
console.log(getComputedStyle(el));
```

### CLI Commands

```bash
# Download DA content
node tools/eds-migration/cli.js dl-da <url> --output file.html

# Upload to DA
node tools/eds-migration/cli.js upload-da file.html --owner X --repo Y --path Z

# Convert markdown to HTML
node tools/eds-migration/cli.js convert-html file.md --url https://example.com

# Check image accessibility
curl -I https://main--{repo}--{owner}.aem.page/images/photo.jpg

# Download rendered page
curl -s https://main--{repo}--{owner}.aem.page/path/page > rendered.html

# Check for errors in rendered HTML
grep -i "error\|404\|500" rendered.html
```

### Git Commands

```bash
# Check what changed
git diff

# Check commit history for a file
git log --oneline -- blocks/hero/hero.js

# See when file was last modified
git log -1 --format="%ai" -- images/photo.jpg

# Check current branch
git branch

# Verify remote
git remote -v
```

### Network Debugging

```bash
# Check response headers
curl -I <url>

# Check response body
curl -s <url>

# Check response with timing
curl -w "\nTime: %{time_total}s\n" -o /dev/null -s <url>

# Check SSL certificate
curl -vI https://main--repo--owner.aem.page 2>&1 | grep -i cert

# Test redirect
curl -L -I <url>
```

## Performance Debugging

### Check Lighthouse Scores

```bash
# Using Chrome DevTools
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Run audit for Mobile/Desktop
```

### Check Core Web Vitals

```javascript
// In browser console
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.startTime);
  }
}).observe({entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift']});
```

### Check Bundle Size

```bash
# Check size of JS files
ls -lh blocks/*/*.js scripts/*.js

# Check size of CSS files
ls -lh blocks/*/*.css styles/*.css

# Check total size served
curl -s https://main--{repo}--{owner}.aem.page/path \
  | wc -c
```

## Debugging Checklist

When encountering any issue, work through this checklist:

- [ ] Is the file committed to git?
- [ ] Did I wait 3-5 seconds after pushing?
- [ ] Is the file accessible on the CDN?
- [ ] Does the DA-stored version match what I uploaded?
- [ ] Does the rendered output match what DA stores?
- [ ] Are there any JavaScript errors in the console?
- [ ] Are all CSS/JS files loading (check Network tab)?
- [ ] Is the block name correctly formatted?
- [ ] Does the block have both .js and .css files?
- [ ] Did I hard refresh the browser?
- [ ] Is the issue reproducible in incognito mode?
- [ ] Does it work locally with `aem up`?

## Getting Help

If stuck after trying these steps:

1. **Check documentation:**
   - [EXCAT__AEM_EDS.md](./EXCAT__AEM_EDS.md) for EDS patterns
   - [EXCAT__IMAGE_TROUBLESHOOTING.md](./EXCAT__IMAGE_TROUBLESHOOTING.md) for image issues
   - [NAVIGATION.md](./NAVIGATION.md) for navigation issues

2. **Search AEM docs:**
   ```bash
   # Search documentation
   curl -s https://www.aem.live/docpages-index.json \
     | jq -r '.data[] | select(.content | test("KEYWORD"; "i")) | "\(.path): \(.title)"'
   ```

3. **Create minimal reproduction:**
   - Simplify to smallest failing case
   - Test on a new blank page
   - Isolate the specific block or feature

4. **Compare with working examples:**
   - Check aem-boilerplate blocks
   - Check aem-block-collection
   - Look at other EDS sites

## Preventive Measures

Avoid common issues by:

- ✅ Always test locally with `aem up` before committing
- ✅ Run `npm run lint` before pushing
- ✅ Commit images to git before referencing them
- ✅ Use markdown authoring instead of HTML upload
- ✅ Verify blocks call `createOptimizedPicture()` for images
- ✅ Keep block implementations simple and focused
- ✅ Use semantic HTML and proper ARIA attributes
- ✅ Test responsive behavior at different breakpoints
- ✅ Check browser console for errors regularly
- ✅ Use version control - commit frequently with clear messages

## Summary

Effective debugging requires:
1. **Systematic approach** - check each layer methodically
2. **Right tools** - use browser DevTools, CLI, curl, git
3. **Verification** - confirm assumptions at each step
4. **Documentation** - reference guides for patterns and solutions
5. **Patience** - wait for code sync, try multiple approaches

Most issues fall into these categories:
- **Path/URL problems** - verify file locations and CDN access
- **Timing issues** - wait for sync, clear cache
- **Format problems** - check markdown syntax, table alignment
- **Block issues** - verify implementation, check console
- **CSS/styling** - inspect elements, check specificity

When in doubt, start with the verification checklist and work through the debugging steps systematically.
