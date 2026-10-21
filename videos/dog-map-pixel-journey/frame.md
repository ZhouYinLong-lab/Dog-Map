# RPG Maker × Turner — production style contract

## v4 override: disciplined, full-size album stack

Latest correction: Jinji Lake was NOT a cycling visit. No cyclist or cycling
claim may appear during 14–21s. Use a neutral film-progress square, not an
invented alternative transport mode. Title: 湖畔灯火，收进相册.

All photo frames measure 512×400 regardless of source aspect ratio. Object-fit
cover preserves proportions while allowing display-only reframing; source files
remain untouched. Use --photo-focus for subject-aware exceptions. No filters.
The latest photo is the clear hero; older photos show only narrow edges behind
it. Layer steps are 8px right / 16px up, rotations -2°, -1°, 0°. No swinging,
alternating angles, or changing card sizes. Align the location sticker with the
right column. Keep website imagery, scene timing and music unchanged.
Regression checks cover geometry, layer order, stable display area and the
Jinji Lake boundary/seek behavior. v4 supersedes the v3 no-crop/large-spread rules.

## v3 direction (archived): accumulating photo stack

The user's sketch specifies a real stack, not a carousel. Each new photo is
painted above the preceding photos; older cards retain full opacity and their
settled pose. Keep natural aspect ratios, no filters or crops. Slight alternating
tilts and 80px bottom-edge spacing expose older images even across mixed formats.
The original upper-right sticker is separate from the pile. Leave the website
panel, titles, global cyclist and original music unchanged. Only the whole pile
exits during a location change; the last pile holds through the final frame.
Shared implementation: assets/photo-stack.js. Regression checks: npm test.

## v2 foundation: website-first cycling edit

Latest user direction supersedes the old full-world scene layout below.
Use the real website screenshots as the dominant surface (~29 seconds fully visible).
Right-side original photos enter sequentially with their natural aspect ratios;
the current original website sticker sits at the upper-right.
A small continuous pixel cyclist travels across the footer, driven by global time.
No illustrated cartography or fictional route is used in the active composition.
Warm/cool pixel palette, local pixel font and original music unify the real-media presentation.
Campus illustration follows verified Tianshu building features; see CAMPUS-REFERENCE.md.

## Original v1 art direction (archived)

Source: https://github.com/ZhouYinLong-lab/OhMyStyle/blob/main/style-packages/composites/rpg-maker-x-turner/README.md

The requested composite overrides generic SaaS/promo presets.
RPG Maker owns geometry (60%); Turner owns light, weather and depth (40%).
Render scenic worlds on a 480×270 Canvas 2D, nearest-neighbor enlarged exactly 4×.
Use integer pixel rectangles, Bresenham lines, stepped silhouettes, selective
dither clusters, coherent building scales, and several atmospheric layers.
Do NOT use smooth gradients, blur, oil texture, generic geometric placeholders,
glossy 3D, vignette filters, particles everywhere or photographic AI scenery.
Scene backgrounds are original generated pixel illustrations, matching the
requested package and local architecture references. Early generation requests
failed HTTP 429; a queued market request and two retried scenes succeeded.
Native pixel code provides deterministic animated foreground details and maps.
The earlier native scenic drawing functions remain as editable fallback studies.
Compose richly detailed places: paving, architectural windows, trees, clouds,
water reflections, lamps. Avoid flat giant blank colored polygons.

Palette: night #11182B; ink #202A48; blue #536A9C; lavender #8B80A8;
teal #527C78; forest #304B3F; amber #E4A24C; ochre #A86E3C;
rose #B65F68; cream #E7D8B8; silver #B9C7D8; route #D95846.
Sunlight is a small warm event inside a broad cool field, not a glow overlay.
Depth comes from decreasing saturation/detail/contrast.

Typography: local Fusion Pixel 12px proportional zh-Hans at
assets/pixel.woff2; @font-face family "DogPixel", font-weight 400.
Display 72px or 96px, secondary 36px, eyebrow 24px. No fake bold.
Cream text on ink panels if needed; generous breathing room.
Headline usually left 112px top 110px. Keep important content above y=890.
English eyebrow small; Chinese main title concise; no paragraphs.

Five 7-second scenes. Composition IDs scene-01 … scene-05.
Each scene uses template with all style/markup/script inside.
Local paths assets/... from project root. GSAP supplied by host.
One paused timeline registered LAST at window.__timelines[scene-id].
For canvas drive {t:0} to {t:7}, onUpdate draw(state.t); draw(0) at startup.
Canvas and all code must be seek/reverse-seek deterministic.
Shared helper available as window.DogPixel:
palette, rect(ctx,x,y,w,h,color), line(ctx,x1,y1,x2,y2,color,width=1),
poly(ctx,points,color), hash(index,seed=0), tree(ctx,x,y,size,tone=0),
cyclist(ctx,x,y,time,scale=1), sky(ctx,time,variant='dawn').
Do not edit helper or host. Helpers do not draw titles.

Camera: deliberate short settling move then frame locks. World itself lives:
cyclist path travel, water glints, market lamps. Avoid generic still-slide pans.
Text appears at meaningful music cues; no looping breathing or floating cards.
No audio in scenes; main owns original score. No voiceover.
Real-photo inserts retain original photographic look, with intentional borders.
Do not claim a scene is a literal UI recording; map outro is an illustrated
representation of actual destination data, labeled "旅行存档".
