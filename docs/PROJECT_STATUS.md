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
- Basic building, lake, and Dhanmondi-loop curb collision checks using a rotated vehicle footprint
- Axis-separated collision resolution and expanded driving bounds
- Connected roads from the central cross-road to the lake-loop district
- Cleared placeholder buildings overlapping the lake-loop road/water area
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
GitHub Actions run #18 passed typecheck and build for commit 4c5c4ad, including axis-separated collision, expanded bounds, connecting roads, and lake-district layout cleanup. Cloudflare Pages preview for commit 07f8931 was confirmed at https://28b924e7.dhaka-don-open-world.pages.dev; the newest 4c5c4ad commit's preview deployment has not yet been confirmed. Browser playtesting has not been performed.
