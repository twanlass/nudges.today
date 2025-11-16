# Metadata Reference

This document describes the metadata structure for nudge screenshots.

## Metadata Structure

Each entry in `metadata.json` follows this structure:

```json
{
  "nudge-01.png": {
    "category": "light",
    "product": "Amplitude",
    "formFactors": ["modal", "stepper"],
    "features": ["buttons", "progress-bar", "image"]
  }
}
```

## Properties

### category (required)
The visual theme of the nudge.

**Type:** String
**Values:** `"light"` or `"dark"`

### product (optional)
The name of the product/application featured in the screenshot.

**Type:** String (free-form)
**Examples:** `"Amplitude"`, `"Notion"`, `"Figma"`, `"Linear"`, `"Slack"`

### formFactors (optional)
The UI pattern(s) used for the nudge. Multiple values allowed.

**Type:** Array of strings
**Predefined values:**
- `"modal"` - Full-screen or centered overlay dialog
- `"tooltip"` - Small contextual popup near an element
- `"popover"` - Larger contextual popup with more content
- `"banner"` - Horizontal bar across top or bottom of page
- `"slideout"` - Panel that slides in from the side
- `"toast"` - Temporary notification message
- `"inline"` - Embedded directly in page content

**Example:** `["modal", "stepper"]`

### features (optional)
UI components and elements present in the nudge. Multiple values allowed.

**Type:** Array of strings
**Predefined values:**
- `"stepper"` - Multi-step progress indicator
- `"buttons"` - Action buttons (CTA, cancel, etc.)
- `"image"` - Screenshot or illustration
- `"video"` - Video content or player
- `"progress-bar"` - Linear progress indicator
- `"checklist"` - List of checkable items
- `"form-input"` - Text input, textarea, or form fields
- `"dropdown"` - Select/dropdown menu
- `"tabs"` - Tab navigation
- `"icon"` - Icon or iconography
- `"avatar"` - User avatar or profile picture
- `"badge"` - Notification badge or label

**Example:** `["buttons", "progress-bar", "image"]`

## Additional Properties

These existing properties are also supported:

- `title` - Display title (defaults to filename without extension)
- `description` - Descriptive text
- `tags` - Array of custom tags for searching
- `date` - ISO date string for publish/creation date
- `featured` - Boolean to mark as featured

## Usage

1. Edit `metadata.json` to add or update metadata
2. Run `npm run build` to regenerate `data.json`
3. Refresh your browser to see changes

## Example Entry

```json
{
  "nudge-50.png": {
    "category": "light",
    "product": "Amplitude",
    "formFactors": ["modal"],
    "features": ["stepper", "buttons", "progress-bar", "image"],
    "title": "Onboarding Flow",
    "description": "Multi-step onboarding modal with progress indicator",
    "tags": ["onboarding", "welcome"],
    "date": "2025-01-15",
    "featured": true
  }
}
```
