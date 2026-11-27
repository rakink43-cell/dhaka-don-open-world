# Asset Guide

## Visual direction
Use the supplied Dhaka driving-game reference for broad visual guidance: stylized 3D city, readable roads, local vehicle silhouettes, and third-person driving view. Create original assets; do not extract or reuse copyrighted game assets.

## Dhaka building kit
Build modular, reusable GLB assets:
- 1–3 floor shopfronts
- 4–8 floor residential blocks
- Mid-rise office blocks
- Old Dhaka narrow-front buildings
- University / institutional facade
- Rooftop water tanks and parapets

## Bengali signage
Use a data-driven signboard system with editable text and textures. Verify Bengali spelling and avoid real business logos unless permission is available.

## Vehicles
Start with low-poly placeholder sedan and CNG. Keep separate meshes for body, cabin, wheels, lights, and damage parts so later upgrades are possible.

## Performance budgets (initial targets, to validate)
- Prefer shared materials and texture atlases
- Keep repeated props instanced
- Use LOD for buildings and vegetation
- Avoid excessive real-time shadow casters
- Use compressed GLB textures when the pipeline supports it
