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
- Match visual design from screenshot exactly
- Use design system colors, typography, spacing

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

**Block Content Example:**
```markdown
+-------------------------------------------------------------+
| **Cards-services**                                          |
+-------------------------------------------------------------+
| ![Service 1](/images/service-1.jpg)                         |
+-------------------------------------------------------------+
| ## Consulting                                               |
|                                                             |
| Expert guidance for your digital transformation journey.    |
|                                                             |
| **[Learn more](/consulting)**                               |
+-------------------------------------------------------------+
```

**Combined Example:**
```markdown
# Our Services

We deliver excellence in every project.

+-------------------------------------------------------------+
| **Cards-services**                                          |
+-------------------------------------------------------------+
| ![Service 1](/images/service-1.jpg)                         |
+-------------------------------------------------------------+
| ## Consulting                                               |
|                                                             |
| Expert guidance for your digital transformation.            |
|                                                             |
| **[Learn more](/consulting)**                               |
+-------------------------------------------------------------+

Contact us today to get started.
```

---

### Step 8: Documentation Generation

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

+-------------------------------------------------------------+
| **Cards-services**                                          |
+-------------------------------------------------------------+
| ![Consulting](/images/consulting.jpg)                       |
+-------------------------------------------------------------+
| ## Consulting                                               |
|                                                             |
| Expert guidance for growth.                                 |
|                                                             |
| **[Learn more](/consulting)**                               |
+-------------------------------------------------------------+

[More content here]
```

**Step 8: Documentation**
- Generate `BLOCK_GENERATION_REPORT.md`
- Include all screenshots
- Document reuse strategy
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

## Best Practices

### DO:
- ✅ Carefully distinguish free content from blocks
- ✅ Always check boilerplate and block collection first
- ✅ Reuse JavaScript when structure matches
- ✅ Create independent CSS for each block
- ✅ Use design tokens consistently
- ✅ Generate descriptive block names
- ✅ Include comprehensive documentation
- ✅ Test responsive behavior
- ✅ Verify image optimization

### DON'T:
- ❌ Generate blocks for simple text content
- ❌ Copy/paste base block JavaScript
- ❌ Inherit CSS from base blocks
- ❌ Use generic block names
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
