---
description: Add new nudge images to the site with metadata
allowed-tools: Bash, Read, Edit, Glob, AskUserQuestion
---

# Add New Nudge

Add any new/untracked nudge images to the site.

## Steps

1. Find untracked image files in `images/` by running `git status --porcelain images/`
2. For each new image file (`.jpg`, `.png`, `.mp4`):
   - View the image using the Read tool to understand its visual characteristics
   - Determine the category (light or dark background)
   - Identify the form factor (modal, popover, tooltip, inline, banner)
   - Note visible features (buttons, image, video, stepper)
3. Ask the user to confirm/provide:
   - Product name (e.g., "Figma", "Notion", "Claude") - can be empty if unknown
   - Verify your assessment of category, form factor, and features
4. Add the metadata entry to `metadata.json`
5. Run `node build.js` to regenerate `data.json`
6. Commit the changes with message "Add [Product] nudge" (or "Add [Product1] and [Product2] nudges" for multiple)
7. Push to origin
8. Report the results

## Metadata Structure

Each nudge entry in `metadata.json` follows this format:
```json
"nudge-XX.ext": {
  "category": "light" or "dark",
  "product": "Product Name",
  "formFactors": ["modal", "popover", "tooltip", "inline", "banner"],
  "features": ["buttons", "image", "video", "stepper"],
  "featured": false
}
```

## Form Factor Guide
- **modal**: Large centered overlay that blocks interaction
- **popover**: Small floating card with arrow pointing to trigger
- **tooltip**: Simple text hint, usually on hover
- **inline**: Embedded within page content
- **banner**: Full-width strip, usually at top/bottom

## Features Guide
- **buttons**: Has clickable buttons (Ok, Next, Got it, etc.)
- **image**: Contains an illustration or screenshot
- **video**: Contains video content (for .mp4 files)
- **stepper**: Has step indicators (1/3, dots, progress)
