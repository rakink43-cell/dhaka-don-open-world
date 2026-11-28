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
**Playable prototype — city blockout and first-person-on-foot exploration**

Implemented so far:
- Third-person vehicle driving and camera follow
- Bangladeshi-inspired CNG, cycle-rickshaw, local bus, and microbus traffic
- Low-poly pedestrians with walking animation
- On-foot player avatar; press **E** or use the mobile action button to exit/enter the car
- Basic walking collision with buildings, pedestrians, and traffic
- Vehicle collision with traffic and building blocks
- Ambient traffic spacing and player yielding

Still in progress: richer Dhaka streets, detailed local buildings/shops, improved vehicle handling, sound, and device testing. The current map is a compact prototype, not a finished open-world city.

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
