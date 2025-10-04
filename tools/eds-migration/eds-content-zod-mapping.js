import { z } from 'zod';

/**
 * EDS Content Schema - Based on Adobe Edge Delivery Services structure
 * Defines the schema for Sections, Blocks, and Default Content
 */

// Default Content Elements (semantic HTML elements)
const DefaultContentElementSchema = z.object({
  type: z.enum(['heading', 'paragraph', 'list', 'image', 'link', 'emphasis', 'strong', 'quote']),
  level: z.number().min(1).max(6).optional(), // For headings h1-h6
  text: z.string(),
  attributes: z.record(z.string()).optional(), // HTML attributes
  children: z.array(z.lazy(() => DefaultContentElementSchema)).optional(), // Nested elements
  // For images - EDS uses <picture> tags with multiple resolutions
  imageData: z.object({
    src: z.string(),
    alt: z.string(),
    srcset: z.string().optional(),
    sizes: z.string().optional(),
    formats: z.array(z.string()).optional() // webp, png, etc.
  }).optional(),
  // For links
  href: z.string().optional(),
  target: z.string().optional()
});

// Block Content (table-based structure)
const BlockContentSchema = z.object({
  rows: z.array(z.array(z.string())), // Table rows and columns
  metadata: z.record(z.string()).optional()
});

// Block Definition
const BlockSchema = z.object({
  name: z.string(), // Block name (first row of table)
  options: z.array(z.string()).optional(), // Parenthetical modifiers
  content: BlockContentSchema,
  metadata: z.record(z.string()).optional()
});

// Section Metadata (for styling and attributes)
const SectionMetadataSchema = z.object({
  style: z.string().optional(), // CSS classes
  customAttributes: z.record(z.string()).optional(),
  background: z.string().optional(),
  layout: z.string().optional()
});

// Section Definition
const SectionSchema = z.object({
  id: z.string().optional(),
  type: z.literal('section'),
  metadata: SectionMetadataSchema.optional(),
  content: z.object({
    defaultContent: z.array(DefaultContentElementSchema),
    blocks: z.array(BlockSchema)
  }),
  // Section can contain both default content and blocks
  hasDefaultContent: z.boolean().optional(),
  hasBlocks: z.boolean().optional()
});

// Page-level metadata
const PageMetadataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  url: z.string(),
  template: z.string().optional(),
  author: z.string().optional(),
  publishDate: z.string().optional(),
  lastModified: z.string().optional(),
  tags: z.array(z.string()).optional(),
  // EDS-specific metadata
  sectionBreaks: z.array(z.string()).optional() // Where sections are separated
});

// Main EDS Page Schema (Simplified)
const EDSPageSchema = z.object({
  page: PageMetadataSchema,
  sections: z.array(SectionSchema),
  // Content analysis metadata
  analysis: z.object({
    totalSections: z.number(),
    totalBlocks: z.number(),
    totalDefaultContent: z.number(),
    blockTypes: z.array(z.string()),
    sectionStyles: z.array(z.string())
  }).optional()
});

// Export the main schema
export { EDSPageSchema, SectionSchema, BlockSchema, DefaultContentElementSchema };

