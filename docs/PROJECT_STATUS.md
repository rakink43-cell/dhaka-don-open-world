# Project Status

Updated: 2026-11-27

## Current phase
Phase 0 — foundation / visual blockout

## Repository
GitHub: https://github.com/rakink43-cell/dhaka-don-open-world

## Current baseline
- Vite + TypeScript starter
- Three.js scene with a compact city-block placeholder
- Third-person follow camera
- Basic sedan placeholder and keyboard/touch input
- Dhanmondi-inspired lake loop with road markings and low-poly lamps
- Green CNG auto-rickshaw placeholder; switch with V / mobile vehicle button
- Vehicle-specific speed cap and mode HUD
- Basic building, lake, and Dhanmondi-loop curb collision checks using a shared vehicle footprint
- Improved acceleration, rolling friction, braking, reverse steering response, and vehicle-specific footprint
- Follow camera raycast that moves the camera forward when buildings obstruct it
- CI build and TypeScript typecheck passing
- Responsive HUD and project documentation

## Not yet implemented
- Rapier vehicle physics
- Browser playtest and handling tuning on target devices
- Robust road-boundary collision system
- Accurate collision and road-boundary system
- Proper CNG/rickshaw model
- Real Dhaka neighborhood layout and landmarks
- Bengali signboard asset pipeline
- NPC traffic / pedestrians
- Save, mission, minimap systems
- Cloudflare Pages production release / final deployment

## Validation
GitHub Actions runs #13 and #14 passed typecheck and build for the curb-collision and footprint-refactor commits. Cloudflare Pages reported a successful preview deployment for commit df134e9 at https://8621c077.dhaka-don-open-world.pages.dev; branch preview URL: https://phase0-playable-blockout.dhaka-don-open-world.pages.dev. The newest curb/footprint commits passed CI, but their preview deployment has not yet been confirmed. Browser playtesting has not been performed.
