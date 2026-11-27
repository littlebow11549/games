# Brave Guy 3-7 scene polish

Status: local H5 build only, unshipped. Subjective quality is not accepted yet. Target: visual depth and material richness of owner's three reference frames, while preserving the existing original office characters and maze.

- `02_brave_guy/js/stage-art/story-quality-finale.js`: dedicated recessed briefing hall, lit thresholds, asymmetric dispatch shelf and arch, near-edge 3D furnishings and an island planter built below the hero silhouette. Still batched via the existing kit.
- `02_brave_guy/js/stage-art/story-quality-paint.js`: stage-only layered slate and beveled seams, warm local spill from visible fixtures and door, cast/contact darkening, quieter runner. Keeps the same single ground texture and no dynamic lights.
- `02_brave_guy/js/stage-art/story-quality-world.js`: stage-only matching fog/edge palette and duplicate props suppressed. Other levels retain their prior code path.
- A/B against published `c4c844d`, Windows Chromium with mobile emulation 390×820. 3-7 retained 32 cells, 44 walls, 36 live mobs; touch movement moved character along the expected diagonal, attack showed hit/damage feedback; no reported JS errors or missing assets in that run. New outer furnishing anchors are blocked. Opened 3-3 separately and tested movement/attack with no reported assets/errors. This is not an iPhone performance measurement.
- Final mobile screenshot check at world (-9.2, 9.2) and (9.2, 13.8) shows both corridors and the hero unobstructed. The low island and its endpoints are blocked cells, as expected. Asset-loading and maze-pursuit tests: 5 passed. The references are for quality and composition, not direct assets. Visual acceptance, real-phone crowd performance and the cache-version update along the loader path remain before release. No deploy or change to combat/maze data in this pass.

## Second pass: architectural enclosure

- Added low foreground sill and columns, paired side colonnades with deep framed bays, wall footings and centered sconces. Replaced loose repeated assets with the contiguous stage treatment; no gameplay objects or course layout were changed.
- Rebuilt the walnut floor outside the walkable slate as staggered, individually shaded planks. Wall shadows and light pools use the existing floor canvas; object tints in the same pools are precomputed at build time in `story-quality-kit.js`.
- 3-7 uses four bevel subdivisions per face rather than five to balance extra sets. Other levels keep the original five and no per-instance light tints. No new external assets or dynamic scene lights.
