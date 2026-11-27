# 2026-11-27 Brave Guy quality audit and first optimization pass

## Scope and rubric
Equal weight, ten categories out of 10. A 6 is playable with obvious friction, 8 is mature in most situations, and 10 is polished and stress-tested. These are reviewer judgments based on sampled evidence, not measured user satisfaction. 85 is a target, not a passing score that can be assigned without evidence.

| Category | Published baseline | Candidate |
|---|---:|---:|
| Controls | 8 | 8 |
| Combat depth and feedback | 8 | 8 |
| Enemy and boss design | 8 | 8 |
| Levels and exploration | 8 | 8 |
| Playable roster and progression | 8 | 8 |
| Art and presentation | 8 | 8 |
| Music and sound clarity | 7 | 7 |
| UI and usability | 7 | 8.5 |
| Story and pacing | 8 | 8 |
| Performance and stability | 7 | 8 |
| Total | 77 | 79.5 |

## Changes and verified evidence
- Reviewed public `eef74e0` in 390 × 820 touch Chromium: stages 1-1, 3-2, 3-7, player movement and input release, asset and runtime errors. Art differs by stage and the radar retains enemies. These were sampled stages entered using game test hooks, not natural sequential clears.
- Move the transformation-lock note to existing quest HUD. It no longer covers the middle-right playfield. Add an optional collapsed pause guide with touch, mouse/keyboard and perfect-dodge tips in Traditional Chinese, English and Japanese. Verified in gameplay at 390 × 820, including open and English locale; primary actions stayed visible.
- Bootstrap preloads actual module graph, instead of wrapping main in a separate streamed engine request. Three cold localhost pairs with identical injected 550 ms engine delay: main requested at 629/639/641 ms before, 61/54/45 ms after; JS discovery about 585 ms earlier. Full boot median was 1518 ms in both. No claim of absolute improvement in total load time.
- Crowd governor now evaluates a time window instead of a consecutive streak. Repeating nine 33.3 ms frames plus one 20 ms frame (~31 FPS) drops to 72%, versus remaining full resolution. Healthy 60 FPS, isolated spikes and small crowds retain full quality; recovery hysteresis unchanged. This is synthetic timing input, not achieved FPS on a physical phone. No changes to damage, difficulty or wave size.

## Remaining gates for 85
1. Profile sustained normal 3-2 / 3-7 waves on real iPhone Safari (with burst and camera pans). Fix high-percentile stalls, not only average FPS.
2. Test major bosses on normal player routes, record warning-to-hit intervals and distinguish overlapping hazards by shape as well as color.
3. Run an audio balance pass by listening on phone speakers and headphones, especially during hit/alert overlap.
4. Time a fresh-save onboarding run and a return run; check the payoff and clarity of unlocks; test keyboard and iPhone resume.
5. Validate a natural run for each of the three controllable characters before revising the score. A full playthrough, audio listening comparison and physical iPhone stress are still unverified.

Cache key: `20261127quality`. Revert the release commit if a compatibility problem appears.
