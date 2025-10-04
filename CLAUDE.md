CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.



## Startup Files

At the start of each conversation, read the following files to understand the project context:

### Core Guides
- @./tools/eds-migration/EXCAT__AEM_EDS.md - EDS development best practices and project structure
- @./tools/eds-migration/EXCAT__AEM_DA.md - Document Authoring API interactions
- @./tools/eds-migration/EXCAT__AGENTIC_WORKFLOW.md - Step-by-step migration workflow

### Reference Materials
- @./tools/eds-migration/sta-boilerplate-block-library-no-images.json - Available EDS blocks with examples
- @./tools/eds-migration/block-showcase.md - Complete block showcase with sample implementations (reusable template)
- @./tools/eds-migration/NAVIGATION.md - Navigation setup and troubleshooting
- @./tools/eds-migration/EXCAT__IMAGE_TROUBLESHOOTING.md - Image handling issues and solutions
- @./tools/eds-migration/EXCAT__DEBUGGING.md - General debugging techniques and common issues

### When to Reference
- **block-showcase.md**: Use as a template when creating new pages with block examples, or when needing markdown syntax for any implemented block
- **EXCAT__IMAGE_TROUBLESHOOTING.md**: Read when encountering image rendering issues, "about:error" problems, or when implementing blocks with images
- **EXCAT__DEBUGGING.md**: Read when troubleshooting any EDS issues - provides systematic debugging approaches and CLI commands
- **NAVIGATION.md**: Read when working with site navigation or encountering link styling issues



## Quick Tools

### Adding Blocks from Official Repositories

Use the `tools/eds-migration/helpers/add-block.sh` script to quickly install blocks from Adobe's official repositories:

```bash
# Install from boilerplate (default)
./tools/eds-migration/helpers/add-block.sh <blockname>
./tools/eds-migration/helpers/add-block.sh <blockname> boilerplate

# Install from block collection
./tools/eds-migration/helpers/add-block.sh <blockname> collection

# Examples:
./tools/eds-migration/helpers/add-block.sh quote boilerplate
./tools/eds-migration/helpers/add-block.sh breadcrumbs collection
```

The script will:
- Create `blocks/<blockname>/` directory
- Download `<blockname>.js` and `<blockname>.css` from the specified repository
- Display success message with next steps
- Show file sizes and suggest git commands

**Available sources:**
- `boilerplate` - https://github.com/adobe/aem-boilerplate
- `collection` - https://github.com/adobe/aem-block-collection

## Global Rules

- Whenever you `cd` somewhere to do something, always navigate back to previous location so next steps are not lost!
- Stay concise and stick to any initial plan
- Whenever you have to write a file, do following:
  1. `echo "" > {file}`
  2. Read {file}
  3. Write content to {file}
