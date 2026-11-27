# Brave Guy all-stage scene refresh

This extends the 3-7 visual pass to all 16 playable levels. Owner requested public H5 playtesting on 2026-11-27. Visual review remains pending. No collision, map navigation, character, combat, balance, or progression files were changed; main.js is changed only to fetch the new cache-keyed scene loader.

| Stage | Environment work |
| --- | --- |
| 1-0 | Dorm cabinetry, quilt and shoe nook, warm timber and daylight |
| 1-1 | Campus court material transitions, pond banks, school frontage, water ripples and courtyard props |
| 1-2 | Basketball hoops, perimeter bleachers and ground paint |
| 1-3 | Discipline hall porch, blue-stone steps and flagstone |
| 1-4 | Lavender school wing and gate, dusk stone and amber threshold |
| 2-1 | Forest canopy depth, rocks, mushrooms and moss with filtered light |
| 2-2 | Lantern pools, village back row and low stone perimeter |
| 3-0 | Overtime clock, dark desk alcoves, warm interior threshold |
| 3-1 | Lobby canopy, elevator recess, pale marble and cool daylight |
| 3-2 | Framed coffee counter, pantry joinery and satin tile |
| 3-3 | Meeting stage, graphic boards, directional carpet and cool light |
| 3-4 | Service screens, message walls, mint-pink light and tiled suites |
| 3-5 | Rooftop silhouette, low terrace railing and seating |
| 3-6 | Recessed finance vault, warm brass, filing cabinets and marble |
| 3-7 | Layered briefing entrance, reading island, sconces, side colonnades and slate/timber |
| 4-1 | Rift threshold, layered crystalline ravine and muted fractured stone |

Story floor surfaces, contact shadows and pools are composed in the existing one ground texture; visible object colors receive a matching stage-only loaded tint, with no real-time lighting passes. Rear silhouettes and doorways stay on the decor layer; existing instancing remains. Campus uses its independent stage pipeline and is covered separately. All changed loading entrypoints use release key `20261127scenes`. The unrelated `angel-motion-local.json` is not part of this work.

## Validation
- In the repository: `node --test 02_brave_guy/tools/scene-upgrade.test.mjs 02_brave_guy/tools/loading-assets.test.mjs 02_brave_guy/tools/maze-pursuit.test.mjs`; 9 tests pass, including the complete stage list and exact pre-upgrade story grid fingerprint. The existing campus maze module was not changed; direct runtime check retained 37 walk cells.
- 390×820 browser H5 covers every named stage after its original intro can be dismissed. Boot, entry, movement and attack input verified without reported script faults or missing assets; not a full playthrough or physical phone performance test. Screenshot comparisons stay out of the repository.
- Visual owner approval remains open. Real-phone performance under high numbers of enemies must not be inferred from the local browser pass.
