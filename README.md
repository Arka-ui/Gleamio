<p align="center">
  <img src="public/gleamio-icon.svg" width="80" height="80" alt="Gleamio">
</p>

<h1 align="center">Gleamio</h1>

<p align="center">
  <strong>Free & Open-Source Interactive Content Creation Platform</strong>
</p>

<p align="center">
  <a href="#demo">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-CC--BY--NC--4.0-blue" alt="License">
  <img src="https://img.shields.io/badge/react-18-61dafb" alt="React">
  <img src="https://img.shields.io/badge/typescript-5-3178c6" alt="TypeScript">
  <img src="https://img.shields.io/badge/tailwindcss-3-38bdf8" alt="Tailwind">
  <img src="https://img.shields.io/badge/vite-5-646cff" alt="Vite">
</p>

---

Gleamio is a **free, open-source alternative to Genially** — a full-featured interactive content creation platform where you can build presentations, quizzes, games, infographics, escape rooms, courses, and more using a powerful drag-and-drop editor. No subscription. No paywall. No limits.

> **🎯 Target Audience:** Teachers, students, teenagers, educators, content creators, and anyone who wants to create engaging interactive content without paying for a pro subscription.

---

## Demo

**🌐 [Try Gleamio Live on GitHub Pages →](https://arka-ui.github.io/Gleamio/)**

The demo runs entirely in your browser using localStorage — no backend, no signup required. Perfect for trying out the editor before setting up your own deployment.

> The demo includes all editor features: canvas editing, element management, interactions, animations, templates, and more. Data is saved to your browser's localStorage.

---

## Features

### 🎨 Drag & Drop Canvas Editor

The heart of Gleamio is a full-featured canvas editor with absolute positioning.

| Feature | Description |
|---------|-------------|
| **Element Types** | Text, images, shapes (rectangle, circle, triangle, star, arrow, line), icons, illustrations, videos, audio, tables, charts, iframes, buttons, and smart widgets |
| **Positioning** | Free absolute x/y positioning on an infinite canvas |
| **Multi-Selection** | Click to select, Shift+click for multi-select, drag to box-select |
| **Grouping** | Group/ungroup elements to move and resize together |
| **Z-Index Ordering** | Bring to front, send to back, bring forward, send backward |
| **Alignment & Snapping** | Smart snap guides, grid toggle, ruler toggle |
| **Locking** | Lock elements to prevent accidental edits |
| **Opacity Control** | Fine-grained opacity from 0 to 1 |
| **Image Cropping** | Crop images with custom shapes and masks (`clipPath`) |
| **Undo / Redo** | Full 50-step undo/redo history (Ctrl+Z / Ctrl+Y) |
| **Zoom & Pan** | Scroll to zoom, middle-click to pan, zoom slider, fit-to-screen |
| **Grid & Rulers** | Toggleable pixel grid and rulers for precise alignment |

**How it works (Frontend):**

- Elements are stored in the Zustand `editorStore` as an array of `GleamElement` objects on each `Page`.
- Each element has `x`, `y`, `width`, `height`, `rotation`, `opacity`, `zIndex`, and type-specific properties.
- The `Canvas` component renders elements at their absolute positions scaled by the current zoom level.
- The `CanvasElement` component handles:
  - Mouse-down → selection + drag start
  - Mouse-move → updates element position (`updateElement`)
  - Resize handles (8 directional) for proportional/free resizing
  - Double-click for inline text editing (contentEditable)
- History is managed via a `pushHistory()` call before each mutation, storing page state snapshots.

**How it works (Backend):**

- Projects are serialized as JSON and stored via the REST API (`POST /api/projects`).
- In demo mode, all data is saved to `localStorage` — no backend needed.

---

### 📄 Page Management

Projects are organized into **pages** (not slides), each with its own canvas.

| Feature | Description |
|---------|-------------|
| **Multiple Pages** | Add, duplicate, delete, reorder pages |
| **Page Backgrounds** | Solid color, gradient, image, or looping video |
| **Configurable Dimensions** | 16:9, 4:3, 9:16, A4, square, or custom |
| **Drag Reorder** | Drag page thumbnails in the panel to reorder |
| **25+ Transitions** | Fade, cube, spin, slide (4 directions), zoom, flip, dissolve, wipe, push, cover, uncover, morph, iris, and more |

**How it works:**

- Pages are stored in `project.pages[]` — each with a unique ID, elements array, background config, and transition settings.
- `PagesPanel` renders draggable thumbnails with mini element previews.
- `setActivePage(pageId)` switches the canvas view and clears element selection.
- Transitions are applied in the `Viewer` component during page navigation.

---

### ⚡ Interaction System

**The true differentiator of Gleamio.** Any element can have one or more interactions attached.

| Trigger | Description |
|---------|-------------|
| **Click** | Fires when the user clicks the element |
| **Hover** | Fires when the user hovers over the element |
| **Timer** | Fires after a configurable delay (ms) |
| **Widget Result** | Fires based on a widget's outcome (e.g., quiz answer) |

| Action | Description |
|--------|-------------|
| **Open Modal** | Show a rich content overlay (HTML content) |
| **Show Tooltip** | Display a positioned tooltip |
| **Go to Page** | Navigate to another project page |
| **Scroll to Anchor** | Scroll to a specific element on the same page |
| **Open URL** | Open an external link |
| **Zoom Fullscreen** | Zoom element to fill the screen |
| **Play Sound** | Play an audio file |
| **Fire Effect** | Trigger confetti, fireworks, snow, hearts, or stars |
| **Show/Hide Element** | Show, hide, or toggle another element's visibility |
| **Drag & Drop** | Enable drag-to-target-zone mechanic with correct/incorrect outcomes |
| **Paint Mode** | Enable freehand brush drawing on the canvas |

**How it works:**

- Each element has an `interactions: Interaction[]` array.
- Each `Interaction` has an `id`, `trigger` (click/hover/timer/widgetResult), and `action` with action-specific config.
- The `InteractionsPanel` provides a collapsible editor for each interaction — select trigger, choose action, configure parameters.
- In the `Viewer`, interactions are evaluated at runtime: event listeners are attached based on triggers, and action handlers execute the configured behavior.

---

### 🎬 Animation System

Every element supports four types of animations:

| Stage | Description |
|-------|-------------|
| **Entrance** | Plays when the element appears on screen |
| **Exit** | Plays when the element disappears |
| **Continuous** | Loops while the element is visible |
| **Hover** | Plays when the user hovers over the element |

Each animation is configured with:
- **Effect:** fadeIn, fadeOut, slideLeft/Right/Up/Down, zoomIn/Out, bounce, pulse, shake, flip, rotate, typewriter, blur
- **Duration:** in milliseconds
- **Delay:** start delay in milliseconds
- **Speed:** slow / normal / fast
- **Direction:** left / right / up / down (where applicable)

**How it works:**

- Animations are stored as `animations: ElementAnimation[]` on each element.
- The `AnimationsPanel` lets you add/edit/remove animations per element.
- In the `Viewer`, CSS animations or Framer Motion are applied based on the animation config at the appropriate lifecycle stage.

---

### 🧭 Navigation Modes

Configure how users navigate through your project:

| Mode | Description |
|------|-------------|
| **Linear** | Arrow-based slideshow (← →) |
| **Microsite** | No forced navigation — users explore by clicking interactive elements |
| **Branching** | Non-linear paths driven by go-to-page interactions |
| **Autoplay** | Pages advance automatically with timed durations (video-like) |

---

### 🧠 Quiz Engine

A full quiz system supporting rich question types:

| Question Type | Description |
|---------------|-------------|
| **Multiple Choice** | Single or multi-answer selection |
| **True / False** | Binary choice |
| **Image Choice** | Select from image options |
| **Open-Ended** | Free text answer |
| **Fill-in-the-Blank** | Complete the sentence |
| **Sequencing** | Put items in the correct order |
| **Drag to Match** | Drag items to correct target zones |
| **Rating / Likert** | Scale-based responses |

Each question supports:
- Immediate correct/incorrect feedback with visual indicators
- Optional explanation text
- Automatic scoring with point values
- Configurable retry support
- Optional time limits per question

**How it works (Frontend):**

- Quiz questions are defined as `QuizQuestion` objects with typed options, correct answers, point values, and config.
- The quiz renderer displays questions based on type with appropriate input controls.
- Scoring is computed client-side in real-time.
- Results can be viewed in the analytics dashboard or exported via SCORM.

**How it works (Backend):**

- Quiz responses are collected via `POST /api/live/:code/response` during live sessions.
- AI-powered quiz generation uses `POST /api/ai/generate-quiz` with an OpenAI API key.

---

### 🧩 Smart Widgets

Pre-built interactive components:

| Widget | Description |
|--------|-------------|
| **Randomizer** | Picks a random image, word, or question from a list with shuffle animation |
| **Coin Flip** | Heads or tails with conditional actions based on result |
| **Dice** | Numeric, color, direction, or math operation dice with conditional actions |
| **Image Compare** | Draggable slider to compare two images side by side |
| **Countdown Timer** | Timer that can trigger actions when it reaches zero |
| **Flip Cards** | Click-to-reveal front/back cards (flashcards, surprises) |
| **Swipe Carousel** | Tinder-style swipe card carousel |
| **World Map** | Interactive SVG map with clickable countries/regions |
| **Scoreboard** | Leaderboard for game-based content |

---

### 👥 Real-Time Collaboration

| Feature | Description |
|---------|-------------|
| **Live Cursors** | See other editors' cursors in real-time |
| **Instant Sync** | Changes sync across all connected clients |
| **Team Workspaces** | Shared projects, folders, and asset libraries |
| **Role-Based Access** | Owner, Admin, Editor, Viewer |
| **Project Visibility** | Public, password-protected, or private (signed link) |

**How it works:**

- Socket.IO handles real-time communication between clients.
- When a user moves their cursor, `cursor-move` events broadcast to the project room.
- Element updates emit `element-update` events for instant sync.
- The backend manages project rooms (`join-project` / `leave-project`).

---

### 📊 Analytics Dashboard

| Metric | Description |
|--------|-------------|
| **Total Views** | Overall project view count |
| **Per-Page Views** | Which pages are most visited |
| **Completion Rate** | % of viewers who reach the last page |
| **Hotspot Clicks** | Click counts per interactive element |
| **Quiz Distributions** | Per-question answer breakdown |
| **Learner Progression** | Individual user journey tracking |

---

### 📤 Export & Share

| Format | Description |
|--------|-------------|
| **Public URL** | Shareable link to the live project |
| **Embed (iframe)** | Embed in any website or LMS |
| **PDF** | Static visual capture of all pages |
| **MP4** | Video render of autoplay mode |
| **SCORM 1.2 / 2004** | LMS-compatible package (score, completion, time-spent) |
| **LTI Integration** | Direct LMS gradebook sync |
| **JSON Export** | Full project data for backup/migration |

---

### 🎤 Live Session Mode

| Feature | Description |
|---------|-------------|
| **Session Code** | Participants join via 6-character code |
| **QR Code** | Scan to join from phone |
| **Presenter Control** | Host controls pacing manually |
| **Live Responses** | Aggregated answers display as animated charts |
| **Leaderboard** | End-of-session scoreboard |

A direct competitor to **Kahoot** and **Mentimeter** — built right into Gleamio.

**How it works:**

- `POST /api/live/create` generates a session code.
- Participants connect via Socket.IO.
- The host emits page navigation events; participants see content and respond.
- Responses aggregate in real-time and display as charts.

---

### 🤖 AI-Powered Tools

| Tool | Description |
|------|-------------|
| **Quiz Generation** | Auto-generate quiz questions from a topic or uploaded PDF |
| **Image Generation** | Create images from text prompts (DALL-E) |
| **Text-to-Speech** | Generate voiceover with synthetic voices |
| **Project Translation** | One-click translate entire project to another language |
| **Inline Text Editing** | Rephrase, summarize, improve text directly in any text block |

**How it works:**

- AI features call the backend API (`/api/ai/*` endpoints).
- The backend proxies requests to OpenAI/Anthropic APIs using keys from `.env`.
- In demo mode, AI features show a placeholder message directing users to configure API keys.

---

### 🖼️ Asset Library

| Source | Content |
|--------|---------|
| **Stock Photos** | Unsplash, Pexels integration |
| **GIFs** | Giphy integration |
| **Vector Icons** | Search and drag icons |
| **Illustrations** | Themed illustration packs |
| **SVG Shapes** | Geometric shapes library |
| **Audio** | Royalty-free sound effects and music |

Plus a **template gallery** with hundreds of ready-to-use projects:
- Presentations, Infographics, Quizzes, Games, Escape Rooms, Courses, Brochures, Social Media

---

### 🌓 Themes

Gleamio ships with **Light** and **Dark** themes, plus a **System** option that follows your OS preference.

Theme switching is instant (CSS class toggle on `<html>`), with smooth transitions on background and text colors. The preference is saved to `localStorage`.

---

## Installation

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9 (or pnpm / yarn)
- **Git**

### Quick Start (Frontend Only — Demo Mode)

```bash
# Clone the repository
git clone https://github.com/arka-ui/Gleamio.git
cd Gleamio

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:3000** in your browser. That's it! The app runs in demo mode using localStorage.

### Full Setup (Frontend + Backend)

```bash
# Clone the repository
git clone https://github.com/arka-ui/Gleamio.git
cd Gleamio

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..

# Copy environment template
cp .env.example .env

# Edit .env with your configuration (see Configuration section below)

# Start both frontend and backend
npm run dev:full
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Health:** http://localhost:4000/api/health

### Production Build

```bash
# Build the frontend
npm run build

# The output is in ./dist — serve with any static file server
# For the backend:
cd server
node index.js
```

### Deploy to GitHub Pages (Demo)

```bash
npm run deploy:demo
```

This builds the app in demo mode (no backend) and deploys to GitHub Pages.

---

## Configuration

### Environment Variables (`.env`)

Copy `.env.example` to `.env` and customize:

```ini
# ─── App ─────────────────────────────────────
VITE_APP_NAME=Gleamio              # App display name
VITE_APP_URL=http://localhost:3000 # Frontend URL
VITE_DEMO_MODE=false               # Set to "true" for demo mode (no backend)

# ─── Backend ─────────────────────────────────
SERVER_PORT=4000                   # Express server port
JWT_SECRET=your-random-secret-here # Used to sign auth tokens
                                   # Generate with: openssl rand -hex 32
CORS_ORIGINS=http://localhost:3000 # Allowed origins (comma-separated)

# ─── Database ────────────────────────────────
DATABASE_URL=postgresql://gleamio:password@localhost:5432/gleamio
# The in-memory store works for dev. For production, configure PostgreSQL.

# ─── Redis (optional) ────────────────────────
REDIS_URL=redis://localhost:6379
# Required for production real-time collaboration. Optional for dev.

# ─── File Storage ────────────────────────────
STORAGE_DRIVER=local               # "local" or "s3"
UPLOAD_DIR=./uploads               # Local upload path

# S3 Settings (if STORAGE_DRIVER=s3)
S3_BUCKET=your-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret
S3_ENDPOINT=                       # Optional, for S3-compatible services

# ─── AI Features (optional) ──────────────────
OPENAI_API_KEY=sk-...              # Required for AI quiz gen, image gen, TTS
ANTHROPIC_API_KEY=sk-ant-...       # Alternative AI provider

# ─── Asset Library (optional) ────────────────
UNSPLASH_ACCESS_KEY=               # For stock photo search
PEXELS_API_KEY=                    # Alternative photo source
GIPHY_API_KEY=                     # For GIF search

# ─── Email (optional) ────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@gleamio.app

# ─── OAuth (optional) ────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### What needs to be configured?

| Level | What to configure | What it enables |
|-------|-------------------|-----------------|
| **Minimum (demo)** | Nothing | Full editor in browser, localStorage |
| **Basic backend** | `JWT_SECRET` | User auth, project persistence |
| **File uploads** | `STORAGE_DRIVER`, `UPLOAD_DIR` or S3 keys | Image/video uploads |
| **Real-time collab** | `REDIS_URL` | Multi-user editing |
| **AI features** | `OPENAI_API_KEY` | Quiz gen, image gen, TTS, translation |
| **Asset library** | `UNSPLASH_ACCESS_KEY`, `GIPHY_API_KEY` | Stock photo/GIF search |
| **Email** | SMTP settings | Invite emails, notifications |
| **OAuth** | Google/GitHub client IDs | Social login |

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript 5, Vite 5 |
| **Styling** | Tailwind CSS 3 (dark mode via `class` strategy) |
| **State** | Zustand (lightweight, no boilerplate) |
| **Icons** | Lucide React |
| **Animations** | Framer Motion + CSS animations |
| **Routing** | React Router v6 |
| **Backend** | Node.js + Express |
| **Real-time** | Socket.IO |
| **Database** | PostgreSQL (production) / in-memory (dev) |
| **Cache** | Redis (optional, for collab) |

### Project Structure

```
Gleamio/
├── public/                    # Static assets
│   └── gleamio-icon.svg       # App icon
├── server/                    # Backend API
│   ├── index.js               # Express + Socket.IO server
│   └── package.json           # Server dependencies
├── src/                       # Frontend source
│   ├── components/
│   │   └── editor/
│   │       ├── Canvas.tsx           # Main canvas viewport
│   │       ├── CanvasElement.tsx     # Individual element renderer
│   │       ├── EditorToolbar.tsx     # Top toolbar (undo, zoom, etc.)
│   │       ├── LeftPanel.tsx         # Left sidebar container
│   │       ├── RightPanel.tsx        # Right sidebar container
│   │       ├── BottomBar.tsx         # Status bar + zoom
│   │       └── panels/
│   │           ├── PagesPanel.tsx         # Page thumbnails + management
│   │           ├── ElementsPanel.tsx      # Element picker + shapes
│   │           ├── AssetsPanel.tsx        # Stock photos, icons, GIFs
│   │           ├── TemplatesPanel.tsx     # Template gallery
│   │           ├── PropertiesPanel.tsx    # Element properties editor
│   │           ├── InteractionsPanel.tsx  # Interaction builder
│   │           └── AnimationsPanel.tsx    # Animation editor
│   ├── pages/
│   │   ├── Landing.tsx        # Public landing page
│   │   ├── Dashboard.tsx      # Project management dashboard
│   │   ├── Editor.tsx         # Main editor page
│   │   └── Viewer.tsx         # Project presentation viewer
│   ├── store/
│   │   ├── editorStore.ts     # Main editor state (Zustand)
│   │   └── themeStore.ts      # Theme management
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── App.tsx                # Router setup
│   ├── main.tsx               # Entry point
│   ├── index.css              # Global styles + Tailwind
│   └── vite-env.d.ts          # Vite type declarations
├── .env.example               # Environment template
├── .gitignore
├── index.html                 # HTML entry point
├── LICENSE                    # CC BY-NC 4.0
├── package.json               # Frontend dependencies + scripts
├── postcss.config.js
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
└── README.md                  # This file
```

### State Management

Gleamio uses **Zustand** for state management — chosen for its minimal API and excellent performance with React:

- **`editorStore`** — The main store managing:
  - Current project (pages, elements, metadata)
  - Selection state (selected element IDs)
  - Canvas viewport (zoom, pan)
  - UI state (panel visibility, active tabs)
  - History (undo/redo stack with 50-entry limit)
  - All CRUD actions for pages and elements

- **`themeStore`** — Manages light/dark/system theme with localStorage persistence.

### Data Flow

```
User Action → Store Action → State Update → React Re-render
                  ↓
           pushHistory() (before mutations)
                  ↓
           localStorage auto-save (every 3s)
                  ↓
           (optional) API sync to backend
```

### Canvas Rendering

The canvas uses CSS transforms for zoom/pan:

```
Container (overflow: hidden)
  └── Canvas layer (transform: translate + scale)
       └── Elements (position: absolute, x/y * zoom)
            └── Resize handles (8 directional)
```

Elements are rendered in z-index order. Selection is shown with a 2px blue outline. Resize handles appear on selected elements. Multi-selection uses a rubber-band box or Shift+Click.

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive token |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/:id` | Get project by ID |
| POST | `/api/projects` | Create a new project |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/generate-quiz` | Generate quiz from topic/PDF |
| POST | `/api/ai/generate-image` | Generate image from prompt |
| POST | `/api/ai/text-to-speech` | Generate voiceover |
| POST | `/api/ai/translate` | Translate project content |
| POST | `/api/ai/edit-text` | Rephrase/summarize/improve text |

### Live Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/live/create` | Create a live session |
| GET | `/api/live/:code` | Get session by code |

### Real-Time Events (Socket.IO)

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-project` | Client → Server | Join a project room |
| `leave-project` | Client → Server | Leave a project room |
| `cursor-move` | Bidirectional | Broadcast cursor position |
| `element-update` | Bidirectional | Sync element changes |
| `page-update` | Bidirectional | Sync page changes |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo |
| `Ctrl + D` | Duplicate selected elements |
| `Delete` / `Backspace` | Delete selected elements |
| `Shift + Click` | Multi-select elements |

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Gleamio is released under the **[Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/)**.

**You are free to:**
- ✅ Use, modify, and distribute for **personal and educational use**
- ✅ Self-host for your school, university, or organization
- ✅ Fork and customize for **non-commercial projects**

**You may NOT:**
- ❌ Sell, resell, or monetize Gleamio or derivative works
- ❌ Offer Gleamio as a paid service (SaaS)
- ❌ Use in commercial products without permission

---

<p align="center">
  Made with ❤️ by Arka and the Gleamio community
  <br/>
  <sub>If Gleamio helps you, give it a ⭐ on GitHub!</sub>
</p>
