# EDS Image Handling: Troubleshooting & Best Practices

## Overview

This document captures critical learnings about image handling in Adobe Edge Delivery Services (EDS) and Document Authoring (DA), particularly around common issues and their solutions.

## Critical Understanding

**EDS is designed for markdown-based authoring, not direct HTML upload.** While HTML upload is technically possible, it bypasses the normal content pipeline and can cause issues with images and complex blocks.

## How EDS Image Processing Works

### The createOptimizedPicture Function

Located in `scripts/aem.js`, this function is fundamental to EDS image handling:

```javascript
createOptimizedPicture(src, alt, eager, breakpoints)
```

**What it does:**
1. Extracts the pathname from the source URL using `new URL(src, window.location.href)`
2. Creates responsive `<picture>` elements with multiple `<source>` tags
3. Adds optimization parameters: `?width=750&format=webp&optimize=medium`
4. Generates both WebP and fallback format sources
5. Returns a complete `<picture>` element ready for insertion

**Example transformation:**
```javascript
// Input
<img src="/images/photo.jpg" alt="Photo">

// Output
<picture>
  <source type="image/webp" srcset="/images/photo.jpg?width=2000&format=webply&optimize=medium" media="(min-width: 600px)">
  <source type="image/webp" srcset="/images/photo.jpg?width=750&format=webply&optimize=medium">
  <source srcset="/images/photo.jpg?width=2000&format=jpg&optimize=medium" media="(min-width: 600px)">
  <img src="/images/photo.jpg?width=750&format=jpg&optimize=medium" alt="Photo" loading="lazy">
</picture>
```

### Block Decoration Pattern

Blocks should call `createOptimizedPicture()` during decoration:

**Standard Pattern:**
```javascript
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // 1. Restructure DOM first
  // ... your block logic ...

  // 2. Optimize images AFTER DOM restructuring
  block.querySelectorAll('picture > img').forEach((img) => {
    const newPicture = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(newPicture);
  });
}
```

**Why this order matters:**
- DA may already wrap images in `<picture>` elements
- We need to extract the `img.src` before processing
- The function creates a new optimized `<picture>` to replace the old one
- Always restructure DOM before optimizing images

## Common Issue: Images Show "about:error"

### Symptom
All images render with `src="about:error"` instead of actual image paths.

### Root Causes

1. **Direct HTML Upload to DA**
   - HTML upload bypasses the normal EDS content pipeline
   - Path resolution in blocks expects markdown-authored content
   - DA's HTML processing doesn't align with direct upload

2. **Missing or Incorrect createOptimizedPicture Calls**
   - If blocks don't process images, they may not render correctly
   - Double-processing can also cause issues

3. **Invalid Image Paths**
   - Paths that don't resolve to actual files
   - Paths that work in DA but not in rendering pipeline

### Solutions That DON'T Work

❌ Using absolute URLs to `.aem.page` or `.aem.live`
❌ Uploading images to DA `/media/` folder (path resolution issues)
❌ Removing `createOptimizedPicture()` calls from blocks
❌ Manual HTML manipulation after DA processing

### Solutions That DO Work

✅ **Author content in markdown format**
✅ **Edit directly in DA's UI** (not upload HTML)
✅ **Use relative paths** from markdown (e.g., `/images/photo.jpg`)
✅ **Store images in git** repository
✅ **Let DA convert markdown to HTML**
✅ **Ensure blocks call createOptimizedPicture()**

## Recommended Image Workflow

### For New Content

1. **Store images in git:**
   ```bash
   # Add images to repository
   git add images/hero.webp images/card-1.jpg
   git commit -m "Add page images"
   git push
   ```

2. **Verify images are accessible:**
   ```bash
   # Should return HTTP/2 200
   curl -I https://main--{repo}--{owner}.aem.page/images/hero.webp
   ```

3. **Create markdown with relative paths:**
   ```markdown
   +-----------------------------------------------+
   | **Hero**                                      |
   +-----------------------------------------------+
   | ![Hero image](/images/hero.webp)              |
   +-----------------------------------------------+
   | # **Welcome**                                 |
   |                                               |
   | Description text here                         |
   +-----------------------------------------------+
   ```

4. **Author in DA's UI or import markdown:**
   - Use DA's editor interface
   - Or use DA's import functionality for markdown
   - Do NOT upload converted HTML

### For Migrated Content

When migrating from other sites:

1. **Download images locally:**
   ```bash
   wget https://example.com/images/photo.jpg -O images/photo.jpg
   ```

2. **Commit to git:**
   ```bash
   git add images/photo.jpg
   git commit -m "Add migrated image: photo.jpg"
   git push
   ```

3. **Reference in markdown with relative paths:**
   ```markdown
   ![Alt text](/images/photo.jpg)
   ```

4. **Create/edit page in DA's UI:**
   - Do NOT use HTML upload
   - Author markdown blocks directly in DA
   - Preview to verify images load

## Block Implementation Best Practices

### Cards Block Example

```javascript
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // 1. Transform to ul/li structure
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    // Classify divs
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });
    ul.append(li);
  });

  // 2. Optimize images AFTER restructuring
  ul.querySelectorAll('picture > img').forEach((img) => {
    const newPicture = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(newPicture);
  });

  // 3. Replace block content
  block.replaceChildren(ul);
}
```

### Columns Block Example

```javascript
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // 1. Setup image column classes
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // 2. Optimize pictures AFTER classification
  block.querySelectorAll('picture > img').forEach((img) => {
    const newPicture = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(newPicture);
  });
}
```

## Debugging Image Issues

### Step 1: Verify Image Exists in Git

```bash
# Check if image is committed
ls -la images/

# Check if accessible via CDN
curl -I https://main--{repo}--{owner}.aem.page/images/photo.jpg
# Should return: HTTP/2 200
```

### Step 2: Check DA Storage

```bash
# Download content from DA
node tools/eds-migration/cli.js dl-da \
  https://admin.da.live/source/{owner}/{repo}/path/to/page.html \
  --output downloaded.html

# Inspect image paths in DA-stored content
grep -o 'src="[^"]*"' downloaded.html
```

### Step 3: Check Rendered Output

```bash
# Download rendered page
curl -s "https://main--{repo}--{owner}.aem.page/path/to/page" \
  -o rendered.html

# Check for about:error
grep "about:error" rendered.html

# Check actual image sources
grep -o '<img[^>]*src="[^"]*"[^>]*>' rendered.html
```

### Step 4: Verify Block Code

1. Check block imports `createOptimizedPicture`
2. Verify it's called on all images
3. Confirm it's called AFTER DOM restructuring
4. Test locally with `aem up`

### Step 5: Check Browser Console

If testing in browser:
```javascript
// In browser console
document.querySelectorAll('img').forEach(img => {
  console.log(img.src, img.complete, img.naturalWidth);
});
```

## DA Upload Behavior

### What DA Does to Uploaded HTML

When you upload HTML to DA:

1. **Wraps images in `<picture>` elements:**
   ```html
   <!-- Your upload -->
   <img src="/images/photo.jpg" alt="Photo">

   <!-- DA stores -->
   <picture>
     <source srcset="/images/photo.jpg">
     <source srcset="/images/photo.jpg" media="(min-width: 600px)">
     <img src="/images/photo.jpg" alt="Photo" loading="lazy">
   </picture>
   ```

2. **Adds responsive sources** with media queries
3. **Adds lazy loading** attributes
4. **May transform paths** in unpredictable ways

### Known Limitations of HTML Upload

- ❌ Image path resolution can fail
- ❌ Complex blocks may not render correctly
- ❌ Optimization parameters may not be applied
- ❌ Not the intended authoring workflow
- ❌ Harder to debug when issues occur

### Recommended: Use DA's UI Instead

Instead of uploading HTML:
1. Create a new document in DA's web interface
2. Use the block editor to add content
3. Paste markdown if needed
4. Let DA handle the conversion

## Git vs DA Media Storage

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **Git `/images/`** | ✅ Version controlled<br>✅ Reliable CDN delivery<br>✅ Works with relative paths | ⚠️ Requires git commit/push<br>⚠️ Larger repo size | **Recommended** for most cases |
| **DA `/media/`** | ✅ Uploaded via API<br>✅ No git commit needed | ❌ Path resolution issues<br>❌ Less reliable<br>❌ Harder to debug | Avoid for now |

## Section Styling with Background Colors

When adding section backgrounds:

### 1. Define CSS Variables

In `styles/styles.css`:
```css
:root {
  /* Section backgrounds */
  --background-sage: #e8f0e8;
  --background-grey: #f5f5f5;
}
```

### 2. Create Section Classes

```css
main .section.background-sage {
  background-color: var(--background-sage);
  margin: 0;
  padding: 40px 0;
}

main .section.background-grey {
  background-color: var(--background-grey);
  margin: 0;
  padding: 40px 0;
}
```

### 3. Use Section Metadata Block

In your markdown:
```markdown
+-----------------------------------------------+
| **Section Metadata**                          |
+-----------------------------------------------+
| Style (background-sage)                       |
+-----------------------------------------------+

[Your content blocks here]
```

The `Style (background-sage)` metadata gets converted to a class on the section wrapper.

## CLI Tools for Debugging

### Upload HTML to DA
```bash
node tools/eds-migration/cli.js upload-da content.html \
  --owner myorg \
  --repo myrepo \
  --path pages/my-page.html
```

### Download from DA to Verify
```bash
node tools/eds-migration/cli.js dl-da \
  https://admin.da.live/source/myorg/myrepo/pages/my-page.html \
  --output downloaded.html
```

### Convert Markdown to HTML
```bash
node tools/eds-migration/cli.js convert-html content.md \
  --url https://example.com \
  > content.html
```

### Upload Images to DA Media (Not Recommended)
```bash
curl -X POST "https://admin.da.live/source/owner/repo/media/image.jpg" \
  -H "Authorization: Bearer $DA_BEARER_TOKEN" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@images/image.jpg"
```

## When to Use Each Approach

### Use Markdown Authoring When:
- ✅ Starting a new page from scratch
- ✅ Content has images and complex blocks
- ✅ You want the most reliable workflow
- ✅ You're following EDS best practices

### Use HTML Upload When:
- ⚠️ Content is very simple (text only)
- ⚠️ No images or media elements
- ⚠️ You understand the limitations
- ⚠️ For testing/experimentation only

### Use DA's UI When:
- ✅ Authors need to edit content regularly
- ✅ You want WYSIWYG editing
- ✅ Content includes images and blocks
- ✅ This is the production workflow

## Summary: The Image Success Formula

1. **Store images in git** at `/images/`
2. **Verify accessibility** with curl
3. **Author in markdown** with relative paths
4. **Use DA's UI** to create/edit pages
5. **Ensure blocks import and call** `createOptimizedPicture()`
6. **Process images AFTER** DOM restructuring
7. **Test locally** with `aem up` before committing
8. **Commit code changes** and wait 3-5 seconds for sync

**Avoid:** Direct HTML upload, absolute URLs, DA media folder, manual picture element creation.

**Follow:** Markdown → DA UI → Git images → Block decoration → createOptimizedPicture
