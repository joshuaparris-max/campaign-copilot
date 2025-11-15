# Campaign Copilot

A simple, versatile web app for D&D 5e players to use during live sessions. Helps you think clearly, track quests, manage NPCs, and get AI-assisted suggestions for what to do next.

## Features

- **Session Brain**: Type what just happened and get 3 suggested next options
- **Quest & Rumour Tracker**: Keep track of all open quests, filter by location, toggle status
- **NPC & Business Notes**: Manage NPCs and business venture ideas
- **LocalStorage Persistence**: All data saved locally in your browser
- **Dark Theme**: Easy on the eyes for low-light gaming sessions
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** for fast development
- **TailwindCSS** for styling
- **localStorage** for data persistence

## Getting Started

### Prerequisites

- Node.js 18+ (20.19.0+ recommended)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── SessionPanel.tsx      # Main AI suggestion panel
│   ├── QuestTracker.tsx      # Quest management
│   └── NPCBusinessPanel.tsx  # NPCs and business ideas
├── aiClient.ts               # AI suggestion abstraction (ready for LLM)
├── storage.ts                # localStorage helpers
├── types.ts                  # TypeScript type definitions
├── App.tsx                   # Main app component
└── main.tsx                   # Entry point
```

## Usage

1. **Set Current Location**: Enter your current location (e.g., "Seahaven", "Two Weeks at Sea")
2. **Describe What Happened**: Type the most recent development in the session
3. **Get Suggestions**: Click "Suggest Next 3 Options" to get AI-assisted ideas
4. **Track Quests**: Add quests, set their status, and filter by location
5. **Manage NPCs**: Keep notes on NPCs you meet, their roles, and locations
6. **Business Ideas**: Track business ventures and opportunities

## Future Features (Planned)

- v0.2: Hub/Lead model, smarter rule-based suggestions
- v0.3: Real LLM integration (OpenAI API)
- v0.4: D&D Beyond character integration
- v0.5: Screenshot analysis for VTT suggestions

## License

MIT
