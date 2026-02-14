# OpenClaw Desktop Assistant

A desktop application that makes OpenClaw automation accessible to non-technical users through a conversational AI interface.

## Features

- 🤖 **Conversational Setup** - Chat-based agent creation (no CLI needed)
- 🧠 **Local AI** - Uses Gemma3 for offline functionality
- 📅 **Scheduling** - Automatic execution of agents
- 🔄 **LinkedIn Automation** - Post and comment automation
- ✅ **Approval Flow** - Review before publishing
- 💾 **Database** - Stores agents and execution logs

## Architecture

- **Frontend:** React + Tauri
- **Local LLM:** Gemma3 (via Ollama)
- **Database:** In-memory (JavaScript objects)
- **Scheduler:** Custom cron-like system
- **Automation:** Puppeteer (simulated in demo)

## Installation

### Prerequisites

- Node.js v20+
- Rust (for Tauri)
- Ollama with Gemma3 model

### Setup
```bash
# Install dependencies
npm install

# Pull Gemma3 model
ollama pull gemma3:1b

# Run the app
npm run tauri dev
```

## Usage

### Create Agents
```
User: "Create a trending post agent"
Assistant: [Creates agent with daily schedule]
```

### Start Scheduler
```
User: "Start scheduler"
Assistant: [Activates all agents]
```

### Check Status
```
User: "Scheduler status"
Assistant: [Shows running jobs]
```

## Demo Agents

### 1. Trending Topics Agent
- **Schedule:** Daily at 9:00 AM
- **Function:** Searches trending topics, generates post, waits for approval

### 2. Hashtag Comment Bot
- **Schedule:** Hourly
- **Function:** Finds #openclaw posts and adds promotional comments

## Model Switching

- **Default:** Uses local Gemma3 (no API key needed)
- **Optional:** Can be configured to use OpenAI/Claude API keys
- Switch happens automatically when user provides their key

## Project Structure
```
openclaw-desktop/
├── src/
│   ├── components/
│   │   └── ChatWindow.jsx      # Main chat interface
│   ├── services/
│   │   ├── database.jsx         # In-memory database
│   │   ├── agentService.jsx     # Agent creation logic
│   │   ├── linkedinBot.jsx      # LinkedIn automation
│   │   └── scheduler.jsx        # Scheduling system
│   ├── App.jsx
│   └── App.css
├── src-tauri/                   # Tauri backend
├── package.json
└── README.md
```

## Tech Stack

- **Tauri** - Desktop framework
- **React** - UI framework
- **Ollama** - Local LLM runtime
- **Gemma3** - Language model
- **Puppeteer** - Browser automation (simulated)

## Development

Built using "vibe coding" with AI assistance for rapid development.

## Author

[Your Name]

## License

MIT