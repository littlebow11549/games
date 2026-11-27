# 2026-11-27 | Story foreground landmark rollout complete

Release key: `20261127landmarks2`. This batch replaces the two large camera-facing foreground pictures in all 13 remaining stages with 26 individually authored toon-mesh landmarks. The existing 1-1 campus, 2-1 forest, and 2-2 village remained in place. The chapter-specific environment paintings (floor, distant props and small ambient art) are deliberately retained.

| Stage | Left | Right |
| --- | --- | --- |
| 1-0 | Dorm noticeboard | Parcel cubbies |
| 1-2 | Scoreboard | Equipment station |
| 1-3 | Announcement podium | Trophy shelf |
| 1-4 | Guard booth | Bicycle shelter |
| 3-0 | Night desk | Punch card station |
| 3-1 | Floor directory | Reception counter |
| 3-2 | Coffee counter | Water station |
| 3-3 | Projector screen | Stackable chairs |
| 3-4 | Headset desk | Ticket queue |
| 3-6 | Ledger counter | Coin vault |
| 3-7 | Dispatch board | Warning checkpoint |
| 3-5 | Sunset lounge | Heirloom clock |
| 4-1 | Fractured prism | Crescent arch |

Each solid is instanced by geometry and placed against the original padded maze footprint guard. School and office placement candidates also stay near walkable cells. Shared sightline protection keeps props from blocking the hero. Foreground illustration atlases are no longer requested by the stage catalog; leave the old original files in the repository for reference/rollback. Background art, path data, radar, ambient weather/lighting, combat and unlock logic remain unchanged.

QA: Chrome H5 in desktop and 390 × 844 portrait, quality 0, 16/16 runs each. The three previously completed scenes remain present. On each non-campus-special route two solid groups loaded, no painted foreground sprite remained, and both landmark centers were in or near the camera frame from a nearby walkable sample after using the game's stage-camera snap to settle the preview. Tests separately check world-space footprint/occlusion, instancing budget, exact retained maze data and disposal. Fifteen targeted JavaScript suites passed. This does not benchmark FPS on physical phones.

Rollback: revert the one release commit. These scene changes do not modify save data.
