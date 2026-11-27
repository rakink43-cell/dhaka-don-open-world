# Project Status

Updated: 2026-11-28

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
- CI typecheck/build status must be checked against the latest commit before marking this item complete
- Responsive HUD and project documentation

## Not yet implemented
- Rapier vehicle physics
- Browser playtest and handling tuning on target devices
- Robust road-boundary collision system
- Proper CNG/rickshaw model
- Real Dhaka neighborhood layout and landmarks
- Bengali signboard asset pipeline
- NPC traffic / pedestrians
- Save, mission, minimap systems
- Cloudflare Pages production release / final deployment

## Validation
- Commit `0228e90` failed GitHub Actions run #29 at TypeScript typecheck because a disjoint road interval referenced an undefined variable (`intervalStart`).
- Fixed the interval reset in commit `c5be84c` on branch `phase0-playable-blockout`; latest CI and Cloudflare Pages deployment for this fix are pending verification.
- Browser/mobile playtesting has not been performed.
