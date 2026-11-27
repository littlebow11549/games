# 2026-11-27 Crowd performance

- 3-2 A/B benchmark: Chromium software WebGL, portrait viewport 390×820, same low tier/seed/scene and 180 fixed-position enemies (135 kaban, 45 jiamang), 12 warmup frames then 50 samples per build. Crowds were injected for reproducibility, not a normal wave clear.
- Main frame work median 15.5 to 13.0 ms, p90 22.2 to 17.8 ms. Browser frame interval median 200.0 to 183.3 ms. WebGL buffer 319,800 to 165,200 pixels (−48.3%); draw calls 121 to 119 median. These are stress-fixture results, not physical-device FPS.
- At 36+ enemies, skip well outside-camera enemy rendering and associated health/control badges; relax sampling only for distant ambient chase animation. Bosses, lock target, close actors and action poses retain priority. Render-root visibility is restored after each render for unchanged simulation and radar.
- On sustained crowd slowdown, temporarily render the WebGL buffer at 85% then 72%, restoring after sustained recovery. HUD and radar are not scaled; the crowd governor does not change the stage wave count or damage.
- Test: `node --test tools/tests/game02-crowd-visual-budget.cjs tools/tests/game02-actor-shadows.cjs tools/tests/game02-burst-aura.cjs`. Next check: long Safari playthrough with actual waves and camera movement.
- Live key: `20261127crowdbudget`. If rollback is required, revert this commit on the deployment branch.
