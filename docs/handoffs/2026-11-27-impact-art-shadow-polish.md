# 2026-11-27 | Impact animation and shadow polish

Release key: `20261127impact3d`.

- The creator's eight-frame normal-hit art is untouched. The heavy impact builds on those exact pixels with new expanding pressure arcs and ember breakup. Counter and guard are directional eight-phase effects: a mint cut-through and a blue deflection ripple, not emblem stickers. The effects stay depth-tested, with the flash moved toward the visible model surface along the camera ray. No changes to health, hitboxes, timing, or the 18-sprite/80 ms throttles.
- Character contact shadows still use one batched mesh. At high/medium visuals a shallow contact anchor supplements the softer projected shadow, including on painted floors. At low quality the contact footprint remains stronger; airborne support casts a softer footprint rather than a small dark spot.
- Companion art is documented in [the Little Angel handoff](2026-11-27-little-angel-companion.md). Keep the original art, playable model and support behavior unchanged.
- Verified actual game renders on desktop Q0 day and Q1 night, 390 × 844 portrait Q0, impact peak and breakup, and the skinned idle companion plus two contact shadows at Q1. The bundled QA images are timed stills through the live damage route, not illustrative mockups. Not benchmarked on physical phones.
