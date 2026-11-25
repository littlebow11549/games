# Brave Guy H5: performance pass (2026-11-25)

- Production entry: `02_brave_guy/index.html` (portrait wrapper) or `play.html`. Release cache key `20261125perf1`.
- Story/campus art is requested on stage entry, with per-atlas promise sharing and PNG fallback. A failed request does not mark a stage ready; the existing retry flow remains usable.
- All 11 WebP files were verified RGBA-equivalent to their PNG sources, with original dimensions, crop coords, and alpha. Total scene images went from 11,850,676 B to 8,837,164 B. Source PNGs are intentionally retained for fallback.
- Runtime GLB: 11,509,552 B → 5,747,948 B. Removes only the normal and metallic/roughness maps not used by Brave's toon shader. Geometry, skin, 14 clips, and byte-identical base color remain intact. The source GLB is retained; if a shader starts using the removed maps again, create a matching runtime export or restore the original manifest entry.
- Automated game check: all 16 production H5 stages loaded, authored routes reachable and grades present, 14 Brave clips and toon outline initialized, no page or asset errors, save progress unchanged. No scene atlas downloaded before the menu.
