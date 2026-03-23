# Battleship

A simple online Battleship game playable against an AI, built with React + Vite + TypeScript.

## Features

- Two 10x10 boards: your fleet and enemy waters
- Standard Battleship fleet: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)
- Random ship placement for both player and AI
- Player controls: Randomize My Board, Start Game, Restart Game
- Click-to-attack on enemy board
- AI uses hunt-and-target strategy (hunts randomly, then targets adjacent cells after a hit)
- Clear feedback for hits, misses, sunk ships, and game outcome
- Game locks after win/loss (no more moves allowed)
- Immersive underwater-themed visuals with ship shapes, wreck effects, and ambient animations

## Project Structure

```
src/
  game/           # Pure game logic (no React dependencies)
    types.ts      # Type definitions and constants
    board.ts      # Board creation and ship placement
    attack.ts     # Attack processing (hit/miss/sunk)
    ai.ts         # AI hunt-and-target strategy
    index.ts      # Barrel export
  components/     # React UI components
    Board.tsx     # Board grid component
    Board.css     # Board styles
    StatusBar.tsx  # Game status / feedback display
    FleetStatus.tsx # Ship status list
  __tests__/      # Unit tests for game logic
    board.test.ts
    attack.test.ts
    ai.test.ts
  App.tsx         # Main app component
  App.css         # App styles
  main.tsx        # Entry point
  index.css       # Global styles
```

## Local Setup

### Prerequisites

- Node.js >= 18
- npm >= 9

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

### Run Tests

```bash
npm test
```

### Lint

```bash
npm run lint
```

## Deployment

This project is ready for Vercel deployment. Just connect the repo and Vercel will auto-detect the Vite framework.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** for build tooling
- **Vitest** for unit testing
- No additional runtime dependencies

## License

MIT
