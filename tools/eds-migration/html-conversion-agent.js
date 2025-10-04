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

import { toHtml } from 'hast-util-to-html';
import { IDSlugger } from '@adobe/helix-html-pipeline/src/utils/id-slugger.js';
import html from '@adobe/helix-html-pipeline/src/steps/make-html.js';
import parseMarkdown from '@adobe/helix-html-pipeline/src/steps/parse-markdown.js';
import split from '@adobe/helix-html-pipeline/src/steps/split-sections.js';
import fixSections from '@adobe/helix-html-pipeline/src/steps/fix-sections.js';
import createPageBlocks from '@adobe/helix-html-pipeline/src/steps/create-page-blocks.js';
import { makeUrlsAbsolute, makeMarkdownUrlsAbsolute, extractDomain } from './utils/url-processor.js';
import { fixGridTableFormatting } from './utils/table-formatting.js';

/**
 * Convert markdown to HTML
 * @param {string} md - The markdown to convert
 * @returns {string} The converted HTML
 */
function md2htmlInternal(md) {
  const state = { content: { data: md, slugger: new IDSlugger() } };

  parseMarkdown(state);

  split(state);

  html(state);
    
  fixSections(state);
  createPageBlocks(state);
  
  return toHtml(state.content.hast, {
    upperDoctype: true,
  });
}


/**
 * HTML Conversion Agent
 * Converts markdown to HTML using Edge Delivery Services pipeline
 */
export async function convertToHtml(state) {
  try {
    const { edsMapping, url } = state;
    
    if (!edsMapping) {
      console.log('No EDS mapping available, skipping HTML conversion');
      return state;
    }
    
    // Process URLs in markdown first (before HTML conversion)
    let processedMarkdown = edsMapping;
    if (url) {
      console.log(`Processing relative URLs in markdown against base: ${extractDomain(url)}`);
      processedMarkdown = makeMarkdownUrlsAbsolute(edsMapping, url);
      console.log('Markdown URLs processed to absolute URLs');
      processedMarkdown = fixGridTableFormatting(processedMarkdown);
      console.log('Markdown tables fixed');
    }
    
    // Convert to DA compliant HTML
    let htmlContent = `<body><main>${md2htmlInternal(processedMarkdown)}</main></body>`;
    console.log('Converting markdown to DA compliant HTML');
    
    // Process remaining URLs in HTML (for any URLs that weren't in markdown format)
    if (url) {
      console.log(`Processing remaining relative URLs in HTML against base: ${extractDomain(url)}`);
      htmlContent = makeUrlsAbsolute(htmlContent, url);
      console.log('HTML URLs processed to absolute URLs');
    } else {
      console.log('No original URL available, keeping relative URLs as-is');
    }
    
    return {
      ...state,
      htmlContent
    };
  } catch (error) {
    console.error('Error converting to HTML:', error);
    return {
      ...state,
      errors: [...(state.errors || []), `HTML conversion failed: ${error.message}`]
    };
  }
}

export { md2htmlInternal as md2da };
