# Agentic Web Content Processing Workflow

## Overview
This workflow transforms web pages into structured content using Adobe Edge Delivery Services (EDS) block library. It processes web content through multiple AI agents to extract, analyze, map, convert content into various formats and upload to Adobe AEM DA.

In case you are being asked to migrate multiple pages, just execute this workflow in sequence for each URL.

## Quick Reference Workflow

1. **Scrape** (Playwright) → Screenshot + YAML + HTML ✓
2. **Analyze** → Identify structure (header/footer/content) ✓
3. **Map** → content.md (using block library) ✓
4. **Validate** → Check table alignment ⚠️ CRITICAL
5. **Convert** → content.html ✓
6. **Review HTML** → Verify conversion ⚠️ CRITICAL
7. **Upload** → DA ✓
8. **Verify** → Check rendered page ⚠️ CRITICAL
9. **Implement Blocks** (Optional) → Add missing block implementations 🔧

**If any step fails, return to previous step and fix**

---

## Detailed Workflow Steps

### 1. Web Scraping Agent
**Purpose**: Extract HTML content and visual context from web pages. Do not try to do any analysis on the content for now, you just need to extract the HTML.

**Actions**:
- Navigate to the target URL using a headless browser (Playwright/Puppeteer)
- Wait for page to fully load (networkidle2)
- Scroll through the page to trigger lazy-loaded content
- Take a screenshot of the full page without trying to set a filename for it, just take default full page screenshot
- Remove all useless DOM elements (script, style, ...)
- Extract the complete HTML body content
- Keep the browser open in case we need it later

**Output**: Page State YAML, screenshot, and HTML body

---

### 2. Content Analysis
**Purpose**: Analyze page structure and identify content sections before mapping

**Actions**:
- Analyze the Page State YAML content and the screenshot of the webpage (using AI vision capabilities)
- Identify and note header elements (banner, navigation) to exclude
- Identify and note footer elements (contentinfo) to exclude
- Identify main content sections and their visual hierarchy
- Note all media elements (images, videos, SVGs) with their URLs
- **Pay special attention to the visual layout in the screenshot**:
  - Are images side-by-side (Columns)?
  - Are images in a rotating display (Carousel)?
  - Are images part of card grids (Cards)?
  - Is there a single hero section with text and optional single background image (Hero)?
- Preserve exact text content without adding or removing any content

**Critical**: The screenshot is the source of truth for layout decisions. The DOM structure may suggest one thing, but the visual layout determines the correct block mapping.

**Output**: Mental model of page structure (no file output - proceed directly to mapping)

---

### 3. EDS Mapping Agent
**Purpose**: Map content to EDS block structures in Markdown format. Use block descriptions to find the best match and example structures to represent the content in tables like in the examples. Put free content that is not part of block structures as free content not in tables.

**Actions**:
- Analyze the page structure and screenshot against available block types
- Map content sections to appropriate EDS blocks from the block library
- Ensure proper block hierarchy and relationships
- Handle complex content structures and nested elements
- Generate markdown representation using EDS block syntax

**Important Rules**:
- File `@./tools/eds-migration/sta-boilerplate-block-library-no-images.json` contains a set of EDS blocks you have to use for the mapping. The JSON structure contains description and examples for each block so you better understand how to map the content.
- Use `+` and `-` characters for table borders
- Use `|` characters for column separators
- Follow the exact format pattern from the examples in the block library
- The header row should be bold and merged (if multiple columns)
- Blocks cannot be nested in other blocks
- The content in cells can be a full Markdown document again
- Cell boundaries (`|`) need to exactly match with the column markers (`+`) in the row delimiters

**Critical Table Formatting Rules**:
- ✅ Column markers (`+`) MUST align EXACTLY across all rows
- ✅ Long URLs in cells should be on a single line to avoid breaking
- ✅ Images MUST be on their own line within cells to render properly
- ✅ Multi-line content in cells is OK, but pipe (`|`) characters must align with column markers
- ✅ Count characters if alignment looks off - precision matters
- ❌ DO NOT split image URLs across multiple lines
- ❌ DO NOT include header/footer content in blocks
- ❌ DO NOT nest blocks (blocks cannot contain other blocks)
- ❌ DO NOT misalign column markers vertically

**Example of block table format**:
```
+-----------------------------------------------+
| **Block Name**                                |
+===============================================+
| Content in first cell                         |
+-----------------------------------------------+
| Content in second cell                        |
+-----------------------------------------------+
```

**Example of two-column block**:
```
+---------------------------------------+---------------------------------------+
| **Block Name**                                                                |
+---------------------------------------+---------------------------------------+
| ![image](https://example.com/img.jpg) | **Heading**                           |
|                                       |                                       |
|                                       | Description text here                 |
|                                       |                                       |
|                                       | [Link text](/path)                    |
+---------------------------------------+---------------------------------------+
```

**Output**: Markdown content using EDS block syntax => save it to `./content.md` (just overwrites if file already exists)

---

### 4. Markdown Validation (CRITICAL)
**Purpose**: Verify markdown formatting before conversion to catch issues early

**Actions**:
- Visually inspect table column alignment in content.md
- Verify all image URLs are complete and on single lines
- Check that block table headers use correct format (`**Block Name**`)
- Ensure no header/footer content leaked into body blocks
- Look for any malformed table structures (misaligned `+` or `|`)
- Verify block names match the library exactly (case-sensitive)

**If issues found**:
- Fix `content.md` manually
- Repeat this validation step
- Do NOT proceed to conversion until validation passes

---

### 5. HTML Conversion Agent
**Purpose**: Convert EDS markdown to semantic HTML

**Actions**:
- Process the EDS markdown through Adobe Helix HTML Pipeline
- Apply proper HTML structure and semantics
- Handle URL processing (make relative URLs absolute)
- Generate clean, semantic HTML output
- Ensure proper accessibility and structure

**CLI Tool Available**: `tools/eds-migration/cli.js convert-html`
```bash
# Convert markdown to HTML with URL processing and saves it to content.html
node tools/eds-migration/cli.js convert-html ./content.md --url https://example.com > ./content.html
```

**IMPORTANT - Review HTML Output**:
After conversion, verify:
- ✅ Images render as `<img>` tags, not plain text
- ✅ Block structures have proper class names (e.g., `class="cards"`, `class="hero"`)
- ✅ No table syntax appears as literal text (no `+` or `|` characters in output)
- ✅ All URLs are absolute
- ❌ NO markdown syntax visible in HTML (no `![alt](url)`)
- ❌ NO raw table borders in output

**If conversion fails**:
- Return to Step 4 (Validation) to fix markdown formatting
- Common issue: Column alignment in tables

**Output**: Semantic HTML content => `content.html`

---

### 6. Upload to Document Authoring Agent
**Purpose**: Upload converted content to Adobe Document Authoring

⚠️ **IMPORTANT - Known Limitations of HTML Upload**:
Direct HTML upload to DA can cause issues with:
- Images may not render correctly (show as "about:error")
- Complex blocks may not process properly
- Path resolution can fail in unpredictable ways

**Recommended Alternative for Production**:
Instead of HTML upload, use DA's web interface to:
1. Create a new document in DA
2. Use the block editor or paste markdown
3. Let DA handle the conversion natively

**For Learning/Testing Only**:
HTML upload can be used for simple content without images.

**Actions**:
- Generate upload path from git repository information (organization + repo) and from original URL
- Upload HTML content to Document Authoring platform
- Handle authentication and API calls
- Provide upload confirmation and URL
- Navigate to the uploaded URL to verify rendering

**Before Upload - Prepare Images**:
1. **Download images locally:**
   ```bash
   # Download images from source site
   wget https://example.com/images/photo.jpg -O images/photo.jpg
   ```

2. **Commit to git:**
   ```bash
   git add images/photo.jpg
   git commit -m "Add page images"
   git push
   ```

3. **Verify accessibility:**
   ```bash
   curl -I https://main--{repo}--{owner}.aem.page/images/photo.jpg
   # Should return HTTP/2 200
   ```

**CLI Tool Available**: `tools/eds-migration/cli.js upload-da`
```bash
# Upload HTML to Adobe Document Authoring
node tools/eds-migration/cli.js upload-da ./content.html --owner myorg --repo myrepo --prefix content --url https://example.com
```

**Success Verification**:
After upload, check:
- ✅ Blocks render correctly with proper styling
- ✅ Images load and display (NOT "about:error")
- ✅ No raw markdown visible
- ✅ No table syntax visible
- ✅ All links work

**If Images Show "about:error"**:
See **[EXCAT__IMAGE_TROUBLESHOOTING.md](./EXCAT__IMAGE_TROUBLESHOOTING.md)** for detailed debugging steps.

Common fixes:
- Ensure images are committed to git and accessible
- Verify blocks call `createOptimizedPicture()`
- Consider using DA's UI instead of HTML upload

**Note**: Re-uploading to the same path overwrites the previous version (useful for corrections)

**Output**: Upload confirmation and URL

---

### 7. Block Implementation (Optional)
**Purpose**: Identify and implement any missing blocks used in the migrated content

**When to use**:
- After successfully uploading content to DA
- When blocks from the imported content are not yet implemented in the project
- To ensure the migrated page renders correctly with proper block functionality

**Actions**:

1. **Identify blocks used in migration**
   - Review the `content.md` file to list all blocks used
   - Common blocks include: Hero, Columns, Cards, Tabs, Accordion, Carousel, Video, etc.

2. **Check existing implementations**
   ```bash
   ls -la blocks/
   ```
   - Compare the list of used blocks against existing block directories
   - Identify which blocks are missing

3. **Source block implementations** (in priority order)
   - **Priority 1: Adobe AEM Boilerplate** - `https://github.com/adobe/aem-boilerplate/tree/main/blocks`
     - Standard blocks that come with the boilerplate
   - **Priority 2: Adobe Block Collection** - `https://github.com/adobe/aem-block-collection/tree/main/blocks`
     - Community-contributed blocks with common patterns
     - Use raw GitHub URLs to fetch source code:
       ```bash
       https://raw.githubusercontent.com/adobe/aem-block-collection/main/blocks/{blockname}/{blockname}.js
       https://raw.githubusercontent.com/adobe/aem-block-collection/main/blocks/{blockname}/{blockname}.css
       ```
   - **Priority 3: Block Party** - Search for existing EDS websites with similar blocks
   - **Priority 4: Custom Implementation** - Only if no suitable implementation exists

4. **Add block to project**
   ```bash
   # Create block directory
   mkdir -p blocks/{blockname}

   # Add JavaScript file
   # blocks/{blockname}/{blockname}.js

   # Add CSS file
   # blocks/{blockname}/{blockname}.css
   ```

5. **Verify block structure**
   - Each block should have a `decorate(block)` function as default export
   - CSS should follow EDS naming conventions (`.blockname .blockname-element`)
   - No external dependencies beyond `aem.js` utilities
   - Mobile-first responsive design
   - ARIA accessibility attributes

**Example: Adding Tabs Block**

```javascript
// blocks/tabs/tabs.js
import { toClassName } from '../../scripts/aem.js';

export default async function decorate(block) {
  // Create tab navigation
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  // Process each tab panel
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);
    const tabpanel = block.children[i];

    // Set up ARIA attributes and event handlers
    // ... (see Adobe Block Collection for full implementation)
  });

  block.prepend(tablist);
}
```

```css
/* blocks/tabs/tabs.css */
.tabs .tabs-list {
  display: flex;
  gap: 0.5ch;
  overflow-x: auto;
}

.tabs .tabs-list button {
  padding: 0.5em;
  background-color: var(--light-color);
  border: 1px solid #dadada;
}

.tabs .tabs-panel[aria-hidden='true'] {
  display: none;
}
```

**Best Practices**:
- ✅ Always prefer official Adobe block implementations
- ✅ Keep blocks simple and focused on single responsibility
- ✅ Use semantic HTML and ARIA attributes for accessibility
- ✅ Follow mobile-first responsive design patterns
- ✅ Avoid external dependencies (jQuery, etc.)
- ✅ Test blocks locally before committing
- ❌ DO NOT modify blocks from Adobe repos - copy and adapt if needed
- ❌ DO NOT add complex JavaScript frameworks
- ❌ DO NOT skip accessibility features

**Output**: New block directories in `blocks/` with `.js` and `.css` files

---

## Common Issues & Solutions

### Images Not Rendering
**Symptom**: Image markdown appears as text like `![alt](url)`

**Cause**: URL split across multiple lines in table or improper cell formatting

**Fix**:
- Ensure image URLs are on a single line within table cells
- Check column markers align properly
- Return to Step 3 and fix the markdown

### Table Syntax Appears as Text
**Symptom**: Plus signs (`+`) and pipes (`|`) render in HTML

**Cause**: Column markers not properly aligned in markdown

**Fix**:
- Align all `+` and `|` characters vertically in the markdown
- Use a monospace editor to check alignment
- Count characters to ensure precision
- Return to Step 3 and fix the markdown

### Block Not Recognized
**Symptom**: Content renders as plain divs without block classes

**Cause**: Block name format incorrect or table structure malformed

**Fix**:
- Verify block name matches library exactly (case-sensitive)
- Check table has proper header row with `**Block Name**`
- Ensure header is separated with `=` characters
- Return to Step 3 and fix the markdown

### Content from Header/Footer Included
**Symptom**: Navigation or footer links appear in main content

**Cause**: Didn't properly identify header/footer sections in Step 2

**Fix**:
- Review page state YAML
- Exclude `banner` and `contentinfo` elements
- Exclude navigation elements at top and bottom
- Return to Step 2 and re-analyze structure

### Block Class Missing in HTML
**Symptom**: HTML has correct structure but no `class="blockname"` attribute

**Cause**: Block name in markdown doesn't match expected format

**Fix**:
- Verify first row of table contains only `**Block Name**` or `**Block Name (variant)**`
- No other content should be in the header row
- Return to Step 3 and fix the markdown

### Multiple Images in Hero Block
**Symptom**: Hero block contains multiple images that should be displayed side-by-side

**Cause**: Incorrect block mapping - Hero blocks should have either a single background image or no images

**Solution**:
Hero blocks in EDS typically support one of these patterns:
1. **Text only** (no images) - heading, description, CTAs
2. **Single background image** with text overlay

**When you see multiple images near hero content:**
- **Review the visual layout** carefully using the screenshot
- **Check if images are side-by-side** below or beside the text
- **Map accordingly**:
  - If images are side-by-side: Use **Columns block** for the images (separate from Hero)
  - If images are in a rotating/sliding display: Use **Carousel block**
  - If images are part of a card grid: Use **Cards block**

**Example of correct mapping:**
```markdown
+---------------------------------------------------------------+
| **Hero**                                                      |
+---------------------------------------------------------------+
| # **Main Heading**                                            |
| Description text here                                         |
| [CTA Link](/path)                                             |
+---------------------------------------------------------------+

+---------------------------------------------------------------+---------------------------------------------------------------+
| **Columns**                                                                                                                   |
+---------------------------------------------------------------+---------------------------------------------------------------+
| ![First image](url1)                                          | ![Second image](url2)                                         |
+---------------------------------------------------------------+---------------------------------------------------------------+
```

**Key Learning**: Always analyze the visual layout (screenshot) to understand the actual structure, not just the DOM hierarchy. Multiple images appearing together are rarely part of a Hero block—they usually belong to Columns, Carousel, or Cards blocks.

### Buttons Not Rendering as Styled Buttons
**Symptom**: Links that appear as styled buttons on the original site render as plain text links in EDS

**Cause**: Buttons need specific markdown formatting to be recognized and styled by EDS

**Solution**:

In EDS, buttons must be wrapped with `**` (strong emphasis) around the link:

```markdown
**[Button Text](/url)**
```

**Important Rules for Button Formatting:**

1. **Single buttons** - Wrap link with `**`:
   ```markdown
   **[Browse](/fashion-insights)**
   ```

2. **Multiple buttons side-by-side** - Place each button on its own line:
   ```markdown
   **[See more](/fashion-insights)**

   **[Lookbook](/fashion-trends-of-the-season)**
   ```

   ❌ **DO NOT** place multiple buttons on the same line:
   ```markdown
   **[Button 1](/url1)** **[Button 2](/url2)**
   ```
   This may render as plain links instead of styled buttons.

3. **Buttons inside blocks** - Use the same format within block table cells:
   ```markdown
   +---------------------------------------------------------------+
   | **Hero**                                                      |
   +---------------------------------------------------------------+
   | # **Heading**                                                 |
   |                                                               |
   | Description text here                                         |
   |                                                               |
   | **[Call to Action](/path)**                                   |
   +---------------------------------------------------------------+
   ```

4. **Multiple buttons in blocks** - Place each on a separate line with empty line between:
   ```markdown
   +---------------------------------------------------------------+
   | **Hero**                                                      |
   +---------------------------------------------------------------+
   | # **Heading**                                                 |
   |                                                               |
   | Description text                                              |
   |                                                               |
   | **[Primary Button](/path1)**                                  |
   |                                                               |
   | **[Secondary Button](/path2)**                                |
   +---------------------------------------------------------------+
   ```

**Known Limitation**: Even with proper formatting, buttons inside certain blocks (like Hero) or consecutive buttons outside blocks may not always render with button styling due to EDS's button decoration logic in `scripts.js`. The formatting above provides the best chance for buttons to be styled correctly, but some contexts may require custom CSS or JavaScript decoration rules.

**When mapping content:**
- Identify all clickable elements that appear as styled buttons on the original site
- Use the screenshot to visually confirm button styling
- Apply the `**[text](url)**` format to ensure they have the best chance of rendering as buttons
- Place buttons on separate lines when multiple appear together

---

## Key Features

### Multi-Model Support
- Support for multiple AI models (Azure OpenAI, AWS Bedrock)
- Model selection via command line or API
- Fallback to environment-configured models

### Error Handling
- Robust error handling at each step
- Graceful degradation (e.g., continue with HTML if screenshot fails)
- Detailed error reporting and logging
- Validation checkpoints to catch issues early

### Content Processing
- Handles dynamic/lazy-loaded content
- Preserves exact text content
- Maintains structural relationships
- Processes media content (images, videos, SVGs)

### Output Formats
- EDS Markdown with block structures
- Semantic HTML with proper block classes
- Optional Document Authoring upload

---

## Usage Context for Claude

When executing this workflow, you should:

1. **Use web scraping tools** (like Playwright) to extract HTML and screenshots
2. **Apply AI vision capabilities** to analyze both text and visual content
3. **Reference the EDS block library** to understand available block types
4. **Map content systematically** to appropriate EDS blocks
5. **Validate thoroughly** before converting to HTML
6. **Use CLI tools for final processing**:

   ```bash
   # Convert to HTML with URL processing
   node tools/eds-migration/cli.js convert-html ./content.md --url https://example.com > content.html

   # Upload to Document Authoring
   node tools/eds-migration/cli.js upload-da ./content.html --owner myorg --repo myrepo --prefix pages --url https://example.com

   # Download from Document Authoring for review (optional)
   node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/pages/content.html --output downloaded.html
   ```

7. **Generate clean outputs** in the requested formats
8. **Verify the uploaded content** renders correctly in DA

### Best Practices for Tool Usage

- **Never ever run `npm install`** in `tools/eds-migration/`! Never try to do `cd tools/eds-migration/`
- **Use absolute paths** for all file operations
- **Verify each step** before proceeding to the next
- **Keep the browser open** during the entire process (may need to reference the page)
- **Review HTML output** before uploading to catch conversion issues early
- **Test the uploaded page** in DA to verify all blocks render correctly
- **Use monospace editor** to check markdown table alignment
- **Be precise with formatting** - column alignment is critical
- **Use the help command** (`node tools/eds-migration/cli.js help`) when unsure about syntax

---

## Validation Checklist

Use this checklist to ensure quality at each step:

**After Step 3 (Mapping)**:
- [ ] All column markers (`+`) align vertically
- [ ] All pipe characters (`|`) align with column markers
- [ ] Image URLs are complete and on single lines
- [ ] No header/footer content in blocks
- [ ] Block names match library exactly
- [ ] No nested blocks
- [ ] Hero block has either single background image OR text only (no multiple images)
- [ ] Multiple side-by-side images are mapped to Columns block (not Hero)

**After Step 5 (Conversion)**:
- [ ] Images appear as `<img>` tags
- [ ] Blocks have proper class attributes
- [ ] No markdown syntax visible
- [ ] No table characters (`+`, `|`) visible
- [ ] All URLs are absolute

**After Step 6 (Upload)**:
- [ ] Page loads without errors
- [ ] All blocks render with correct styling
- [ ] Images display correctly
- [ ] Links are functional
- [ ] No raw HTML or markdown visible

**After Step 7 (Block Implementation)** (if applicable):
- [ ] All blocks used in content.md have corresponding implementations in `blocks/`
- [ ] Each block has both `.js` and `.css` files
- [ ] JavaScript exports a default `decorate()` function
- [ ] CSS follows EDS naming conventions
- [ ] Blocks are sourced from official Adobe repositories when possible
- [ ] No external dependencies beyond `aem.js` utilities
- [ ] Blocks include ARIA accessibility attributes

---

The workflow is designed to be modular, allowing each step to be executed independently or as part of the complete pipeline. Always validate thoroughly at each checkpoint to catch issues early.
