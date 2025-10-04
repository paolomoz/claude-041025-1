#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { convertToHtml } from './html-conversion-agent.js';
import { uploadToDa } from './da-upload-agent.js';
import { fixGridTableFormatting } from './utils/table-formatting.js';
import { makeUrlsAbsolute, makeMarkdownUrlsAbsolute } from './utils/url-processor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = {
  'convert-html': {
    description: 'Convert markdown to HTML using EDS pipeline',
    usage: 'convert-html <markdown-file> [--url <base-url>]',
    handler: async (args) => {
      const markdownFile = args._[1];
      const baseUrl = args.url;

      if (!markdownFile) {
        throw new Error('Markdown file path required');
      }

      const markdown = readFileSync(markdownFile, 'utf-8');
      const state = { edsMapping: markdown, url: baseUrl };
      const result = await convertToHtml(state);

      if (result.errors?.length > 0) {
        console.error('Errors:', result.errors);
        process.exit(1);
      }

      console.log(result.htmlContent);
      writeFileSync('content.html', result.htmlContent);
    }
  },

  'upload-da': {
    description: 'Upload HTML content to Document Authoring',
    usage: 'upload-da <html-file> --owner <owner> --repo <repo> [--path <path>] [--prefix <prefix>] [--url <original-url>]',
    handler: async (args) => {
      const htmlFile = args._[1];
      const { owner, repo, path, prefix, url } = args;

      if (!htmlFile || !owner || !repo) {
        throw new Error('HTML file, owner, and repo are required');
      }

      const htmlContent = readFileSync(htmlFile, 'utf-8');
      const state = {
        uploadToDa: true,
        daOwner: owner,
        daRepo: repo,
        daPath: path,
        daPrefix: prefix,
        htmlContent,
        url
      };

      const result = await uploadToDa(state);

      if (result.errors?.length > 0) {
        console.error('Errors:', result.errors);
        process.exit(1);
      }

      console.log('Upload successful:', result.daUploadUrl);
    }
  },

  'fix-tables': {
    description: 'Fix grid table formatting in markdown',
    usage: 'fix-tables <markdown-file>',
    handler: async (args) => {
      const markdownFile = args._[1];

      if (!markdownFile) {
        throw new Error('Markdown file path required');
      }

      const markdown = readFileSync(markdownFile, 'utf-8');
      const fixed = fixGridTableFormatting(markdown);
      console.log(fixed);
    }
  },

  'process-urls': {
    description: 'Convert relative URLs to absolute in HTML or markdown',
    usage: 'process-urls <file> --base-url <url> [--format html|markdown]',
    handler: async (args) => {
      const file = args._[1];
      const baseUrl = args['base-url'];
      const format = args.format || 'html';

      if (!file || !baseUrl) {
        throw new Error('File and base URL required');
      }

      const content = readFileSync(file, 'utf-8');

      let processed;
      if (format === 'markdown') {
        processed = makeMarkdownUrlsAbsolute(content, baseUrl);
      } else {
        processed = makeUrlsAbsolute(content, baseUrl);
      }

      console.log(processed);
    }
  },

  'dl-da': {
    description: 'Download content from Document Authoring',
    usage: 'dl-da <da-url> [--output <file>] [--token <bearer-token>]',
    handler: async (args) => {
      const daUrl = args._[1];
      const output = args.output;
      const token = args.token || process.env.DA_BEARER_TOKEN;

      if (!daUrl) {
        throw new Error('DA URL required');
      }

      if (!token) {
        throw new Error('Bearer token required. Provide via --token or DA_BEARER_TOKEN env var');
      }

      console.log(`Downloading from DA: ${daUrl}`);

      const response = await fetch(daUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }

      const content = await response.text();

      if (output) {
        writeFileSync(output, content, 'utf-8');
        console.log(`Content saved to: ${output}`);
      } else {
        console.log(content);
      }

      console.log(`Download successful from: ${daUrl}`);
    }
  }
};

function parseArgs(argv) {
  const args = { _: [] };
  let i = 2; // Skip node and script name

  while (i < argv.length) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      if (value && !value.startsWith('--')) {
        args[key] = value;
        i += 2;
      } else {
        args[key] = true;
        i++;
      }
    } else {
      args._.push(arg);
      i++;
    }
  }

  return args;
}

function showHelp() {
  console.log('Usage: node cli.js <command> [options]');
  console.log('\nCommands:');

  Object.entries(commands).forEach(([name, cmd]) => {
    console.log(`  ${name.padEnd(15)} ${cmd.description}`);
    console.log(`  ${' '.repeat(15)} ${cmd.usage}`);
    console.log();
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const command = args._[0];

  if (!command || command === 'help' || args.help) {
    showHelp();
    return;
  }

  const cmd = commands[command];
  if (!cmd) {
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }

  try {
    await cmd.handler(args);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);