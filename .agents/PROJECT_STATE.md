# Elaris Content Engine — Global Project State

This file serves as the definitive source of truth for the project's current state, architecture, and history. **All AI models must read this file at the start of a conversation** to carry on from where the last one left off.

## 1. Project Overview
- **Name**: Elaris Content Engine v3.0 (@elaris.925)
- **Purpose**: An Instagram content studio designed for Elaris Jewelry Store. It transforms raw photos into branded, high-quality social media posts.
- **Tech Stack**: Vanilla HTML, CSS, JavaScript. No complex build steps or frameworks. It features a custom lightweight JS router (`app.js`) and PWA support via `sw.js` and `manifest.json`.

## 2. Core Modules
The application is structured into several core views:
- **Prompt Studio (`js/prompt-studio.js`)**: For generating AI prompts. Includes logic for "Archetypes", "Smart Guides", "Stones", and "Materials".
- **Motion Studio (`js/motion-studio.js`)**: Module for video/motion graphics generation.
- **Captions (`js/captions.js`)**: Generates branded captions and hashtag sets based on product type and brand voice (Luxury, Conversational, Storytelling).
- **Trends (`js/trends.js` or via `assets/trends.json`)**: Tracks current jewelry & design trends. Warns users if data is older than 30 days.
- **Batch Mode (`js/batch.js`)**: Handles bulk operations.
- **Watermark (`js/watermark.js`)**: For applying branded watermarks to images.
- **Generate (`js/generate.js`)**: Logic for content generation pipelines.
- **Export (`js/export.js`)**: Utilities for copying to clipboard, downloading files, etc.
- **Internationalization (`js/i18n.js`)**: Supports multiple languages (EN, FR, AR).

## 3. Important Architectural Rules & Patterns
- **Archetype Integration**: When adding a new archetype, it requires a version badge (e.g., "V3.0"), a calibrated Smart Guide (camera angle, framing), normalized stone/material labels (human-readable), and connection to dynamic camera/lighting.
- **UI/UX**: Uses a dark/light mode toggle. Uses PWA features for mobile compatibility.
- **Git Workflow**: The AI is instructed to automatically run `git add`, `git commit`, and `git push` at the end of every task to ensure no updates are lost between sessions.

## 4. Update Log
*Add an entry here every time you make a significant change, implement a new feature, or refactor architecture. Always include the date/time and a concise summary.*

- **2026-07-18**: Created `PROJECT_STATE.md` to serve as the global context file for all future AI agents. Updated `.agents/AGENTS.md` to mandate reading this file at startup.
- **2026-07-18**: Added 5 new Watch archetypes with a dedicated `WATCH` badge. Expanded `prompt-studio.js` with new watch-specific camera angles and lighting moods. Updated `guideDB` and `archetypeAngleBoost` to fully integrate watch logic, and added `.ps-watch-badge` styling to `styles.css`.
