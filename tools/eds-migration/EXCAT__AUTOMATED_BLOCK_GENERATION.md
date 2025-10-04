# Automated Block Generation Workflow

## Overview

This document describes the automated workflow for generating EDS blocks from existing web pages. The workflow analyzes page structure, captures screenshots, identifies reusable block patterns, and generates complete block implementations with proper naming and code reuse.

## Workflow Steps

### Step 1: Page Analysis & Screenshot Capture

**Objective:** Navigate to source page and capture visual and structural information for each content section.

**Actions:**
1. Navigate to the target page using Playwright
2. Identify distinct content sections by analyzing DOM structure:
   - Look for semantic HTML sections (`<section>`, `<article>`, etc.)
   - Identify repeating patterns (grids, cards, carousels)
   - Distinguish between free content and structured blocks
3. For each identified block section:
   - Take element-specific screenshot using `mcp__playwright__browser_take_screenshot` with `element` and `ref` parameters
   - Save with descriptive names (e.g., `section-hero-banner.png`, `section-service-cards.png`)
4. Extract full page HTML for structure analysis

**Output:**
- Multiple PNG screenshots (one per block)
- Page HTML for reference
- DOM structure analysis notes

---

### Step 1.5: Visual Layout Analysis (CRITICAL)

**TL;DR:** Count items per row BEFORE coding. Document exact layout pattern (fixed grid vs flexible wrapping). Use this analysis as reference when writing CSS.

---

**Objective:** Explicitly analyze and document the visual layout BEFORE writing any code.

**MANDATORY for all blocks with repeating items (cards, logos, grids, carousels):**

**Actions:**
1. **Count items per row** in the screenshot:
   - Example: "5 logos in first row, 4 logos in second row"
   - NOT: "approximately 5 items per row"
   - Count EXACTLY

2. **Identify layout type:**
   - Fixed grid (e.g., always 3 columns)
   - Flexible wrapping (e.g., 5/4 split based on available space)
   - Carousel/slider (items slide, don't wrap)

3. **Document dimensions:**
   - Approximate item width
   - Gaps between items (horizontal and vertical)
   - Container padding

4. **Note special patterns:**
   - Do items have equal width?
   - Do some items span multiple columns?
   - Is there a pattern to the wrapping (e.g., always 5 then 4)?

5. **Record findings:**
   ```markdown
   ## Block: cards-logos-v2

   **Visual Layout Analysis:**
   - Total items: 9 logos
   - Layout pattern: 5 items first row, 4 items second row (5/4 split)
   - Layout type: Flexible wrapping (not fixed grid)
   - Approximate item width: ~160px
   - Horizontal gap: ~60px
   - Vertical gap: ~40px
   - Container: Full width with center alignment
   ```

**Why this matters:**
- Prevents implementing wrong layout (e.g., fixed 3-column grid instead of flexible 5/4 wrap)
- Provides reference for verification later
- Forces careful observation before coding

**Common mistake:** Looking at screenshot, thinking "looks like 3 columns", implementing `grid-template-columns: repeat(3, 1fr)` without counting actual items.

**Output:**
- Written layout analysis document
- Item count per row documented
- Layout pattern identified

---

### Step 2: Content Classification

**Objective:** Distinguish between free content and structured blocks.

**Free Content (Default EDS Content):**
- Standalone headings not inside structured layouts
- Paragraphs of body text
- Simple lists (ul/ol) without special styling
- Single images with captions
- Any content that doesn't follow a repeating pattern

**Structured Blocks:**
- Card grids (multiple items with consistent structure)
- Carousels/sliders
- Hero sections with specific layouts
- Columns with balanced content
- Tables with special styling
- Accordions, tabs, or other interactive components
- Any content with repeating patterns or complex layouts

**Decision Criteria:**
- If content uses a grid layout → Block
- If multiple similar items displayed → Block
- If special interactivity required → Block
- If unique styling beyond basic typography → Block
- If it's just text/image with standard formatting → Free content

---

### Step 3: Block Type Identification & Reuse Strategy

**Objective:** For each structured block, identify if an existing block from Adobe repositories can provide the base functionality.

**Search Order:**
1. **Adobe AEM Boilerplate** - `https://github.com/adobe/aem-boilerplate/tree/main/blocks`
   - Standard blocks: cards, carousel, columns, hero, accordion, tabs, etc.
2. **Adobe Block Collection** - `https://github.com/adobe/aem-block-collection/tree/main/blocks`
   - Extended blocks with additional patterns

**Matching Criteria:**
- **Structure match**: Does the existing block create the same DOM structure?
  - Cards block → creates `<ul><li>` with image and text
  - Carousel block → creates slides with navigation
  - Columns block → creates side-by-side layout
  - Hero block → creates prominent banner with image and text
- **Behavior match**: Does the existing block provide needed interactivity?
  - Carousel navigation and indicators
  - Accordion expand/collapse
  - Tabs switching
- **Content pattern match**: Does the existing block expect similar markdown input?

**Examples:**
| Visual Pattern | Base Block | Source |
|---------------|------------|---------|
| Grid of cards with image/text | `cards` | boilerplate |
| Rotating slides with dots | `carousel` | boilerplate |
| Side-by-side content | `columns` | boilerplate |
| Large banner with CTA | `hero` | boilerplate |
| Collapsible sections | `accordion` | boilerplate |
| Tabbed content | `tabs` | boilerplate |

---

### Step 4: JavaScript Implementation Strategy

**Option A: Direct Reuse (Preferred)**

When the base block provides exactly the needed functionality:

```javascript
// blocks/cards-services/cards-services.js
import decorate from '../cards/cards.js';
export default decorate;
```

**Option B: Extension Pattern**

When base block needs minor customization:

```javascript
// blocks/hero-product/hero-product.js
import baseDecorate from '../hero/hero.js';

export default function decorate(block) {
  // Call base decoration
  baseDecorate(block);

  // Add specific customizations
  const contentDiv = block.querySelector('.hero-content');
  if (contentDiv) {
    // Custom enhancement
    contentDiv.classList.add('hero-product-enhanced');
  }
}
```

**Option C: Full Custom Implementation**

When no existing block matches the pattern:

```javascript
// blocks/herosplit/herosplit.js
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // Complete custom implementation
  // ...
}
```

**Key Rules:**
- ✅ **DO** reuse existing JavaScript when possible
- ✅ **DO** import and call base block functions
- ✅ **DO** use the same DOM manipulation patterns
- ❌ **DON'T** copy/paste entire block implementations
- ❌ **DON'T** modify base block files

---

### Step 5: CSS Implementation Strategy

**Objective:** Create completely independent CSS for each generated block with design system styling.

**Rules:**
- Each block gets its own standalone CSS file
- No @import or inheritance from base blocks
- Apply design tokens from `styles/design-tokens.css`
- Match visual design from screenshot exactly (use Visual Layout Analysis from Step 1.5)
- Use design system colors, typography, spacing

**Critical CSS Considerations:**

1. **Box Model - Always specify box-sizing:**
   ```css
   .block-name > ul > li {
     box-sizing: border-box; /* Include padding/border in width calculation */
     width: 15.2%;
     padding: 20px;
   }
   ```

   **Why:** Without `box-sizing: border-box`, padding is added OUTSIDE the width:
   - `width: 15.2%` = 160px
   - `padding: 20px` × 2 = 40px
   - **Actual width = 200px** (too wide!)

   With `box-sizing: border-box`:
   - `width: 15.2%` = 160px **INCLUDING padding**
   - **Actual width = 160px** ✅

2. **Flexbox for flexible wrapping:**
   - Use when item count per row should adapt (e.g., 5/4 split)
   - Set `flex: 0 1 auto` to allow slight shrinking
   - Set percentage width as target, min/max as constraints

3. **Grid for fixed columns:**
   - Use when layout is always the same (e.g., always 3 columns)
   - `grid-template-columns: repeat(3, 1fr)`

4. **Reference your Visual Layout Analysis:**
   - If analysis says "5/4 flexible split" → use flexbox
   - If analysis says "always 3 columns" → use grid
   - **Don't guess - use the documented pattern**

**Example Structure:**
```css
/* blocks/cards-services/cards-services.css */

.cards-services > ul {
  /* Use design tokens */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.cards-services > ul > li {
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
}

.cards-services h3 {
  color: var(--text-color);
  font-size: var(--heading-font-size-m);
}

.cards-services .button {
  background-color: var(--link-color);
  color: var(--background-color);
  border-radius: var(--border-radius);
}

/* Mobile responsive */
@media (width < 900px) {
  .cards-services > ul {
    grid-template-columns: 1fr;
  }
}
```

**Key Points:**
- Replace all color values with design token variables
- Match spacing, typography, and borders to design system
- Include responsive breakpoints
- Use existing CSS class patterns from base block (e.g., `.cards-card-image`, `.cards-card-body`)

---

### Step 6: Block Naming Convention

**Format When Based on Existing Block:**
```
{original-block-name}-{meaningful-descriptor}
```

**Examples:**
- `cards-services` - Service offerings cards (based on cards block)
- `cards-features` - Feature highlights cards (based on cards block)
- `hero-product` - Product hero banner (based on hero block)
- `hero-split` - Split layout hero (based on hero block)
- `carousel-testimonials` - Customer testimonials carousel (based on carousel block)
- `columns-comparison` - Product comparison columns (based on columns block)

**Format When Completely New:**
```
{meaningful-descriptor}
```

**Examples:**
- `herosplit` - No existing equivalent, unique split layout
- `contentmedia` - Unique side-by-side media pattern
- `pricetable` - Custom pricing table layout

**Naming Guidelines:**
- Use lowercase with hyphens (kebab-case)
- Be descriptive of content purpose, not just visual style
- Keep names concise (2-3 words maximum)
- Avoid generic names like "block1" or "section2"

---

### Step 7: Markdown Content Generation

**Objective:** Create markdown examples showing how to use each generated block.

**Free Content Example:**
```markdown
# Welcome to Our Services

We provide comprehensive solutions for your business needs.

## Why Choose Us

- Expert team
- Proven track record
- 24/7 support
```

**Block Content Example (Cards - Row-based structure):**
```markdown
+-------------------------------------+--------------------------------------+
| **Cards-services**                                                         |
+-------------------------------------+--------------------------------------+
| ![Service 1](/images/service-1.jpg) | ## Consulting                        |
|                                     |                                      |
|                                     | Expert guidance for your digital     |
|                                     | transformation journey.              |
|                                     |                                      |
|                                     | **[Learn more](/consulting)**        |
+-------------------------------------+--------------------------------------+
| ![Service 2](/images/service-2.jpg) | ## Development                       |
|                                     |                                      |
|                                     | Custom solutions built for your      |
|                                     | specific needs.                      |
|                                     |                                      |
|                                     | **[Learn more](/development)**       |
+-------------------------------------+--------------------------------------+
| ![Service 3](/images/service-3.jpg) | ## Support                           |
|                                     |                                      |
|                                     | 24/7 assistance for your peace of    |
|                                     | mind.                                |
|                                     |                                      |
|                                     | **[Learn more](/support)**           |
+-------------------------------------+--------------------------------------+
```

**Important:** Each card is a **row** (not a column). First column = image, second column = text. This structure matches what the cards.js expects.

**Combined Example:**
```markdown
# Our Services

We deliver excellence in every project.

+-------------------------------------+--------------------------------------+
| **Cards-services**                                                         |
+-------------------------------------+--------------------------------------+
| ![Service 1](/images/service-1.jpg) | ## Consulting                        |
|                                     |                                      |
|                                     | Expert guidance for your digital     |
|                                     | transformation.                      |
|                                     |                                      |
|                                     | **[Learn more](/consulting)**        |
+-------------------------------------+--------------------------------------+
| ![Service 2](/images/service-2.jpg) | ## Development                       |
|                                     |                                      |
|                                     | Custom solutions for your needs.     |
|                                     |                                      |
|                                     | **[Learn more](/development)**       |
+-------------------------------------+--------------------------------------+

Contact us today to get started.
```

---

### Step 8: Test-Verify-Refine Loop

**TL;DR:** Test on EDS-rendered pages (`http://localhost:3000/{page}`), NOT demo files. Use exact content. Count items per row, measure dimensions, iterate 3-5 times until perfect match.

**CRITICAL:** Demo/local markdown files don't execute block JavaScript - always gives false negatives. Only test on proper EDS-rendered pages.

---

**Objective:** Iteratively test the block with exact content, verify the rendering matches the original, and refine CSS until perfect.

**Critical Importance:** This step is **mandatory** and cannot be skipped. Visual inspection of screenshots alone is insufficient - you must test with the actual content rendered in EDS.

**Prerequisites:**

1. **Test page with exact content** - Create a test page in EDS with the same number of items, same text, same images as the original

2. **Local EDS server running** - `npx @adobe/aem-cli up --no-open`

3. **Original screenshot for comparison** - Side-by-side reference

**Proper Test Environment Setup (CRITICAL):**

EDS blocks require proper page rendering to execute their JavaScript decoration logic. Testing on the wrong type of page will give false results.

**✅ CORRECT - EDS-Rendered Pages:**
```
http://localhost:3000/storyhalftold
http://localhost:3000/test-page
```
These pages:
- Execute block JavaScript decoration
- Transform DOM structure (e.g., create `<ul><li>` from table markup)
- Apply proper class names
- Render exactly as production will

**❌ WRONG - Demo/Local Files:**
```
http://localhost:3000/about-page-v3     (if about-page-v3.md is a demo file)
file:///path/to/page.html
/path/to/content.html
```
These pages:
- Do NOT execute block JavaScript
- Show raw HTML without decoration
- Give false negative results
- Lead to wasted debugging time

**How to verify you're on a proper EDS page:**
```javascript
// In browser console
const block = document.querySelector('.cards-logos-v2');
console.log(block.querySelector('ul'));
// Should show <ul> with <li> items, NOT null or table structure
```

**Creating a proper test page:**
1. Create markdown file in root: `storyhalftold.md` or similar
2. Add exact content from original (same number of items)
3. Start local server: `npx @adobe/aem-cli up --no-open`
4. Navigate to: `http://localhost:3000/storyhalftold`
5. Verify block JavaScript executed by inspecting DOM

**The Loop:**

1. **Initial Implementation**
   - Write CSS based on visual analysis
   - Commit and let EDS render

2. **Test**
   - Navigate to test page: `http://localhost:3000/{test-page}`
   - Scroll to block section
   - Take full-page screenshot

3. **Verify**
   - **Count items per row** - Compare to original (e.g., 5/4 split vs 4/4/1)
   - **Measure rendered dimensions** - Use browser inspect or Playwright:
     ```javascript
     const item = document.querySelector('.block-name > ul > li');
     const computed = getComputedStyle(item);
     console.log({
       actualWidth: item.offsetWidth,
       computedWidth: computed.width,
       containerWidth: item.parentElement.offsetWidth
     });
     ```
   - **Compare visually** - Check spacing, alignment, sizing against original
   - **Document discrepancies** - Note specific differences (e.g., "Items too wide, only 4 fit instead of 5")

4. **Refine**
   - **Calculate corrections** - Use math to determine needed changes:
     ```javascript
     // Example: Need 5 items per row in 1056px container with 60px gaps
     const spaceForItems = 1056 - (4 * 60); // 4 gaps between 5 items
     const targetWidth = spaceForItems / 5; // 163.2px per item
     ```
   - **Adjust CSS** - Modify width, padding, box-sizing, gaps
   - **Commit changes**
   - **Return to step 2 (Test)** until rendering matches original

5. **Success Criteria**
   - ✅ Item count per row matches original exactly
   - ✅ Spacing and alignment match original
   - ✅ No items wrapping unexpectedly
   - ✅ Responsive behavior works at all breakpoints
   - ✅ Visual appearance indistinguishable from original

**Example Iteration Pattern:**

**Iteration 1:** Wrong layout type (fixed grid instead of flexible wrapping)
- Result: Wrong item distribution ❌

**Iteration 2:** Wrong test environment (demo page without JavaScript)
- Result: False negative, looks completely broken ❌

**Iteration 3:** Correct approach but missing box-sizing
- Result: Items too wide, wrong wrapping ❌

**Iteration 4:** Correct box-sizing + measured adjustments
- Result: Perfect match to original ✅

**Why Exact Content Matters:**

1. **Edge cases** - Specific item counts reveal wrapping behavior
2. **Real measurements** - Actual content sizes affect layout calculations
3. **Gap calculations** - Real spacing vs placeholders
4. **Accurate verification** - Can't count items without actual content

**Common Mistakes to Avoid:**

❌ Testing on demo/local markdown files (blocks don't execute)
❌ Testing with different content (different number of items)
❌ Assuming CSS will work without testing
❌ Comparing only screenshots without measuring
❌ Skipping the verify step and moving to documentation

✅ Test on proper EDS-rendered pages
✅ Use exact same content as original
✅ Measure computed dimensions
✅ Count items explicitly
✅ Iterate until perfect match

**Tools for Verification:**

```javascript
// Count items per row
const items = Array.from(document.querySelectorAll('.block > ul > li'));
const itemsPerRow = items.reduce((acc, item, i) => {
  const top = item.offsetTop;
  if (!acc[top]) acc[top] = 0;
  acc[top]++;
  return acc;
}, {});
console.log(Object.values(itemsPerRow)); // [5, 4] ✅

// Measure container and items
const container = document.querySelector('.block > ul');
const item = container.querySelector('li');
console.log({
  containerWidth: container.offsetWidth,
  itemWidth: item.offsetWidth,
  gap: getComputedStyle(container).gap,
  itemsFit: Math.floor((container.offsetWidth + 60) / (item.offsetWidth + 60))
});
```

**Time Investment:** This loop may take 3-5 iterations, but it's essential for pixel-perfect results. Skipping this step results in blocks that "look close" but have subtle layout issues that compound across the site.

---

### Step 9: Documentation Generation

**Objective:** Create comprehensive documentation for each generated block.

**Document Template:**

```markdown
## Block: {block-name}

**Base Block:** {original-block-name} (from {source})
**JavaScript:** {reuse-strategy}
**CSS:** Custom styling with design tokens

**Screenshot:**
![{block-name} screenshot](./{block-name}-screenshot.png)

**Purpose:**
{description of what this block does}

**Structure:**
{description of layout and components}

**Markdown Usage:**
```
{markdown example}
```

**Implementation Notes:**
- {note about JavaScript reuse}
- {note about styling approach}
- {note about responsive behavior}

**Files Created:**
- `blocks/{block-name}/{block-name}.js`
- `blocks/{block-name}/{block-name}.css`
```

**Full Documentation File Structure:**

Create `BLOCK_GENERATION_REPORT.md`:

```markdown
# Block Generation Report

**Source Page:** {url}
**Generation Date:** {date}
**Blocks Generated:** {count}

---

## Page Structure

### Free Content Sections
1. Main heading: "Our Services"
2. Introduction paragraph
3. Contact section text

### Generated Blocks
1. cards-services (based on cards)
2. hero-product (based on hero)
3. carousel-testimonials (based on carousel)

---

## Block Details

### 1. cards-services

[Full block documentation here]

---

### 2. hero-product

[Full block documentation here]

---

## Full Page Markdown

[Complete page markdown with free content and blocks]

---

## Implementation Checklist

- [ ] All block files created
- [ ] JavaScript imports verified
- [ ] CSS uses design tokens
- [ ] Markdown examples tested
- [ ] Responsive behavior verified
- [ ] Images optimized and uploaded
```

---

## Complete Workflow Example

**Input:** `https://example.com/services`

**Step 1: Analysis**
- Screenshot hero section → `section-hero.png`
- Screenshot service cards → `section-cards.png`
- Screenshot testimonials → `section-testimonials.png`

**Step 2: Classification**
- Free content: Page title "Our Services", intro paragraph
- Blocks: Hero banner, service cards grid, testimonials carousel

**Step 3: Block Identification**
- Hero banner → matches `hero` block from boilerplate
- Service cards → matches `cards` block from boilerplate
- Testimonials → matches `carousel` block from boilerplate

**Step 4: Naming**
- `hero-services` (based on hero)
- `cards-services` (based on cards)
- `carousel-testimonials` (based on carousel)

**Step 5: JavaScript Generation**
```javascript
// blocks/hero-services/hero-services.js
import decorate from '../hero/hero.js';
export default decorate;

// blocks/cards-services/cards-services.js
import decorate from '../cards/cards.js';
export default decorate;

// blocks/carousel-testimonials/carousel-testimonials.js
import decorate from '../carousel/carousel.js';
export default decorate;
```

**Step 6: CSS Generation**
- `hero-services.css` - Custom CIAT styling
- `cards-services.css` - Custom CIAT styling
- `carousel-testimonials.css` - Custom CIAT styling

**Step 7: Markdown Generation**
```markdown
# Our Services

We provide comprehensive business solutions.

+---------------------------------------------------------------+
| **Hero-services**                                             |
+---------------------------------------------------------------+
| ![Hero image](/images/hero-services.jpg)                      |
+---------------------------------------------------------------+
| # Transform Your Business                                     |
|                                                               |
| **[Get started](/contact)**                                   |
+---------------------------------------------------------------+

## What We Offer

+------------------------------------+-------------------------------------+
| **Cards-services**                                                       |
+------------------------------------+-------------------------------------+
| ![Consulting](/images/consult.jpg) | ## Consulting                       |
|                                    |                                     |
|                                    | Expert guidance for growth.         |
|                                    |                                     |
|                                    | **[Learn more](/consulting)**       |
+------------------------------------+-------------------------------------+
| ![Development](/images/dev.jpg)    | ## Development                      |
|                                    |                                     |
|                                    | Custom solutions for your needs.    |
|                                    |                                     |
|                                    | **[Learn more](/development)**      |
+------------------------------------+-------------------------------------+

[More content here]
```

**Step 8: Test-Verify-Refine**
- Create test page with exact content from source
- Start local server: `npx @adobe/aem-cli up --no-open`
- Test: Navigate to test page and take screenshot
- Verify: Count items per row, measure dimensions
- Refine: Adjust CSS based on measurements
- Iterate until rendering matches original exactly

**Step 9: Documentation**
- Generate `BLOCK_GENERATION_REPORT.md`
- Include all screenshots
- Document reuse strategy and refinement iterations
- Provide usage examples

---

## CLI Command (Future Enhancement)

**Ideal usage:**
```bash
# Generate blocks from a page
node tools/eds-migration/cli.js generate-blocks \
  --url https://example.com/services \
  --output blocks-report.md

# With options
node tools/eds-migration/cli.js generate-blocks \
  --url https://example.com/services \
  --output blocks-report.md \
  --prefix custom \
  --design-tokens styles/design-tokens.css
```

**Output:**
- All block files created in `blocks/` directory
- Documentation report generated
- Markdown page template created
- Screenshots saved to project

---

## Critical Learnings: High-Fidelity Block Generation

**TL;DR:** (1) Count items before coding, (2) Test on proper EDS pages, (3) Use exact content, (4) Always add box-sizing, (5) Measure don't assume, (6) Expect 3-5 iterations, (7) Analyze layout before implementation.

---

This section synthesizes key learnings from real block generation experiences that significantly improved block fidelity.

### 1. Count Before You Code

**Problem:** Implementing layout based on visual impression rather than precise counting.

**Example:**
- Visual impression: "Looks like a 3-column grid"
- Reality: Flexible wrapping (e.g., 5 items then 4 items)
- Wrong: Fixed grid → equal columns
- Correct: Flexbox → natural wrapping

**Solution:** Always count items per row in screenshot BEFORE writing CSS. Document the pattern.

**Impact:** Prevents implementing wrong layout type (fixed vs flexible).

---

### 2. Test Environment Matters Critically

**Problem:** Testing on pages where block JavaScript doesn't execute.

**Example:**
```
❌ Local markdown file: Block shows as plain div
→ False conclusion: "Block broken!"

✅ EDS-rendered page: Block properly decorated
→ Correct conclusion: Block works
```

**Solution:** Only test on `http://localhost:3000/{page}` (EDS-rendered). Never test on demo files or file:// URLs.

**Verification:** Inspect DOM to confirm decoration (e.g., `<ul><li>` exists).

**Impact:** Eliminates debugging non-existent problems.

---

### 3. Exact Content is Non-Negotiable

**Problem:** Testing with different content than original.

**Why different content hides bugs:**
- Different item counts → different wrapping behavior
- Different item counts might accidentally look correct
- Edge cases only appear with exact content

**Solution:** Test with EXACT content from original:
- Same number of items
- Same content type (real images, not placeholders)
- Same aspect ratios

**Impact:** Catches layout bugs in development, not production.

---

### 4. Box Model: Always Use box-sizing

**Problem:** Percentage widths + padding without box-sizing = items wider than expected.

**Without box-sizing:**
```css
width: 16%; padding: 20px;
/* ACTUAL width: 16% + 40px (too wide!) ❌ */
```

**With box-sizing:**
```css
box-sizing: border-box;
width: 16%; padding: 20px;
/* ACTUAL width: 16% including padding ✅ */
```

**Solution:** Always set `box-sizing: border-box` on items with width + padding/border.

**Impact:** Prevents "items too wide" bugs.

---

### 5. Measure, Don't Assume

**Problem:** Making CSS changes without verification.

**Dangerous:** Write CSS → Commit → Assume it works → Bug found later

**Correct:** Write CSS → Test → Measure → Verify → Adjust → Repeat → Commit

**Measurement tools:**
```javascript
const item = document.querySelector('.block > ul > li');
console.log({
  offsetWidth: item.offsetWidth,              // Actual width
  computedWidth: getComputedStyle(item).width, // CSS width
  containerWidth: item.parentElement.offsetWidth
});
```

**Solution:** After every CSS change, reload page and verify by counting items and measuring dimensions.

**Impact:** Eliminates "I thought it would work" bugs.

---

### 6. Iteration is Normal and Expected

**Problem:** Expecting perfect layout on first try.

**Reality:** Pixel-perfect layouts require iteration (typically 3-5 rounds).

**Typical pattern:**
- Round 1: Wrong approach
- Round 2: Better approach, still issues
- Round 3: Close, minor adjustments needed
- Round 4: Perfect

**Mindset shift:**
- ❌ "Failed - took 4 tries"
- ✅ "Success - iterated to perfection"

**Solution:** Budget 20-30 minutes per block for iteration. Don't skip verification to "save time."

**Impact:** Realistic expectations, higher quality results.

---

### 7. Visual Layout Analysis is Mandatory

**Problem:** Starting to code immediately after seeing screenshot.

**Better process:**
1. **Stop** - Don't write code yet
2. **Analyze** - Count items, identify pattern, document dimensions
3. **Document** - Write analysis:
   - Total items: X
   - Layout pattern: Y items per row
   - Type: Fixed grid or flexible wrapping
   - Approximate dimensions
4. **Reference** - Use document when writing CSS
5. **Verify** - Compare rendering to analysis

**Impact:** Forces observation, prevents wrong implementation.

---

## Summary of Critical Learnings

1. **Count items before coding** - Prevents wrong layout pattern
2. **Test on proper EDS pages** - Ensures JavaScript executes
3. **Use exact content** - Reveals real edge cases
4. **Always use box-sizing** - Prevents width calculation bugs
5. **Measure actual rendering** - Eliminates assumptions
6. **Expect 3-5 iterations** - Realistic expectations
7. **Document layout analysis** - Forces careful observation

**These learnings compound:** Following all 7 dramatically increases block fidelity and reduces debugging time.

---

## Best Practices

### DO:
- ✅ Carefully distinguish free content from blocks
- ✅ Always check boilerplate and block collection first
- ✅ Reuse JavaScript when structure matches
- ✅ Create independent CSS for each block
- ✅ Use design tokens consistently
- ✅ Generate descriptive block names
- ✅ **Create test page with exact content from original**
- ✅ **Run test-verify-refine loop until perfect match**
- ✅ **Count items per row and measure dimensions**
- ✅ Include comprehensive documentation
- ✅ Test responsive behavior
- ✅ Verify image optimization

### DON'T:
- ❌ Generate blocks for simple text content
- ❌ Copy/paste base block JavaScript
- ❌ Inherit CSS from base blocks
- ❌ Use generic block names
- ❌ **Skip the test-verify-refine loop**
- ❌ **Test with different content than original**
- ❌ **Assume CSS will work without testing**
- ❌ Skip documentation
- ❌ Forget to handle responsive layouts
- ❌ Hardcode colors/spacing instead of using tokens

---

## Integration with Existing Workflows

This automated block generation workflow integrates with:

1. **Design Token Extraction** ([EXCAT__DESIGN_TOKENS.md](./EXCAT__DESIGN_TOKENS.md))
   - Extract design tokens first
   - Apply tokens in generated CSS

2. **Agentic Content Migration** ([EXCAT__AGENTIC_WORKFLOW.md](./EXCAT__AGENTIC_WORKFLOW.md))
   - Use for single-page migrations
   - Automated workflow for batch processing

3. **Block Showcase** ([block-showcase.md](./block-showcase.md))
   - Add generated blocks to showcase
   - Update with new examples

4. **Image Troubleshooting** ([EXCAT__IMAGE_TROUBLESHOOTING.md](./EXCAT__IMAGE_TROUBLESHOOTING.md))
   - Follow image handling best practices
   - Ensure `createOptimizedPicture` usage

---

## Troubleshooting

### Issue: Generated block doesn't match visual design

**Solution:**
- Review screenshot carefully
- Check CSS for missing properties
- Verify design tokens are applied
- Test at multiple breakpoints

### Issue: Base block JavaScript doesn't work

**Solution:**
- Verify import path is correct
- Check base block expects same markdown structure
- Consider using extension pattern instead
- May need custom implementation

### Issue: Can't find matching base block

**Solution:**
- Check both boilerplate and block collection
- Look for similar structural patterns
- Consider combining multiple base blocks
- Create custom implementation if truly unique

### Issue: Naming conflicts

**Solution:**
- Use more specific descriptor
- Add project prefix if needed
- Check existing block names in project
- Follow naming convention consistently

---

## Summary

Automated block generation enables rapid conversion of web pages into EDS blocks by:

1. **Analyzing** page structure visually and programmatically
2. **Classifying** content into free content vs. structured blocks
3. **Identifying** reusable base blocks from Adobe repositories
4. **Reusing** JavaScript functionality through imports
5. **Creating** independent CSS with design tokens
6. **Naming** blocks descriptively based on purpose
7. **Generating** markdown examples and documentation
8. **Documenting** implementation strategy and usage

This workflow maximizes code reuse, maintains design system consistency, and accelerates EDS project development.
