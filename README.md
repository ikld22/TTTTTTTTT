# Cadence

A personal task manager built for focus — not just tracking.

## Features

- **Today view** — one focus task, work/personal split by time of day
- **AI Focus Coach** — powered by DeepSeek, tells you exactly what to work on
- **Projects** — kanban board, milestones, progress ring
- **Calendar** — tasks and deadlines on a monthly grid
- **Time-based mode** — Work Mode (10 AM – 7 PM) · Personal Mode (7 PM – 10 AM)
- **Themes** — Light, Dark, Ink

## Setup

No build step — just open `index.html` in your browser.

## AI Focus Coach

The coach reads your task list and tells you which one to work on right now.

**How to connect:**

1. Get a free API key at [platform.deepseek.com](https://platform.deepseek.com) → API Keys
2. Open the app → Today → enter your key in the Focus Coach card → Connect
3. The key is saved in your browser — you only do this once per device

**Running locally?** Create a `config.js` file in the root to skip the setup step:

```js
window.DEEPSEEK_KEY = 'sk-your-key-here';
```

> `config.js` is gitignored and will never be pushed to GitHub.

## Stack

Vanilla HTML · React 18 (CDN) · No build tools
