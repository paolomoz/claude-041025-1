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
- @./block-showcase.md - Complete block showcase with sample implementations (reusable template)
- @./tools/eds-migration/NAVIGATION.md - Navigation setup and troubleshooting
- @./tools/eds-migration/EXCAT__IMAGE_TROUBLESHOOTING.md - Image handling issues and solutions
- @./tools/eds-migration/EXCAT__DEBUGGING.md - General debugging techniques and common issues

### When to Reference
- **block-showcase.md**: Use as a template when creating new pages with block examples, or when needing markdown syntax for any implemented block
- **EXCAT__IMAGE_TROUBLESHOOTING.md**: Read when encountering image rendering issues, "about:error" problems, or when implementing blocks with images
- **EXCAT__DEBUGGING.md**: Read when troubleshooting any EDS issues - provides systematic debugging approaches and CLI commands
- **NAVIGATION.md**: Read when working with site navigation or encountering link styling issues



## Global Rules

- Whenever you `cd` somewhere to do something, always navigate back to previous location so next steps are not lost!
- Stay concise and stick to any initial plan
- Whenever you have to write a file, do following:
  1. `echo "" > {file}`
  2. Read {file}
  3. Write content to {file}
