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
- Basic building and lake collision checks with vehicle-rotation-aware footprint
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
- Cloudflare Pages deployment

## Validation
GitHub Actions run #9 passed typecheck and build for the previous documentation-only commit. Vehicle handling and camera collision improvements are now committed to the PR branch and require a fresh CI run. Cloudflare Pages reported a successful preview deployment for commit 3c7ad98 at https://phase0-playable-blockout.dhaka-don-open-world.pages.dev; latest code commit is not yet confirmed deployed. Browser playtesting has not been performed.
