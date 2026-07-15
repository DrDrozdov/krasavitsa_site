# Krasavitsa design system

## Concept: cinematic beauty intelligence

Krasavitsa combines an independent fashion journal, a tactile beauty object and a fast native tool. The experience is not a grid of AI cards: it opens as a cinematic editorial cover, becomes a clear selection instrument, and finishes as a personal journal. Bordeaux is structural, blush is atmospheric, raspberry is kinetic and violet appears only as reflected light.

The primary visual world contains sculptural bottles, jars, chrome and abstract light. Faces, influencer portraits, “magic potion” cues and crowded shelves are avoided. The hero uses a real muted loop with a purpose-built still poster so it remains art-directed when autoplay or motion is unavailable.

## Typography

- Display: local variable Unbounded, used for mastheads and decisive editorial statements.
- Interface and longform: local variable Onest.
- Display text stays wide and short; mobile headlines do not become six-line walls.
- Longform copy uses a narrow readable measure, drop cap and one pull quote rather than a card per paragraph.

## Layout and rhythm

- Mobile is the source layout. A first viewport contains the identity, promise, main action and a visible next-content cue.
- Desktop alternates asymmetric image-led scenes, editorial indexes and functional split layouts.
- Content width is 1240–1480 pixels with 16-pixel mobile gutters.
- Borders, cuts and typographic scale create hierarchy. Rounded cards are not the default.
- Every large block must add proof, utility or narrative movement; repeated promises are removed.

## Signature scenes

1. **Cinematic hero:** full-bleed poster + loop video, split wordmark, orbital scan lines, cursor-linked depth on fine pointers.
2. **AI selection object:** one three-dimensional liquid prism with a maximum of two smoothly crossfading facts.
3. **Journal:** masthead, lead story, editorial index, sticky archive heading and full-screen writing desk.
4. **Product composition:** verified unchanged packshot on one of 20 deterministic bordeaux/blush backgrounds.

## Motion rules

- Press feedback: 80–120 ms; interface transitions: 180–460 ms; cinematic reveals: up to 900 ms.
- Motion follows meaning: spatial menu reveal, search verification, editorial image crop and button response.
- Primary buttons use a cursor-positioned liquid light field plus a restrained magnetic translation (maximum 7 px).
- Desktop burger opens on mouse hover and click; touch remains click-only.
- Essential text is never dependent on an entrance animation completing.
- `prefers-reduced-motion` disables video visibility, loops, scan travel, parallax and 3D turns while preserving layout.

## Navigation

- Floating compact chrome contains a mark, core links, profile icon, theme toggle, CTA and burger.
- Profile is reachable from every route as a real 44-pixel icon target.
- The menu is portaled at the maximum stacking layer, locks body scroll, traps focus, closes on Escape/backdrop/navigation and restores focus.
- Menu entry uses clip-path, blur and scale so it feels like material opening rather than a generic side slide.

## AI result contract

- Short two-to-three sentence context precedes products.
- Cards prioritize a copyable exact name, match explanation, safe usage, limitations, verified product links and favorites.
- Community rating has an explicit empty/new state; fabricated marketplace ratings or prices are forbidden.
- Four image compositions are requested in parallel. Discovery and verification are separate server stages; a small optimized local image guarantees that the interface never breaks.

## Theme contract

- First paint follows `prefers-color-scheme` through an inline pre-render script.
- Manual Light or Dark persists and wins over the system; Auto removes the override and resumes live system updates.
- `theme-color`, `color-scheme`, DOM dataset and UI controls always describe the same active theme.
- Fixed cinematic bordeaux scenes own their foreground color; theme-aware surfaces use semantic tokens only.
- No raw light panel may carry dark-theme copy without an explicit override.

## Analytics contract

- Product analytics is cookieless and aggregate by design: no IP, exact location, fingerprint, visitor ID or query text.
- Cookie preference controls only optional site settings and never silently disables operational statistics.
- Admin views the funnel, search quality and latency, result volume, content/profile activity, sources, devices, themes, browsers and Core Web Vitals.

## QA gates

- Build and lint must pass before deployment.
- Verify 320, 390, 430, 768, 1024 and 1440 pixel widths; light and dark; keyboard and touch.
- Verify no horizontal overflow, clipped examples, white-on-white/dark-on-dark text, undersized VK glyph, dead profile routes or hidden menu layers.
- Verify video fallback, reduced motion, system theme changes, manual override and Auto reset.
- Run a real search event and confirm `page_view → search_submit → search_success`, latency, product count and image response in aggregate storage.
