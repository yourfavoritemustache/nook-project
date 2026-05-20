# Raindrop.io — Feature Map & UI Spec (Android Clone)

## Core Concept
All-in-one bookmark manager. Save links, PDFs, images, videos, articles — organized, searchable, accessible everywhere.

---

## Navigation Structure (Android Bottom Nav + Drawer)

```
Bottom Nav:
  [Home/All] [Search] [Collections] [Tags] [Profile]

Left Drawer:
  - All Bookmarks
  - Unsorted
  - Trash
  ─────────────
  - Collections (expandable tree)
  - Shared Collections
  ─────────────
  - Tags
  ─────────────
  - Highlights
  - Important
```

---

## Screens & Features

### 1. Home / All Bookmarks
- Feed of all saved bookmarks
- View mode toggle: **Grid | List | Headlines | Masonry**
- Sort options: Date added, Date modified, Title, Domain, Manual
- FAB (+) to add new bookmark
- Pull-to-refresh
- Swipe actions: Archive, Delete, Move

### 2. Add Bookmark
- URL input (auto-detect title/thumbnail)
- Title (editable)
- Description (optional)
- Collection picker
- Tag input (with autocomplete)
- Reminder toggle
- Save / Cancel

### 3. Bookmark Detail / Preview
- Full-text reader mode (article parsed)
- Inline video playback
- PDF viewer
- Highlight text → save annotation
- Notes field
- Tags display + edit
- "Open in browser" button
- Share button

### 4. Search
- Full-text search across titles, descriptions, content, tags, domains
- Filter chips: Type (link/article/video/image/PDF), Tag, Domain, Collection, Date range
- Recent searches
- AI Assistant (Stella) integration

### 5. Collections
- Hierarchical (parent → child nesting)
- Drag-to-reorder
- Per-collection icons (thousands of predefined)
- Per-collection view mode override
- Color accent per collection
- Share/make public toggle
- Collaboration: invite members, set permissions (view/edit)

### 6. Tags
- Tag list with bookmark counts
- Tap tag → filtered bookmark list
- Merge tags (multi-select → merge)
- Rename / Delete tag

### 7. Highlights
- All highlights across all bookmarks in one feed
- Each entry shows: source title, highlighted passage, date
- Tap to open original bookmark at highlight position

### 8. Duplicates & Broken Links
- Auto-detected duplicate URLs listed
- Broken/404 links flagged
- Bulk delete / merge actions

### 9. Reminders
- Set date/time reminder on any bookmark
- Notification fires with bookmark title + open action

### 10. Profile / Settings
- Account info (email, avatar)
- Theme: Light / Dark / System
- Import bookmarks (HTML, Pocket, Instapaper, etc.)
- Export (HTML, CSV, JSON)
- Connected integrations (Twitter/X, YouTube, Dropbox, Google Drive)
- Browser extension pairing info
- Subscription status (Free / Pro)
- Permanent copies toggle (web archive)
- Language selector

---

## UI Component Inventory

| Component | Notes |
|---|---|
| BookmarkCard (Grid) | Thumbnail, title, domain favicon, tag pills |
| BookmarkCard (List) | Single row, favicon, title, domain, date |
| BookmarkCard (Headlines) | Title-first, no thumbnail |
| BookmarkCard (Masonry) | Variable height, Pinterest-style |
| CollectionRow | Icon, name, count badge, chevron |
| TagChip | Colored pill, name, count |
| SearchBar | Sticky top, filter icon |
| FilterSheet | Bottom sheet with filter options |
| AddBookmarkSheet | Bottom sheet / full modal |
| ViewModeToggle | 4-icon toggle in toolbar |
| FAB | Teal/blue + icon |
| HighlightCard | Quote block, source meta |

---

## Color Palette (from Raindrop branding)

| Token | Value |
|---|---|
| Primary | `#0D6EFF` (blue) |
| Primary dark | `#0052D4` |
| Surface | `#FFFFFF` / `#1A1A1A` |
| Background | `#F5F5F5` / `#111111` |
| Text primary | `#1A1A1A` / `#EEEEEE` |
| Text secondary | `#777777` |
| Accent/Tag | `#5B5EF4` |
| Danger | `#E53E3E` |
| Success | `#38A169` |

---

## Pro Features (Freemium Gate)
- Full-text search
- Highlights & annotations
- Permanent copies (web archive)
- Broken links detection
- Duplicate detection
- Collaboration / shared collections
- Dropbox / Google Drive backup
- Reminders
- Nested collections (unlimited depth)

---

## Data Models

```typescript
Bookmark {
  id: string
  url: string
  title: string
  excerpt?: string
  cover?: string           // thumbnail URL
  type: 'link'|'article'|'video'|'image'|'document'
  collectionId: number
  tags: string[]
  highlights: Highlight[]
  reminder?: Date
  created: Date
  lastUpdate: Date
  broken?: boolean
  domain: string
}

Collection {
  id: number
  parentId?: number
  title: string
  icon?: string
  color?: string
  isPublic: boolean
  collaborators?: Collaborator[]
  sort: number
  view: 'grid'|'list'|'masonry'|'headlines'
}

Tag {
  _id: string
  count: number
}

Highlight {
  id: string
  bookmarkId: string
  text: string
  note?: string
  created: Date
  color: 'yellow'|'blue'|'red'|'green'
}
```

---

## Integration Points
- Browser extensions (Chrome, Firefox, Safari, Edge)
- Twitter/X → auto-save likes
- YouTube → auto-save favorites
- Dropbox / Google Drive → backup exports
- IFTTT / Zapier → webhook triggers
- REST API (developer.raindrop.io)
