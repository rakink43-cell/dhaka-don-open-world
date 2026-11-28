# Project Status

Updated: 2026-11-28

## Current phase
Phase 1 — playable traffic prototype

## Repository
GitHub: https://github.com/rakink43-cell/dhaka-don-open-world

## Implemented
- Vite + TypeScript + Three.js city blockout and third-person camera
- Keyboard and mobile touch driving controls
- Player sedan prototype
- Procedural local traffic: CNG, cycle-rickshaw, local bus and microbus
- Local bus destination board: “DHAKA • LOCAL”
- CNG canopy/mirror, rickshaw canopy and microbus window/door details
- Ambient traffic movement and basic player-to-traffic/map-boundary blocking

## Validation issue found and addressed
The last GitHub Actions runs failed at the Node setup step because the workflow requested npm caching while the repository has no package-lock.json. Removed the setup-node npm cache option so CI can proceed with npm install without requiring a committed lockfile.

The updated workflow commit is on main. A new successful CI run has not yet been confirmed.

## Not yet implemented
- Production vehicle physics, suspension and tire handling
- Full building/traffic collision and traffic-to-traffic avoidance
- Pedestrian and player character models/animation
- Accurate Dhaka street layout, landmarks and Bengali signboards
- Missions, save system and minimap
- Verified Cloudflare Pages deployment for the current code
