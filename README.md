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

1. Clone the repo and open `index.html` in your browser — no build step needed.

2. To enable the AI Focus Coach, create a `config.js` file in the root:

```js
window.DEEPSEEK_KEY = 'sk-your-key-here';
```

Get your key at [platform.deepseek.com](https://platform.deepseek.com) → API Keys.

> `config.js` is gitignored and will never be committed.
> If no `config.js` is present, you can enter the key manually inside the app.

## Stack

Vanilla HTML · React 18 (CDN) · No build tools
