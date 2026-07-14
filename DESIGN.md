# Krasavitsa design system

## Concept: editorial beauty laboratory

The visual system combines the confidence of an independent beauty magazine with the utility of a native mobile tool. The page rhythm alternates between image-led editorial moments and compact functional surfaces. Bordeaux is structural, powder is atmospheric, and raspberry is reserved for active states.

## Tokens

- Canvas light: warm ivory with a barely visible powder cast.
- Canvas dark: deep plum-black, never neutral black.
- Surface: opaque enough to guarantee contrast; translucency is reserved for navigation and temporary overlays.
- Ink light: deep plum.
- Ink dark: warm near-white.
- Muted text: always passes AA on its assigned surface.
- Primary: bordeaux.
- Accent: raspberry.
- Secondary accent: muted violet used sparingly in motion and data details.
- Border: visible at rest in both themes.

## Typography

Use one contemporary Cyrillic variable sans family with strong optical hierarchy. Display type is compact and confident, never stretched into six-line mobile headlines. Body copy is 16 pixels minimum on mobile with generous line-height. Labels are short and use tracking only at small sizes.

## Layout

- Mobile is the source layout, not a compressed desktop layout.
- Content width is 1240 pixels on desktop with 20–32 pixel gutters.
- Mobile gutters are 16 pixels and vertical section spacing is 56–80 pixels.
- Prefer asymmetry, editorial crops, and full-bleed visual moments over equal-card grids.
- A mobile viewport should reveal the promise, the primary action, and the next content cue.

## Navigation

- Compact floating wordmark mark, centered context, profile icon, theme control, and burger.
- The mobile menu is a real fixed dialog rendered in a portal above every stacking context.
- Lock background scroll, close on Escape, close after navigation, and restore focus.
- Profile remains reachable from every route as a 44-pixel icon target.

## Motion

- Fast press feedback: 80–120 ms.
- Interface transitions: 180–280 ms with an ease-out curve.
- Editorial entrances: up to 600 ms and used once per section.
- AI selection uses one three-dimensional beauty prism with orbiting context particles and a two-fact crossfade.
- All motion is interruptible where input can change.
- Reduced motion removes transforms, loops, blur travel, and parallax while preserving state clarity.

## Components

- Buttons are decisive and compact, with one primary fill and quiet secondary outlines.
- Cards are flat content containers with 14–24 pixel radii depending on scale. Do not nest cards solely for decoration.
- Mode selection uses a compact segmented rail on mobile.
- Result cards prioritize product name, reason, compatibility, and save action.
- Social icons share one 44-pixel outer target and one 22-pixel optical glyph. The VK viewBox is cropped to the glyph so it matches the other icons visually.

## Theme behavior

- First visit follows `prefers-color-scheme` before first paint.
- Manual Light or Dark choice persists and takes priority.
- Auto mode returns control to the operating system and listens for live changes.
- Browser `theme-color` and `color-scheme` are updated with the active theme.
- Every component uses semantic color tokens; raw light backgrounds are not allowed on theme-aware surfaces.

## QA gates

- Test 320, 390, 430, 768, 1024, and 1440 pixel widths.
- Test light and dark at each representative layout.
- Verify text/background contrast, focus rings, 44-pixel targets, menu layering, body scroll lock, and route changes.
- Verify system theme changes, manual override, Auto reset, pageshow, visibility return, and storage events.
- Verify no clipped multiline examples, no horizontal overflow, and no decorative block with less information than the space it consumes.
