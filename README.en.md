# Pure Sudoku

[简体中文](README.md) | [English](README.en.md)

A clean Sudoku app built with Expo, React Native, and TypeScript, focused on a clear board, fast input, and a comfortable solving experience.

## Features

- Six difficulty levels: Easy, Medium, Hard, Expert, Master, and Extreme
- Unique-solution validation during puzzle generation
- Standard input and a quick mode for selecting a number before tapping cells
- Pencil notes and an automatic candidate toggle
- Highlights for related cells, matching numbers, and matching candidates
- Five highlight palettes: Ocean Blue, Forest Green, Sunset Orange, Lavender, and Sakura Pink
- Undo, erase, pause, new game, replay, and timer controls
- Automatic game progress saving
- A per-game manual checkpoint for testing possible solutions
- Persistent difficulty, color palette, and quick-mode preferences

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Zustand
- AsyncStorage
- pnpm

## Getting Started

Install [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) first. To test on a physical device, install the latest Expo Go version that supports Expo SDK 54.

```bash
pnpm install
pnpm start
```

Scan the QR code shown in the terminal with Expo Go. You can also run:

```bash
pnpm android
pnpm ios
pnpm web
```

> The iOS simulator requires macOS. An Android emulator requires Android Studio setup.

## How to Play

- Tap the difficulty badge in the top-left corner to choose a level. Selecting one starts a new game immediately.
- In quick mode, select a number from the bottom row, then tap cells to enter it repeatedly.
- In pencil mode, entered numbers are stored as candidates.
- The candidate toggle automatically generates or clears candidates for the current board.
- **Save** stores a temporary checkpoint and **Load** restores it. The checkpoint is cleared when you start or complete a game.
- Tap **Palette** in the top-right corner to switch the complete highlight color scheme.

## Project Structure

```text
src/
├── components/   # Board, cells, controls, and number pad
├── logic/        # Sudoku generation, solving, and validation
├── screens/      # Game screens
├── store/        # Zustand game state
├── theme/        # Highlight palettes
├── types/        # TypeScript types
└── utils/        # Local persistence
```

## Validation and Build

```bash
# TypeScript validation
pnpm exec tsc --noEmit

# Validate the Android JavaScript bundle
pnpm exec expo export --platform android
```

## License

This project is released under the [MIT License](LICENSE). You may copy, modify, and distribute it as long as the original copyright and license notice are retained.
