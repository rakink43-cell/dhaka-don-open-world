# DHAKA-DON OPEN WORLD

A free-first, browser-based 3D open-world game inspired by Dhaka, Bangladesh.

## Current direction
- Web game for mobile and PC
- Third-person camera
- Offline single-player first
- Compact, expandable Dhaka-inspired map
- Visual style guided by the user's reference video
- Original assets and fictionalized/condensed city layout

## Development status
**Phase 0 — Foundation**. This repository is being initialized with a lightweight playable blockout before detailed city assets are added.

## Local development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Planned stack
- Three.js for WebGL rendering
- TypeScript + Vite
- Rapier for physics (introduced after the first visual blockout)
- Blender + glTF/GLB for original 3D assets
- Cloudflare Pages for static hosting when ready

## Performance principles
Use modular city chunks, instancing, low-poly assets, texture budgets, distance-based detail, and configurable quality settings. Performance will be tested on real target devices; it cannot be guaranteed identical across all hardware.

## Safety and originality
The game will use original Dhaka-inspired content. Character injury effects, if any, will remain non-graphic.
