# Adobe AEM Document Authoring (DA) Interactions

This document provides comprehensive guidance for interacting with Adobe AEM Document Authoring (DA) through the CLI tools, focusing on upload and download operations.

## Overview

Adobe Document Authoring (DA) is a content management platform that allows you to download, upload, manage, and publish HTML content. The tools in this directory provide seamless integration with DA for automated content workflows.

## Prerequisites

### Environment Setup

1. **Bearer Token**: You need a valid DA bearer token for authentication
2. **Repository Access**: Access to a DA repository (owner/repo combination)
3. **Node.js**: Ensure Node.js is installed for running the CLI tools

### Environment Configuration

Create a `.env` file in the project root with your DA credentials:

```bash
DA_BEARER_TOKEN=your_bearer_token_here
```

## Available Commands

### Upload HTML to Document Authoring

**Command**: `upload-da`

Uploads HTML content to Adobe Document Authoring platform.

#### Basic Usage

```bash
node tools/eds-migration/cli.js upload-da <html-file> --owner <owner> --repo <repo>
```

#### Parameters

- `html-file` (required): Path to the HTML file to upload
- `--owner` (required): DA repository owner/organization
- `--repo` (required): DA repository name
- `--path` (optional): Custom upload path (auto-generated if not provided)
- `--prefix` (optional): Path prefix to prepend to upload path
- `--url` (optional): Original URL for automatic path generation

#### Examples

```bash
# Basic upload
node tools/eds-migration/cli.js upload-da content.html --owner myorg --repo myrepo

# Upload with custom path
node tools/eds-migration/cli.js upload-da content.html --owner myorg --repo myrepo --path pages/my-page.html

# Upload with prefix and original URL
node tools/eds-migration/cli.js upload-da content.html --owner myorg --repo myrepo --prefix content --url https://example.com/original-page

# Upload with auto-generated path from URL
node tools/eds-migration/cli.js upload-da content.html --owner myorg --repo myrepo --url https://example.com/blog/my-article
```

#### Path Generation Rules

When using `--url` parameter, the tool automatically generates DA-compatible paths:

1. **Hostname Processing**: 
   - Removes `www.` prefix
   - Replaces dots (.) with hyphens (-)
   - Collapses multiple consecutive hyphens

2. **Pathname Processing**:
   - Removes leading slashes
   - Ensures `.html` extension
   - Replaces dots with hyphens (except `.html` extension)
   - Collapses multiple consecutive hyphens

3. **Examples**:
   - `https://www.example.com/blog/article` → `example-com/blog/article.html`
   - `https://subdomain.example.com/path/to/page/` → `subdomain-example-com/path/to/page/index.html`
   - `https://example.com/page.html` → `example-com/page.html`

### Download HTML from Document Authoring

**Command**: `dl-da`

Downloads HTML content from Adobe Document Authoring platform for review, backup, or further processing.

#### Basic Usage

```bash
node tools/eds-migration/cli.js dl-da <da-url>
```

#### Parameters

- `da-url` (required): Full DA URL to download from
- `--output` (optional): Local file path to save the content
- `--token` (optional): Bearer token (defaults to `DA_BEARER_TOKEN` env var)

#### Examples

```bash
# Download to console (uses DA_BEARER_TOKEN from .env)
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/content/page.html

# Download and save to file
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/content/page.html --output downloaded.html

# Provide token via command line
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/content/page.html --token YOUR_BEARER_TOKEN --output content.html

# Download for validation
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/pages/index.html --output review.html
```

#### Use Cases

1. **Content Review**: Download uploaded content to verify it was processed correctly
2. **Backup**: Create local backups of DA content
3. **Comparison**: Compare uploaded content with source files
4. **Debugging**: Inspect the actual HTML structure stored in DA
5. **Version Control**: Download and commit snapshots to git

#### Authentication

The `dl-da` command supports flexible authentication:

1. **Environment Variable** (Recommended):
   ```bash
   # Set in .env file
   DA_BEARER_TOKEN="your_bearer_token_here"

   # Use without --token flag
   node tools/eds-migration/cli.js dl-da <url> --output file.html
   ```

2. **Command Line Flag**:
   ```bash
   node tools/eds-migration/cli.js dl-da <url> --token "your_token" --output file.html
   ```

#### Response Format

The downloaded content is returned in HTML format with:
- Complete `<body>` element structure
- EDS block markup (hero, columns, cards, etc.)
- Responsive `<picture>` elements with proper sources
- All URLs converted to absolute paths


### Modify DA Document

If you are being instructed to modify DA content, you need to have the HTML content locally so you can modify it and then automatically upload it back to DA. This should be seamless to the user.

- If you don't have the HTML content locally, download it first from DA and save the HTML locally.
- After every modification you automatically upload the modified content back to DA.



## Upload Workflow Examples

### Complete Content Processing Pipeline

```bash
# 1. Convert markdown to HTML
node tools/eds-migration/cli.js convert-html content.md --url https://example.com

# 2. Fix any table formatting issues
node tools/eds-migration/cli.js fix-tables content.md > fixed-content.md

# 3. Convert fixed markdown to HTML
node tools/eds-migration/cli.js convert-html fixed-content.md --url https://example.com

# 4. Upload to Document Authoring
node tools/eds-migration/cli.js upload-da content.html --owner myorg --repo myrepo --url https://example.com
```

### Batch Upload with Prefixes

```bash
# Upload multiple pages with content prefix
node tools/eds-migration/cli.js upload-da page1.html --owner myorg --repo myrepo --prefix content --url https://example.com/page1
node tools/eds-migration/cli.js upload-da page2.html --owner myorg --repo myrepo --prefix content --url https://example.com/page2
node tools/eds-migration/cli.js upload-da page3.html --owner myorg --repo myrepo --prefix content --url https://example.com/page3
```

### Upload and Verify Workflow

```bash
# 1. Upload content to DA
node tools/eds-migration/cli.js upload-da content.html --owner myorg --repo myrepo --prefix pages --url https://example.com/article

# 2. Download to verify upload was successful
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/pages/example-com/article.html --output verified.html

# 3. Compare uploaded content with original
diff content.html verified.html
```

### Download Workflow Examples

```bash
# Download for local review
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/content/page.html --output review.html

# Download multiple pages for backup
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/pages/page1.html --output backup/page1.html
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/pages/page2.html --output backup/page2.html
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/pages/page3.html --output backup/page3.html
```

## Error Handling

The CLI tools provide comprehensive error handling:

- **Missing Parameters**: Clear error messages for required parameters
- **Authentication Issues**: Handles missing or invalid bearer tokens
- **Upload Failures**: Detailed error reporting with HTTP status codes
- **File Not Found**: Validates file existence before processing

### Common Error Scenarios

1. **Missing Bearer Token**:
   ```
   Error: DA upload failed: Missing owner or repository
   ```
   Solution: Ensure `DA_BEARER_TOKEN` is set in `.env` file

2. **Invalid Repository**:
   ```
   Error: DA upload failed: 404 Not Found
   ```
   Solution: Verify owner and repository names are correct

3. **File Not Found**:
   ```
   Error: ENOENT: no such file or directory
   ```
   Solution: Check file path and ensure file exists

4. **Download Authentication Error**:
   ```
   Error: Bearer token required. Provide via --token or DA_BEARER_TOKEN env var
   ```
   Solution: Set `DA_BEARER_TOKEN` in `.env` or provide via `--token` flag

5. **Download Not Found**:
   ```
   Error: Failed to download: 404 Not Found
   ```
   Solution: Verify the DA URL is correct and the content exists

## API Details

### Upload Endpoint

The tool uploads content to:
```
https://admin.da.live/source/{owner}/{repo}/{path}
```

#### Upload Request Format

- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: FormData with HTML content as Blob
- **Headers**: Authorization Bearer token (if available)

#### Upload Response Handling

- **Success**: Returns upload URL and confirmation
- **Failure**: Detailed error messages with HTTP status codes

### Download Endpoint

The tool downloads content from:
```
https://admin.da.live/source/{owner}/{repo}/{path}
```

#### Download Request Format

- **Method**: GET
- **Headers**:
  - `Authorization: Bearer {token}` (required)
  - `Accept: application/json`

#### Download Response Handling

- **Success (200)**: Returns HTML content as text
- **Not Found (404)**: Content does not exist at specified path
- **Unauthorized (401)**: Invalid or missing bearer token
- **Forbidden (403)**: Token lacks necessary permissions

## Best Practices

### Path Management

1. **Use Descriptive Paths**: Leverage the `--url` parameter for automatic path generation
2. **Organize with Prefixes**: Use `--prefix` to group related content
3. **Consistent Naming**: Follow DA naming conventions (hyphens instead of dots)

### Content Preparation

1. **Validate HTML**: Ensure HTML is well-formed before upload
2. **Process URLs**: Use `process-urls` command to make relative URLs absolute
3. **Fix Tables**: Use `fix-tables` command for proper EDS table formatting

### Authentication

1. **Secure Storage**: Store bearer tokens in `.env` file, not in code
2. **Token Rotation**: Regularly rotate bearer tokens for security
3. **Environment Separation**: Use different tokens for different environments

## Integration with Claude Code

When using these tools with Claude Code, follow these patterns:

```bash
# Always use absolute paths for upload
node /Users/catalan/repos/franklin/aemysites/excatop/tools/eds-migration/cli.js upload-da /path/to/content.html --owner myorg --repo myrepo

# Download with absolute path for output
node /Users/catalan/repos/franklin/aemysites/excatop/tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/pages/content.html --output /path/to/downloaded.html

# Complete workflow: migrate, upload, verify
# 1. Convert markdown to HTML
node /Users/catalan/repos/franklin/aemysites/excatop/tools/eds-migration/cli.js convert-html /path/to/content.md --url https://example.com

# 2. Upload to DA
node /Users/catalan/repos/franklin/aemysites/excatop/tools/eds-migration/cli.js upload-da /path/to/content.html --owner myorg --repo myrepo --prefix pages --url https://example.com/page

# 3. Download and verify
node /Users/catalan/repos/franklin/aemysites/excatop/tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/pages/example-com/page.html --output /path/to/verified.html
```

## Troubleshooting

### Debug Mode

Enable verbose logging by checking the console output for detailed information about:
- Generated upload paths
- API requests and responses
- Error details and stack traces

### Common Issues

1. **Path Generation Failures**: Check URL format and ensure it's valid
2. **Upload Timeouts**: Verify network connectivity and DA service status
3. **Authentication Errors**: Confirm bearer token is valid and has proper permissions
4. **Download Failures**: Verify the DA URL is correct and content exists at that path
5. **Token Expiration**: If downloads fail with 401, the bearer token may have expired - generate a new one
6. **Network Errors**: Check internet connectivity if fetch operations fail

### Support

For additional support or issues:
1. Check the console output for detailed error messages
2. Verify all required parameters are provided
3. Ensure environment variables are properly set
4. Test with simple HTML content first

## Security Considerations

- **Token Security**: Never commit bearer tokens to version control
- **HTTPS Only**: All DA communications use HTTPS
- **Minimal Permissions**: Use tokens with minimal required permissions
- **Regular Rotation**: Rotate tokens regularly for security

This documentation provides everything needed to effectively use the Adobe AEM Document Authoring integration tools in automated workflows.

