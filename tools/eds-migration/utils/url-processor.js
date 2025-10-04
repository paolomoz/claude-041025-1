/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * URL processing utilities for converting relative URLs to absolute URLs
 */

/**
 * Convert relative URLs to absolute URLs in HTML content
 * @param {string} htmlContent - HTML content to process
 * @param {string} baseUrl - Base URL to resolve relative URLs against
 * @returns {string} - Processed HTML with absolute URLs
 */
export function makeUrlsAbsolute(htmlContent, baseUrl) {
  if (!htmlContent || !baseUrl) {
    return htmlContent;
  }

  try {
    const base = new URL(baseUrl);
    
    // Process different URL attributes
    let processedHtml = htmlContent;
    
    // Process image src attributes
    processedHtml = processImageSrcAttributes(processedHtml, base);
    
    // Process image srcset attributes
    processedHtml = processImageSrcsetAttributes(processedHtml, base);
    
    // Process link href attributes
    processedHtml = processLinkHrefAttributes(processedHtml, base);
    
    // Process other common URL attributes
    processedHtml = processOtherUrlAttributes(processedHtml, base);
    
    return processedHtml;
  } catch (error) {
    console.error('Error processing URLs:', error);
    return htmlContent; // Return original if processing fails
  }
}

/**
 * Process image src attributes
 * @param {string} html - HTML content
 * @param {URL} base - Base URL object
 * @returns {string} - Processed HTML
 */
function processImageSrcAttributes(html, base) {
  // Match img tags with src attributes
  const imgSrcRegex = /<img([^>]*)\ssrc\s*=\s*["']([^"']+)["']([^>]*)/gi;
  
  return html.replace(imgSrcRegex, (match, beforeSrc, srcUrl, afterSrc) => {
    const absoluteUrl = makeUrlAbsolute(srcUrl, base);
    return `<img${beforeSrc} src="${absoluteUrl}"${afterSrc}`;
  });
}

/**
 * Process image srcset attributes (for responsive images)
 * @param {string} html - HTML content
 * @param {URL} base - Base URL object
 * @returns {string} - Processed HTML
 */
function processImageSrcsetAttributes(html, base) {
  // Match img tags with srcset attributes
  const imgSrcsetRegex = /<img([^>]*)\ssrcset\s*=\s*["']([^"']+)["']([^>]*)/gi;
  
  return html.replace(imgSrcsetRegex, (match, beforeSrcset, srcsetValue, afterSrcset) => {
    // Process srcset value - it contains multiple URLs with descriptors
    const processedSrcset = processSrcsetValue(srcsetValue, base);
    return `<img${beforeSrcset} srcset="${processedSrcset}"${afterSrcset}`;
  });
}

/**
 * Process srcset value containing multiple URLs and descriptors
 * @param {string} srcsetValue - The srcset attribute value
 * @param {URL} base - Base URL object  
 * @returns {string} - Processed srcset value
 */
function processSrcsetValue(srcsetValue, base) {
  // Split by comma to get individual entries
  const entries = srcsetValue.split(',').map(entry => entry.trim());
  
  const processedEntries = entries.map(entry => {
    // Each entry can be "url descriptor" or just "url"
    const parts = entry.trim().split(/\s+/);
    const url = parts[0];
    const descriptor = parts.slice(1).join(' '); // Everything after the URL
    
    const absoluteUrl = makeUrlAbsolute(url, base);
    return descriptor ? `${absoluteUrl} ${descriptor}` : absoluteUrl;
  });
  
  return processedEntries.join(', ');
}

/**
 * Process link href attributes
 * @param {string} html - HTML content
 * @param {URL} base - Base URL object
 * @returns {string} - Processed HTML
 */
function processLinkHrefAttributes(html, base) {
  // Match a tags with href attributes
  const linkHrefRegex = /<a([^>]*)\shref\s*=\s*["']([^"']+)["']([^>]*)/gi;
  
  return html.replace(linkHrefRegex, (match, beforeHref, hrefUrl, afterHref) => {
    const absoluteUrl = makeUrlAbsolute(hrefUrl, base);
    return `<a${beforeHref} href="${absoluteUrl}"${afterHref}`;
  });
}

/**
 * Process other common URL attributes
 * @param {string} html - HTML content
 * @param {URL} base - Base URL object
 * @returns {string} - Processed HTML
 */
function processOtherUrlAttributes(html, base) {
  let processedHtml = html;
  
  // Process CSS background-image in style attributes
  const styleBackgroundRegex = /style\s*=\s*["']([^"']*background-image\s*:\s*url\(["']?)([^"')]+)(["']?\)[^"']*)["']/gi;
  processedHtml = processedHtml.replace(styleBackgroundRegex, (match, beforeUrl, url, afterUrl) => {
    const absoluteUrl = makeUrlAbsolute(url, base);
    return `style="${beforeUrl}${absoluteUrl}${afterUrl}"`;
  });
  
  // Process video src attributes
  const videoSrcRegex = /<video([^>]*)\ssrc\s*=\s*["']([^"']+)["']([^>]*)/gi;
  processedHtml = processedHtml.replace(videoSrcRegex, (match, beforeSrc, srcUrl, afterSrc) => {
    const absoluteUrl = makeUrlAbsolute(srcUrl, base);
    return `<video${beforeSrc} src="${absoluteUrl}"${afterSrc}`;
  });
  
  // Process source src attributes (for video/audio/picture elements)
  const sourceSrcRegex = /<source([^>]*)\ssrc\s*=\s*["']([^"']+)["']([^>]*)/gi;
  processedHtml = processedHtml.replace(sourceSrcRegex, (match, beforeSrc, srcUrl, afterSrc) => {
    const absoluteUrl = makeUrlAbsolute(srcUrl, base);
    return `<source${beforeSrc} src="${absoluteUrl}"${afterSrc}`;
  });
  
  // Process link rel="stylesheet" href attributes
  const stylesheetRegex = /<link([^>]*)\shref\s*=\s*["']([^"']+)["']([^>]*)/gi;
  processedHtml = processedHtml.replace(stylesheetRegex, (match, beforeHref, hrefUrl, afterHref) => {
    const absoluteUrl = makeUrlAbsolute(hrefUrl, base);
    return `<link${beforeHref} href="${absoluteUrl}"${afterHref}`;
  });
  
  return processedHtml;
}

/**
 * Convert a single URL to absolute if it's relative
 * @param {string} url - URL to process
 * @param {URL} base - Base URL object
 * @returns {string} - Absolute URL
 */
function makeUrlAbsolute(url, base) {
  if (!url || typeof url !== 'string') {
    return url;
  }
  
  // Skip if already absolute (has protocol)
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  
  // Skip if it's a data URL, mailto, tel, etc.
  if (/^(data:|mailto:|tel:|#)/.test(url)) {
    return url;
  }
  
  // Skip if it's a JavaScript pseudo-protocol
  if (/^javascript:/i.test(url)) {
    return url;
  }
  
  try {
    // Use URL constructor to resolve relative URLs
    const absoluteUrl = new URL(url, base.href);
    
    // Return properly encoded URL (spaces become %20, etc.)
    return absoluteUrl.href;
  } catch (error) {
    console.warn(`Failed to resolve URL: ${url} against base: ${base.href}`, error);
    return url; // Return original if resolution fails
  }
}

/**
 * Process URLs in markdown content to make them absolute
 * @param {string} markdownContent - Markdown content to process
 * @param {string} baseUrl - Base URL to resolve relative URLs against
 * @returns {string} - Processed markdown with absolute URLs
 */
export function makeMarkdownUrlsAbsolute(markdownContent, baseUrl) {
  if (!markdownContent || !baseUrl) {
    return markdownContent;
  }

  try {
    const base = new URL(baseUrl);
    let processedMarkdown = markdownContent;

    // Process markdown image syntax: ![alt text](url)
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    processedMarkdown = processedMarkdown.replace(imageRegex, (match, altText, url) => {
      const absoluteUrl = makeUrlAbsoluteForMarkdown(url.trim(), base);
      return `![${altText}](${absoluteUrl})`;
    });

    // Process markdown link syntax: [link text](url)
    const linkRegex = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;
    processedMarkdown = processedMarkdown.replace(linkRegex, (match, linkText, url) => {
      // Skip if this looks like it might be inside an image (already processed above)
      const absoluteUrl = makeUrlAbsoluteForMarkdown(url.trim(), base);
      return `[${linkText}](${absoluteUrl})`;
    });

    // Process reference-style links: [link text][ref] with [ref]: url
    const refLinkDefRegex = /^\s*\[([^\]]+)\]:\s*(.+)$/gm;
    processedMarkdown = processedMarkdown.replace(refLinkDefRegex, (match, ref, url) => {
      const absoluteUrl = makeUrlAbsoluteForMarkdown(url.trim(), base);
      return `[${ref}]: ${absoluteUrl}`;
    });

    return processedMarkdown;
  } catch (error) {
    console.error('Error processing markdown URLs:', error);
    return markdownContent; // Return original on error
  }
}

/**
 * Convert a single URL to absolute if it's relative (for markdown processing)
 * @param {string} url - URL to process
 * @param {URL} base - Base URL object
 * @returns {string} - Absolute URL with spaces preserved
 */
function makeUrlAbsoluteForMarkdown(url, base) {
  if (!url || typeof url !== 'string') {
    return url;
  }
  
  // Skip if already absolute (has protocol)
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  
  // Skip if it's a data URL, mailto, tel, etc.
  if (/^(data:|mailto:|tel:|#)/.test(url)) {
    return url;
  }
  
  // Skip if it's a JavaScript pseudo-protocol
  if (/^javascript:/i.test(url)) {
    return url;
  }
  
  try {
    // Use URL constructor to resolve relative URLs
    const absoluteUrl = new URL(url, base.href);
    
    // Return properly encoded URL (spaces become %20, etc.)
    return absoluteUrl.href;
  } catch (error) {
    console.warn(`Failed to resolve markdown URL: ${url} against base: ${base.href}`, error);
    return url; // Return original if resolution fails
  }
}

/**
 * Extract domain from URL for logging/debugging
 * @param {string} url - URL to extract domain from
 * @returns {string} - Domain or original URL if extraction fails
 */
export function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return url;
  }
}
