# P1 HUD 核心素材提示詞

內建image_gen，2026-11-14。所有輸出要求透明背景，原生bytes保留。

## portrait_student

Create a transparent-background PNG HUD portrait of THE STUDENT from this exact character sheet. One head-and-shoulders portrait, square canvas native1024x1024 or larger, intended to display inside512x512 circle. Cartoon Japanese bold thick black ink, saturated flat colors simple cel shading, same young male face original4–5head human proportions NOT chibi. Brown short hair, warm brown eyes, backwards entirely yellow baseball cap (brim behind toward viewer-right), entirely YELLOW T-shirt including sleeves and cuffs. Expression slightly defensive crooked smile, looking toward camera. No hands, no backpack, no green sleeves. Head cap shoulders fit within centered circular safe area of80%canvas width with no part cut off; shoulder silhouette terminates in smooth curved arc at bottom. Transparent outside character, no circle fill, no frame, no scenery, no glow, no shadows, no text, no logo, no checkerboard painted. Only one character. Match sheet identity and palette precisely. Keep facial detail readable at64px.

## portrait_brave

Create ONE transparent PNG game HUD head-and-shoulder portrait of BRAVE GUY matching latest reference character sheet. Square native1024x1024 or larger. Same young male face, RED eyes, brown large spiky hair WHITE highlights, red neck scarf, yellow jacket red-orange shoulders. Confident slightly cocky closed grin. No hat. Match style and face scale of preceding student portrait (image1), but image2 sheet controls hero design. Thick black cartoon outlines vivid flat colors minimal cel shade, not chibi, not realistic. Centered circular composition: whole head/hair tips and bust inside circular safe area, 10%transparent margin all around. Bottom shoulders end in rounded arc. Only head shoulders, no hands/fists, no logo or lettering, no scenic background, no colored circle or frame, no glow. Keep ALL hair spikes within canvas. Clean transparent alpha outside silhouette without colored fringe.

## hud_core_sheet

Generate a production game HUD asset ATLAS on TRUE TRANSPARENT background, landscape1536x1024 native or larger3:2. Exactly8isolated assets in invisible2columns x4rows equally sized cells. No grid lines no labels no numbers no typography no background no checkerboard. Every asset fully isolated with at least40px transparent gutter to cell edges; nothing overlaps cells.
Style BRAVE GUY funny Japanese action cartoon, thick clean BLACK outlines, vivid flat cel colors, green-yellow-red accents. NOT metallic, NOT sci-fi machinery, NOT fantasy filigree. Frames flat straight middle edges suitable nine-slice; decoration only corners/ends; no textures through stretchable center.
ROW1 LEFT: empty circular PORTRAIT FRAME, thick black outer outline green band narrow yellow inner rim, transparent hollow center, simple four corner/compass comic notches. Diameter190px.
ROW1 RIGHT: empty horizontal BAR FRAME,560x100px pill-rounded rectangular outline, black thick outer rim green narrow border small yellow end tabs; perfectly straight plain middle section; center FULLY transparent.
ROW2 LEFT: red HEALTH FILL, horizontal smooth rounded rectangle540x65, solid red with one lighter top strip, no icons, no extra external frame. Plain middle for horizontal clipping.
ROW2 RIGHT: green COURAGE FILL same540x65 silhouette, saturated lime green top shine echo green energy orb, plain continuous middle no icons.
ROW3 LEFT: COURAGE FULL same exact bar silhouette and dimensions as normal green, extra narrow golden glow and2small comic sparkles confined to cell, alpha glow around edges.
ROW3 RIGHT: purple GUILT FILL same540x65 silhouette top edge, deeper purple bottom heavy black lower lip suggests downward weight, plain midsection no metal, no icons.
ROW4 LEFT: GUILT CRACK variant same dimensions and palette as guilt, three sharp large cracks across purple, slight lower sag and2tiny purple chips underneath within gutter. Only one bar.
ROW4 RIGHT: yellow QI ENERGY RING circle190px diameter, bright golden yellow thick continuous ring black outline with highlight, completely transparent center to fit ultimate button.
Clean reusable 2D bitmap game interface parts. EXACTLY8assets. Empty space transparent, all interior holes transparent, no shadows onto background. Each asset centered in its cell.

## guilt_explode_sheet

Create transparent PNG sprite animation sheet1536x1024 landscape3:2, EXACTLY4columns x2rows eight equal384x512 cells, no visible cell borders or text. Animation of BRAVE GUY purple guilt meter shattering. Use last image purple guilt bar design only, bold black outline, deep purple heavy bottom lip, bright magenta top highlight; no other atlas assets. Single SAME horizontal bar starts width280px height50px centered at local(192,230) in each cell. All frames same camera, scale, pivot and timing continuity, no perspective. Progress left-to-right upper row then lower row:
1 intact purple guilt bar, no glow;
2 same bar three thin cracks appear;
3 cracks widen, bright magenta energy leaks, bar still one silhouette;
4 bar bursts outward into8large purple black-outlined angular shards around center, small bright purple starburst;
5 same8shards spread farther outward, starburst smaller and fading;
6 same shards spread downward, smaller fading alpha purple streaks;
7 only4small dim purple fragments near lower area within cell;
8 only2tiny nearly transparent purple sparks, no intact bar.
All fragments contained within respective cell with at least35px gutters; NEVER cross cells. Background and all empty pixels truly transparent, no colored background haze, no checkerboard, no black background. Glow only small local attached to burst, not sheet-wide. Pure flat cartoon 2D sprite no3D no metal. Eight frames, no duplicate intact bar after frame3. Ready for programmer to slice into equal4x2tiles.
