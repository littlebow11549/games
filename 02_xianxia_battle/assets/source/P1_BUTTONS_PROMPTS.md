# P1 戰鬥按鍵實際提示詞

內建image_gen。2026-11-14，透明背景；保留原生bytes。

## btn_attack_sheet

Create transparent PNG game button sprite strip, exact3:1 landscape native2172x724. Three equal724x724 invisible cells left to right NORMAL, PRESSED, DISABLED. No words, labels, numbers, grid, background or checkerboard. One identical circular ATTACK button in each cell,560pxdiameter, same center/size/motif/pivot, isolated with80pxtransparent margins. Match reference HUD comic style: thick clean black outline, green outer rim with small yellow accent, deep green face. Center emblem a large RED GLOVED CLENCHED FIST, four curled knuckles with one thumb, simple bold cream highlights, silhouette readable at48px. Not realistic hand, not metal, no fantasy filigree. Left normal bright red fist on deep green with yellow accent. Middle pressed same outline dimensions and same fist geometry, darker face and inset rim highlight, emblem shifted downward8px only (not different pose), no external glow. Right disabled same art entirely grayscale, dim lower contrast, no color anywhere. Empty outside circles truly alpha0, no broad haze or external drop shadows. Buttons fully fit cells and same scale. Separate reusable sprite artwork, NOT a UI screen or mockup.

## btn_dodge_transform_sheet

Create game button sprite atlas native1536x1024, transparent PNG. EXACT3columns x2rows invisible512x512 cells. Use last attack button strip for visual style only: bold black ink, green outer rim yellow accent, deep green face, flat bright cartoon no metal. No text, letters, grid or background.
Top row all same DODGE button circle390px diameter centered within cell: emblem a simple cream-white human silhouette tucked into forward somersault, bent knees, curved lime motion arc and two fading afterimages to left. Readable dodge/roll, NOT running figure. Three states left NORMAL full colors, middle PRESSED darker face inset rim same motif shifted down6px, right DISABLED entirely grayscale. Maintain identical frame diameter and silhouette.
Bottom row all same TRANSFORM button horizontal capsule430x220 centered in cell: thick black outline green border yellow tiny end tabs, deep green face. Center large RED SCARF tied in single knot with two flowing tails (NOT a bowtie, not a fist or sword). Left NORMAL full colors, middle PRESSED inset and slightly darker red same scarf geometry, right DISABLED all grayscale. No glow on normal states.
All6assets separate with at least35pxtransparent margin, completely inside cells. No external drop shadow. True alpha0 outside buttons. Shape positions must align across three states. Do not include attack buttons from reference.

## skill_buttons_sheet

Create transparent PNG game SKILL button atlas native1536x1024 landscape. EXACT4columns x3rows invisible cells each384x341.33, all12buttons circular diameter280px with identical frame geometry centered in cells, generous transparent gutters. Reference last sprite sheet sets style: thick black outlines, green rim thin yellow accent, dark green face, flat saturated cartoon, NOT metal no fantasy filigree. Four COLUMNS fixed motifs:
Column1 DASH PUNCH: red glove fist moving right with3white speed streaks, clearly lateral punch.
Column2 KI BALL: bright GREEN energy orb with white specular crescent and orbit swoosh, no fist.
Column3 QUAKE: red gloved fist pointing DOWN striking ground, cream burst and green elliptical expanding shock ring, unmistakable vertical slam.
Column4 ULTIMATE: very THICK green-white energy BEAM diagonally up-right with bright white center and green cone edge, unmistakable beam not orb, yellow accent.
ROW1 NORMAL vivid colors and yellow rim.
ROW2 PRESSED same motifs and geometry and size, darker inset button face, motif shifted down5px; not different pose.
ROW3 DISABLED all artwork grayscale, no colored pixels except transparent, lower contrast.
No text, names, numbers, letters, grid, scenery, or extra objects. Each icon appears exactly3times in column, same geometry. True transparent alpha outside circles, NO BROAD GLOW or shadows outside borders, avoid bleeding across cells.12total. Do not include scarf or dodge from reference.

## control_extras_sheet

Create transparent PNG game control extras atlas, native1536x1024 landscape. Same comic art as references: bold black outline green-yellow rim deepgreen face, saturated flat cel colors, NOT metal. Reference1 dodge/transform sheet controls exact red scarf capsule design. Reference2 skill atlas controls frame language. Exactly3separate assets, no text labels or grid.
TOP LEFT centered(384,256): JOYSTICK BASE circular diameter420, thick black outline green rim thin yellow ring, dark green SEMITRANSPARENT interior allowing game behind, subtle4direction arrow notches at compass points. NO knob in center; empty flat interior with subtle concentric ring.
TOP RIGHT centered(1152,256): JOYSTICK KNOB separate circular diameter240, solid brightgreen face yellow inner crescent highlight thickblack border, simple clean domed cartoon disk, no letters no symbol, no base behind it.
BOTTOM CENTER centered(768,768): TRANSFORM READY GLOW capsule, width800height300, exact red scarf tied knot2tails from reference1, thick black outer line green rim yellow accents deepgreen face. Bright narrow green-gold ready glow and4small gold sparks within40pxof capsule; DO NOT change scarf shape or turn it into bow. Same proportions as normal transform capsule2:1 approx.
All3items nonoverlapping, at least70pxtransparent gutters. True alpha background and generous margins, no painted backdrop or checkerboard, no sheet-wide colored haze. Preserve transparency between objects. No other assets.
