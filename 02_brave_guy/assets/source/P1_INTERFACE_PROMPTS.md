# P1 介面擴充實際提示詞

2026-11-14；內建image_gen，透明PNG，原生bytes保留。

## bubble_sheet

Create transparent PNG comic game dialogue bubble atlas native1536x1024, exactly2columns x2rows four assets, no text. Thick black outlined funny Japanese cartoon, flat simple colors. Each bubble is horizontal rounded rectangle about620x300 centered within768x512cell, corners rounded with slight handmade comic asymmetry, center large flat blank fill. All bubbles have short broad downward-pointing tail centered bottom. Each outline continuous and middle edges straight suitable nine-slice, corner/tail fixed regions, no textures or gradients in blank text center.
Top-left ANGEL dialogue: WHITE fill BLACK outline with strong flat PINK offset shadow below/right.
Top-right ENEMY TAUNT: WHITE fill BLACK outline with strong flat RED offset shadow below/right.
Bottom-left SCARED ENEMY: pale icy BLUE fill BLACK slightly trembling wavy OUTER edge, mild blue shadow, plain inside; tail quivers but recognizable.
Bottom-right HERO RETORT: pale warm YELLOW fill BLACK outline, modest deeper-yellow shadow.
Exactly4 empty bubbles, no letters icons characters or punctuation. True transparent background outside bubbles and shadows; no glow or haze, no checkerboard. Leave60pxclear transparent gaps and margins, no overlap. Printable crisp flat bitmap UI, not3D, no metal.

## panel_sheet

Create BRAVE GUY game panel atlas transparent PNG1536x1024 landscape. Thick black cartoon outlines bright green border small yellow corner accents, warm cream blank interiors. Flat cel artwork no metal, no ornamental fantasy, no letters/numbers/icons/mockup. Exactly3panels isolated:
Top-left QUEST PANEL bounding area x40..680 y40..450: rounded rectangle, plain cream center, heavy black outline green narrow rim, two small yellow corner tabs, a small blank darkgreen header strip at top. For small quest list.
Top-right POPUP PANEL area x820..1490 y40..450: rounded rectangular general start/pause/result modal, same palette, broad blank cream interior, simple blank darkgreen top header band. No controls or close icon.
Bottom spanning x50..1486 y580..960: STORY DIALOG PANEL long horizontal rectangle, same black/green/yellow style cream fill, a blank circular portrait socket at LEFT and RIGHT each220diameter, both centers transparent; broad blank middle text zone cream. No characters in sockets, no text.
All straight middle edge stretches uniform so nine-slice can work; small decorations only corners. No gradients/textures in central fills. True alpha0 background, no broad haze or shadows. At least50pxtransparent gutters, no panels touch or cross. These are reusable UI frames, not finished screens.

## minimap_sheet

Generate BRAVE GUY transparent PNG MINIMAP + MARKERS asset atlas1536x1024, thickblack cartoon clean flat palette green yellow red purple. No text letters numbers grid or screen mockup. Layout separated assets:
Upper-left withinx70..670 y50..650: circular minimap FRAME diameter520, thick black outer contour green ring thinyellow inner rim and4tiny compass notches, center completely TRANSPARENT (no fill).
Upper-right withinx860..1400 y50..650: independent circular minimap BACKGROUND diameter520, dark green-black disk at45%alpha, three very subtle graygreen concentric circles and central cross faint at15%alpha, no frame or markers.
Bottom row five distinct symbols at x160,460,768,1070,1380 centered y840 each no more160diameter, fully separated: 1 small ENEMY marker red circular dot black outline; 2 STRONG ENEMY orange circular dot black outline slightly larger; 3 BOSS purple horned circular emblem black outline; 4 HERO brightyellow upward arrow black outline; 5 optional BEAR marker simple brown bear-hood face badge, friendly tiny face with two rounded ears, white muzzle, not scary mask. Readable at16px, simple bold shapes.
True alpha outside items, transparent holes, no broad glow/haze or external shadows. All7assets separate, no touching margins.

## function_icons_sheet

Transparent PNG game FUNCTION ICON atlas1536x1024,4columns x2rows equal384x512 cells.8icons diameter250px centered. BRAVE GUY cartoon thickblack outline green circular rim yellow thin inner trim darkgreen face, cream/yellow simple symbol. Consistent frames all8. Each isolated with60pxtransparent gutters. No text letters words or numbers. No scene no labels no backdrop. Symbols in reading order:
row1: PAUSE two solid vertical cream bars; SOUND ON cream speaker plus2sound waves; SOUND OFF same speaker with red diagonal slash; SETTINGS cream cog6teeth dark center.
row2: LANGUAGE cream globe with2latitude lines and2longitude arcs; RESUME cream triangle pointing right; RESTART cream circular counterclockwise arrow; HOME cream house silhouette roof/door.
Clear at24px, simple uncluttered monochrome glyph except redmute slash. No gradients on glyph, no metal. True alpha0 outside each circle, no outer glow/haze. Exactly8.

## lock_heal_sheet

BRAVE GUY transparent PNG lock-on + heal atlas1536x1024.5separate assets, thickblack cartoon outlines, saturated flatcolor, no text labels/no background.
Top row3equal512x512cells: same circular LOCK-ON button diameter330, blackoutline greenrim yellow trim darkface, centered cream4bracket crosshair with central small dot. Left OFF normal cream reticle, middle ON red reticle red rim bright narrow RED glow, right PRESSED ON same redreticle geometry darker inset face no change silhouette. Do not use lock padlock symbol; use aiming crosshair.
Bottom-left centered(450,780) isolated red GROUND TARGET circle: ellipse600x240 perspective resting flat on ground, four small triangular inward arrows and thin crosshair ticks, empty transparent center. Black outline helps on bright ground, NO ground/shadow, only red ring. Designed to rotate in game. Bottom-right centered(1180,780) HEAL red heart icon with small white plus on it blackoutline, diameter200, no surrounding button or glow.
All assets inside canvas with50pxclear gutters and separated. Native1536x1024. Transparent empty pixels, no haze across sheet.

## difficulty_sheet

Transparent PNG DIFFICULTY badges atlas1536x1024,3columns x2rows cells512x512,6isolated circular badges diameter340 with40pxgutter. No text or letters. Thickblack Japanese cartoon outlines vivid simple celcolor.
Columns: LEFT EASY green badge featuring head of LITTLE ANGEL from reference, pink hair red two-tipped yellowbell hat leftcheek redstar, sleepy halfclosed eyes yawning with one hand near mouth; same identity not generic angel. CENTER NORMAL yellow badge simple bold confident clenched fist cream and orange on yellow face. RIGHT HELL redbadge stylized orange-red rising flames around dark red innerface with red heroic angular eyes, no skull gore or demon character.
TOP ROW UNSELECTED muted palette, thin neutral black outer edge, no glow. BOTTOM ROW SELECTED exact same motif geometry and size, brighter palette plus thick gold selection ring and two tiny gold sparkles outside; no checkmark needed. Designs align each column. Match original game comic style, not realistic/metal. True transparent outside silhouettes, no broad background haze. Original reference only controls angel identity, not sheet layout/colors.6badges total.

## aux_hud_sheet

Create transparent PNG BRAVE GUY HUD auxiliary atlas1536x1024, thickblack cartoon outlines green/yellow trim and cream blank fill, no metal. Exactly8separate assets arranged3rows, no text numbers or glyph labels.
TOP ROW3cells512x340: left BOSS BAR FRAME horizontal440x100 darkpurple black frame with red corner tabs, EMPTY transparent center and plain straight middle for stretching; center BOSS HEALTH FILL red horizontal420x60 plain unbroken middle; right BOSS NAMEPLATE blank darkpurple horizontal400x110 blackoutline redcorner accents.
MIDDLE ROW2cells768x340: left ENEMY BAR small simple black outlined horizontal500x60 redfill; right COMBO PLATE blank slanted comic lozenge yellowfill blackoutline offset redshadow about440x160, leave broad empty central space for program-rendered numbers.
BOTTOM ROW3cells512x344: same generic TEXT BUTTON rounded rectangle430x160, left NORMAL green face yellow rim blackoutline, middle PRESSED darker green face inset rim, right DISABLED gray face grayrim blackoutline. All centers blank for overlaid text, exactsame size and shape across3states.
Transparent background and frame holes, no sheet-wide glow/haze, at least40pxgutters each cell, no overlap. No words or characters anywhere.

## bingo_card

Create transparent PNG LITTLE ANGEL guilt bingo card UI, square native1254x1254 or higher. Single front-facing flat cream card with thick black outline, rounded corners, pink offset flat shadow, tiny two yellow bells on top corners echo angel jester hat. Main content EXACT5columns x5rows=25 equal EMPTY squares, thin black straight gridlines, perfectly regular square grid. Count exactly4internal vertical and4internal horizontal lines plus outer grid border. NO letters, numbers, checkmarks, symbols or icons in any cell. No title or text anywhere. Grid takes central80%card, generous margins. Cartoon bold clean flat colors, no3D no perspective no folds, no decorative lines inside grid. Transparent outside card and shadow, no haze or painted backdrop. Card centered with8%transparent canvas margins. Intended for program to overlay localized bingo words.
