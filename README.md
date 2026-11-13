# Pac-Man Arcade

A Pac-Man recreation built with HTML5 Canvas and vanilla JavaScript, featuring five levels, side and corner tunnels, and keyboard controls.

A study project on game loops, grid-based collision, and simple ghost AI. It has no dependencies and no build step.

**[Play online](https://nicolas-user15.github.io/pacman-game/)**

## Getting started

To run it locally you don't need to install anything. Clone the repository and open `index.html` in your browser:

```bash
git clone https://github.com/nICOLAS-user15/pacman-game.git
cd pacman-game
```

If you prefer a local server (requires Node.js 18+), run:

```bash
npm start
```

This starts a small dependency-free static server and opens the game in your default browser. Set the `PORT` environment variable to change the port (default: 8080).

## Controls

| Action | Keys |
|---|---|
| Move | Arrow keys or W A S D |
| Pause / resume | Space |
| Fullscreen | F |
| Exit fullscreen | Esc |

## Levels

The game has five mazes. Each one changes the color theme, ghost speed, frightened-mode duration, and how long ghosts wait before leaving their house. Level five has the fastest ghosts.

## Project structure

```
├── index.html   # Page layout, HUD, and modals
├── style.css    # Styles and fullscreen layout
├── game.js      # Game logic: mazes, player, ghosts, scoring, and audio
├── server.js    # Dependency-free local static server
├── package.json # npm start script
└── LICENSE
```

## How it works

- **Rendering:** everything is drawn to a single `<canvas>` every frame using `requestAnimationFrame`.
- **Mazes:** each level is a 19 × 21 matrix where every number represents a cell type: wall, pellet, power pellet, ghost-house door, tunnel, or empty space.
- **Movement:** the player is locked to the center of corridors, which prevents clipping through walls at corners.
- **Ghosts:** each ghost picks its next direction by looking toward a target tile on the board. They never reverse, except when eaten or frightened.
- **Audio:** sound effects are synthesized with the Web Audio API, so there are no audio files.
- **Persistence:** the high score is stored in `localStorage`.

## License

Distributed under the MIT License. See [LICENSE](LICENSE).

This is a study project. The Pac-Man name and character are trademarks and intellectual property of their respective owners, and are not covered by this repository's license.
