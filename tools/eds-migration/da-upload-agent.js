import dotenv from 'dotenv';

// Load environment variables
dotenv.config({quiet: true});

/**
 * Generate upload path from URL
 * @param {string} url - Original URL to extract path from
 * @returns {string} - Upload path based on hostname and URL path
 */
export function generateUploadPathFromUrl(url) {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname;
    let pathname = urlObj.pathname;
    
    // Remove 'www.' prefix if present
    hostname = hostname.replace(/^www\./, '');
    
    // Remove leading slash from pathname
    pathname = pathname.replace(/^\/+/, '');
    
    // If pathname is empty or just '/', use 'index.html'
    if (!pathname || pathname === '') {
      pathname = 'index.html';
    }
    // If pathname ends with '/', it's a directory - convert to index.html
    else if (pathname.endsWith('/')) {
      pathname += 'index.html';
    }
    // If pathname doesn't end with .html, add it
    else if (!pathname.endsWith('.html')) {
      // Check if there's already an extension
      const lastDot = pathname.lastIndexOf('.');
      const lastSlash = pathname.lastIndexOf('/');
      
      // If no extension or extension is before the last slash (directory), add .html
      if (lastDot === -1 || lastDot < lastSlash) {
        pathname += '.html';
      }
    }
    
    // Replace dots with hyphens for DA compatibility (except .html extension)
    // First handle the hostname - replace all dots with hyphens
    let daCompatibleHostname = hostname.replace(/\./g, '-');
    
    // Handle pathname - replace dots with hyphens but preserve .html extension
    let daCompatiblePathname = pathname;
    if (pathname.endsWith('.html')) {
      // Remove .html, replace dots, then add .html back
      const withoutExtension = pathname.slice(0, -5); // Remove '.html'
      let cleanedPath = withoutExtension.replace(/\./g, '-');
      
      // Collapse multiple consecutive hyphens and remove trailing hyphens
      cleanedPath = cleanedPath.replace(/-+/g, '-').replace(/-+$/, '');
      
      daCompatiblePathname = cleanedPath + '.html';
    } else {
      // No .html extension, replace all dots
      daCompatiblePathname = pathname.replace(/\./g, '-');
      
      // Collapse multiple consecutive hyphens and remove trailing hyphens
      daCompatiblePathname = daCompatiblePathname.replace(/-+/g, '-').replace(/-+$/, '');
    }
    
    // Collapse multiple consecutive hyphens into single hyphens for hostname (DA doesn't like --)
    daCompatibleHostname = daCompatibleHostname.replace(/-+/g, '-');
    
    // Combine hostname and pathname
    return `${daCompatibleHostname}/${daCompatiblePathname}`;
  } catch (error) {
    console.warn(`Failed to generate upload path from URL: ${url}`, error);
    return null;
  }
}

/**
 * DA Upload Agent
 * Uploads HTML content to Document Authoring (DA) admin interface
 */
export async function uploadToDa(state) {
  try {
    const { uploadToDa, daOwner, daRepo, daPrefix, daPath, htmlContent, url } = state;
    
    if (!uploadToDa) {
      console.log('DA upload not requested, skipping upload');
      return state;
    }
    
    if (!htmlContent) {
      console.log('No HTML content available, skipping DA upload');
      return {
        ...state,
        errors: [...(state.errors || []), 'DA upload failed: No HTML content available']
      };
    }
    
    if (!daOwner || !daRepo) {
      console.log('DA owner and repository not specified, skipping DA upload');
      return {
        ...state,
        errors: [...(state.errors || []), 'DA upload failed: Missing owner or repository']
      };
    }
    
    // Get bearer token from environment
    const bearerToken = process.env.DA_BEARER_TOKEN;
    
    // Generate path if not provided
    let uploadPath = daPath;
    
    if (!uploadPath) {
      // Try to generate path from URL first
      if (url) {
        uploadPath = generateUploadPathFromUrl(url);
        console.log(`Generated upload path from URL: ${uploadPath}`);
      }
      
      // Fall back to timestamp-based path if URL parsing failed
      if (!uploadPath) {
        uploadPath = `pages/page-${Date.now()}.html`;
        console.log(`Using fallback upload path: ${uploadPath}`);
      }
    }
    
    // Ensure path ends with .html
    if (!uploadPath.endsWith('.html')) {
      uploadPath += '.html';
    }
    
    // Apply prefix if provided
    if (daPrefix) {
      // Remove leading/trailing slashes from prefix and ensure clean combination
      const cleanPrefix = daPrefix.replace(/^\/+|\/+$/g, '');
      uploadPath = `${cleanPrefix}/${uploadPath}`;
      console.log(`Applied prefix '${cleanPrefix}' to upload path: ${uploadPath}`);
    }
    
    // Construct DA API URL
    const daUrl = `https://admin.da.live/source/${daOwner}/${daRepo}/${uploadPath}`;
    
    console.log(`Uploading HTML to DA: ${daUrl}`);
    
    // Upload HTML content using FormData and Blob
    const data = new Blob([htmlContent], { type: 'text/html' });
    const body = new FormData();
    body.append('data', data);
    
    const opts = { 
      method: 'POST', 
      body
    };
    
    // Add authorization header if available
    if (bearerToken) {
      opts.headers = {
        'Authorization': `Bearer ${bearerToken}`
      };
    }
    
    const response = await fetch(daUrl, opts);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DA upload failed:', response.status, response.statusText);
      console.error('Error response:', errorText);
      return {
        ...state,
        errors: [...(state.errors || []), `DA upload failed: ${response.status} ${response.statusText}`]
      };
    }
    
    console.log('HTML successfully uploaded to DA');
    console.log('Upload URL:', daUrl);
    console.log('Response status:', response.status);
    return {
      ...state,
      daUploadUrl: daUrl,
      daUploadResult: { success: true }
    };
  } catch (error) {
    console.error('Error uploading to DA:', error);
    return {
      ...state,
      errors: [...(state.errors || []), `DA upload failed: ${error.message}`]
    };
  }
}
