# 2026-11-27 Mobile joystick release

- Report: a portrait screenshot on stage 3-7 showed the knob stuck at its northwest deflection. A screenshot alone cannot identify which Safari event was missed.
- Native touch owns the joystick by touch identifier, independent of any second finger on a skill. Follow it outside the hit area; clear on release, cancellation, page hide, blur, hidden document and pause/stage transitions. Pointer-capable desktops keep capture with a window fallback. No changes to the base placement, skill layout, pinch zoom or movement speed.
- Node cases cover touch identity, out-of-controls movement and release, reacquire, cancellation, lifecycle, mouse capture failure and keyboard. Isolated desktop Chromium (390 × 820 touchscreen emulation, native CDP touch) verified drag outside, concurrent skill press, skill release before thumb release, neutral reset, fresh touch and cancellation. No physical iPhone used.
- Live cache key: 20261127joystick. Previous crowd performance module and keys unchanged.
