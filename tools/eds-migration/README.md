# Excatop Agentic Tools

A collection of JavaScript tools for the agentic workflow that handles markdown to HTML conversion and Adobe Document Authoring uploads.

## Installation

```bash
cd tools/excatop/tools
npm install
```

## Environment Setup

The tools automatically load configuration from a `.env` file. Create one with your Adobe DA bearer token:

```bash
DA_BEARER_TOKEN=your_bearer_token_here
```

This token is automatically used by the DA upload commands.

## Available Commands

### Convert Markdown to HTML
Convert markdown to HTML using Adobe Edge Delivery Services pipeline:

```bash
# Direct CLI usage
node cli.js convert-html input.md --url https://example.com

# Using npm script
npm run convert-html input.md -- --url https://example.com
```

### Upload to Document Authoring
Upload HTML content to Adobe Document Authoring:

```bash
# Direct CLI usage
node cli.js upload-da content.html --owner myorg --repo myrepo --path pages/my-page.html

# With prefix and original URL
node cli.js upload-da content.html --owner myorg --repo myrepo --prefix content --url https://example.com/original

# Using npm script
npm run upload-da content.html -- --owner myorg --repo myrepo
```

### Fix Table Formatting
Fix grid table formatting in markdown files:

```bash
# Direct CLI usage
node cli.js fix-tables input.md

# Using npm script
npm run fix-tables input.md
```

### Process URLs
Convert relative URLs to absolute URLs in HTML or markdown:

```bash
# Process HTML file
node cli.js process-urls content.html --base-url https://example.com --format html

# Process markdown file
node cli.js process-urls content.md --base-url https://example.com --format markdown

# Using npm script
npm run process-urls content.html -- --base-url https://example.com --format html
```

### Help
Display available commands and usage:

```bash
node cli.js help
# or
npm run help
```

## Tool Functions

### HTML Conversion Agent (`html-conversion-agent.js`)
- `convertToHtml(state)` - Converts markdown to HTML with URL processing
- Uses Adobe Helix HTML pipeline for EDS-compatible output

### DA Upload Agent (`da-upload-agent.js`)
- `uploadToDa(state)` - Uploads HTML to Adobe Document Authoring
- `generateUploadPathFromUrl(url)` - Generates DA-compatible paths from URLs

### Table Formatting (`utils/table-formatting.js`)
- `fixGridTableFormatting(markdown)` - Fixes grid table column alignment

### URL Processor (`utils/url-processor.js`)
- `makeUrlsAbsolute(html, baseUrl)` - Converts relative URLs to absolute in HTML
- `makeMarkdownUrlsAbsolute(markdown, baseUrl)` - Converts relative URLs in markdown
- `extractDomain(url)` - Extracts domain from URL

## Usage in Agentic Workflows

These tools can be called from Claude Code using the Bash tool:

```bash
# Example workflow step
cd tools/excatop/tools && node cli.js convert-html ../../content.md --url https://example.com > ../../output.html
```

## State Object Format

When using the functions directly, they expect a state object with these properties:

```javascript
const state = {
  edsMapping: 'markdown content',           // For HTML conversion
  url: 'https://example.com',              // Base URL for processing
  uploadToDa: true,                        // Enable DA upload
  daOwner: 'organization',                 // DA repository owner
  daRepo: 'repository',                    // DA repository name
  daPath: 'pages/my-page.html',           // Upload path (optional)
  daPrefix: 'content',                     // Path prefix (optional)
  htmlContent: '<html>...</html>',         // HTML content to upload
  errors: []                               // Error array
};
```