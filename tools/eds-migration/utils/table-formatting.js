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
 * Table formatting utilities extracted for testing
 * These functions are used to fix grid table formatting in markdown
 */

/**
 * Fix grid table formatting to ensure exact column alignment
 * Each column across ALL rows must have the same width
 */
export function fixGridTableFormatting(markdown) {
  const lines = markdown.split('\n');
  const fixedLines = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Check if this starts a table
    if (line.match(/^\+[-=+]+\+/)) {
      const tableResult = fixTableBlock(lines, i);
      fixedLines.push(...tableResult.fixedLines);
      i = tableResult.nextIndex;
    } else {
      fixedLines.push(line);
      i++;
    }
  }
  
  return fixedLines.join('\n');
}

/**
 * Fix a complete table block with consistent column widths
 */
function fixTableBlock(lines, startIndex) {
  const tableLines = [];
  let i = startIndex;
  
  // Collect all lines that are part of this table
  while (i < lines.length) {
    const line = lines[i];
    if (line.match(/^(\+[-=+]+\+|\|.*\|)$/)) {
      tableLines.push({ line, index: i });
      i++;
    } else if (line.trim() === '') {
      // Empty line might be part of table (multi-line cells)
      const nextLine = lines[i + 1];
      if (nextLine && nextLine.match(/^(\+[-=+]+\+|\|.*\|)$/)) {
        tableLines.push({ line, index: i });
        i++;
      } else {
        break; // End of table
      }
    } else {
      break; // End of table
    }
  }
  
  
  // Ensure we have at least one table line to avoid infinite loops
  if (tableLines.length === 0) {
    // No table found, just return the original line and advance
    return { fixedLines: [lines[startIndex]], nextIndex: startIndex + 1 };
  }
  
  // Separate header and content sections based on separator types
  const sections = separateHeaderAndContentSections(tableLines);
  
  // If no content rows found, just return original lines
  if (sections.contentRows.length === 0) {
    return { fixedLines: tableLines.map(item => item.line), nextIndex: i };
  }
  
  // Calculate column widths based on content rows only (ignore single-column headers)
  const columnWidths = calculateColumnWidths(sections.contentRows.map(item => item.line));
  
  // Generate fixed table lines
  const fixedLines = tableLines.map(item => {
    const line = item.line;
    
    if (line.match(/^\+[-=]+\+/)) {
      // Border line - create with consistent column widths
      const useEquals = line.includes('=');
      return createBorderFromWidths(columnWidths, useEquals);
    } else if (line.match(/^\|.*\|$/)) {
      // Check if this is a header row or content row
      if (sections.headerRows.some(headerItem => headerItem.line === line)) {
        // Header row - handle as single column spanning all content columns
        return createHeaderRow(line, columnWidths);
      } else {
        // Content row - pad cells to match column widths
        return padContentLine(line, columnWidths);
      }
    } else {
      // Empty line or other
      return line;
    }
  });
  
  // Ensure nextIndex always advances past the starting point
  const nextIndex = Math.max(i, startIndex + 1);
  return { fixedLines, nextIndex };
}

/**
 * Separate header rows from content rows based on position relative to separator lines
 */
function separateHeaderAndContentSections(tableLines) {
  const headerRows = [];
  const contentRows = [];
  
  let inHeaderSection = false;
  let headerSeparatorFound = false;
  
  for (let i = 0; i < tableLines.length; i++) {
    const item = tableLines[i];
    const line = item.line;
    
    if (line.match(/^\+[-=]+\+/)) {
      if (line.includes('=')) {
        // This is a header separator - anything before this is header
        headerSeparatorFound = true;
        inHeaderSection = false; // Switch to content section after this
      }
    } else if (line.match(/^\|.*\|$/)) {
      if (!headerSeparatorFound) {
        // We haven't seen a header separator yet, so this might be header
        inHeaderSection = true;
        headerRows.push(item);
      } else {
        // We've seen a header separator, so this is content
        contentRows.push(item);
      }
    }
  }
  
  // If no header separator was found, treat all as content rows
  if (!headerSeparatorFound) {
    return { headerRows: [], contentRows: tableLines.filter(item => item.line.match(/^\|.*\|$/)) };
  }
  
  return { headerRows, contentRows };
}

/**
 * Create a header row that spans all content columns
 */
function createHeaderRow(headerLine, columnWidths) {
  // Parse the header line to extract meaningful content
  const headerColumns = headerLine.split('|').slice(1, -1); // Remove empty first/last elements
  
  // Extract the actual header text (usually in the first column, ignore empty padding columns)
  let headerText = '';
  for (const col of headerColumns) {
    const trimmed = col.trim();
    if (trimmed) {
      headerText = trimmed;
      break; // Take the first non-empty column as the header
    }
  }
  
  // If no meaningful content found, use the first column as-is
  if (!headerText) {
    headerText = headerColumns[0] || '';
  }
  
  // Calculate total width needed (all column widths + separators between columns)
  const totalContentWidth = columnWidths.reduce((sum, width) => sum + width, 0) + (columnWidths.length - 1);
  
  // Create a properly padded single-column header that spans all content columns
  let paddedHeader = ' ' + headerText + ' '; // Add minimal padding around text
  
  // Pad to match total content width
  if (paddedHeader.length < totalContentWidth) {
    const extraPadding = totalContentWidth - paddedHeader.length;
    paddedHeader = paddedHeader + ' '.repeat(extraPadding);
  } else if (paddedHeader.length > totalContentWidth) {
    // Trim if somehow too long, but preserve the text
    paddedHeader = paddedHeader.substring(0, totalContentWidth);
  }
  
  return '|' + paddedHeader + '|';
}

/**
 * Calculate maximum width needed for each column
 */
function calculateColumnWidths(contentLines) {
  const columnWidths = [];
  
  contentLines.forEach(line => {
    const columns = line.split('|').slice(1, -1); // Remove empty first/last
    columns.forEach((column, index) => {
      if (!columnWidths[index]) {
        columnWidths[index] = 0;
      }
      columnWidths[index] = Math.max(columnWidths[index], column.length);
    });
  });
  
  return columnWidths;
}

/**
 * Pad content line cells to match column widths
 */
function padContentLine(line, columnWidths) {
  const columns = line.split('|').slice(1, -1);
  const paddedColumns = columns.map((column, index) => {
    const targetWidth = columnWidths[index] || column.length;
    if (column.length < targetWidth) {
      // Pad with spaces at the end
      return column + ' '.repeat(targetWidth - column.length);
    }
    return column;
  });
  
  return '|' + paddedColumns.join('|') + '|';
}

/**
 * Create border line with consistent column widths
 */
function createBorderFromWidths(columnWidths, useEquals = false) {
  const char = useEquals ? '=' : '-';
  let border = '+';
  columnWidths.forEach(width => {
    border += char.repeat(width) + '+';
  });
  return border;
}
