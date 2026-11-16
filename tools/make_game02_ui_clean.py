#!/usr/bin/env python3
"""Render original noise-free UI cues, mono PCM16 44.1 kHz; no samples required."""
import math
import wave
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '02_brave_guy/assets/source/sfx'
SR = 44100
CUES = {
    'result_clean': [(0, 523.251, .22, .17), (.10, 659.255, .22, .15), (.20, 783.991, .24, .14), (.32, 1046.502, .32, .12)],
    'stage_select_clean': [(0, 659.255, .15, .19), (.075, 987.767, .20, .16)],
    'dialog_next_clean': [(0, 587.330, .105, .12)],
}
for name, notes in CUES.items():
    samples = [0.] * round(max(at + duration for at, _, duration, _ in notes) * SR)
    for at, freq, duration, gain in notes:
        for i in range(round(duration * SR)):
            t = i / SR
            envelope = min(1., t / .008) * math.exp(-4 * t / duration) * min(1., (duration - t) / .025)
            samples[round(at * SR) + i] += gain * envelope * math.sin(2 * math.pi * freq * t)
    with wave.open(str(OUT / f'sfx_{name}.wav'), 'wb') as output:
        output.setparams((1, 2, SR, 0, 'NONE', 'not compressed'))
        output.writeframes(b''.join(struct.pack('<h', round(x * 32767)) for x in samples))
    print(name, f'{len(samples)/SR:.3f}s', f'peak={20*math.log10(max(map(abs,samples))):.1f}dBFS')
