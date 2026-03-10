# Plan: Native-feeling screen transitions

## Konsta UI and animations

**Konsta does not provide page or tab transition APIs.** From the docs and codebase:

- **Page** is a layout container (background colors, component root). No transition props.
- **App** sets theme (iOS/Material), safe areas, touch ripple. No animation/transition options.
- There are no Konsta components for “view stack”, “router”, or “page transition”.
- Modals (Dialog, Sheet, Popup) have their own open/close behavior but no cross-page animation story.

So **we own all transition behavior**: tab content changes and route changes.

---

## Current navigation model

| Surface | Mechanism | Today |
|--------|------------|--------|
| **Tabs** (Events, Search, Saved, Profile) | Client state in `HomeScreen`; conditional render of one tab | Instant swap, no animation |
| **Event detail** | Next.js route `/events/[slug]`; `Link` from `EventCard` and back link in `EventDetail` | Full navigation, no transition |

---

## Options for native-feeling movement

### 1. Tab content transitions (in-page)

- **Goal:** When switching tabs, content doesn’t just appear; it slides or fades.
- **Approach:**
  - **A (CSS):** Single content area with `transform`/`opacity` + `transition`. Use a small state machine (e.g. “from” / “to” tab index) to apply slide-left/slide-right or crossfade. No extra deps.
  - **B (Framer Motion):** `AnimatePresence` + `motion.div` with `initial`/`animate`/`exit` keyed by `activeTab`. Gives slide + opacity with little code; adds a dependency.
- **Recommendation:** Start with CSS (no new deps, predictable). Add Framer Motion only if we want more complex choreography later.

### 2. Route transitions (Home ↔ Event detail)

- **Goal:** Navigating to event detail (or back) feels like a push/slide or fade instead of a hard cut.
- **Approach:**
  - **next-view-transitions** (by Shu Ding): Wraps the app and provides a `Link` + `useTransitionRouter()` that use the **View Transitions API**. Good fit for App Router; supports custom transition names (e.g. slide) via CSS.
  - **Fallback:** In browsers without View Transitions API, navigation stays instant (no error).
- **Caveat:** Library authors note that with complex Suspense/streaming, edge cases may appear; our event detail page is a simple server component, so we’re in the “basic” use case.
- **Recommendation:** Use `next-view-transitions` for route transitions; define a short slide (e.g. `slide-left` / `slide-right`) or fade in CSS to match a native feel.

### 3. Shared-element transition (optional, later)

- **Goal:** Event card (e.g. image/title) “morphs” into the detail hero when opening, and back when closing.
- **Mechanism:** View Transitions API with `view-transition-name` on the card image and detail hero so the browser can animate between them.
- **Reality:** Needs careful DOM structure and possibly a shared layout so both “old” and “new” views are present during the transition. More invasive and browser support is still evolving.
- **Recommendation:** Defer until after 1 and 2 are solid. Then prototype with one card → detail flow.

---

## Implementation phases

### Phase A: Tab content transitions (CSS)

- [ ] In `HomeScreen`, give the tab content container a stable key (e.g. `activeTab`).
- [ ] Add a wrapper with `overflow-hidden` and CSS transitions: e.g. short opacity + optional horizontal translate (e.g. 8–16px) based on “from” vs “to” tab index.
- [ ] Optionally add `prefers-reduced-motion: reduce` to disable or shorten the animation.
- [ ] Verify: Events ↔ Search ↔ Saved ↔ Profile feel like a single surface with light motion, not a flash cut.

### Phase B: Route transitions with next-view-transitions

- [ ] Install `next-view-transitions`.
- [ ] In root `layout.tsx`, wrap the tree with `ViewTransitions` (so the default “crossfade” or your custom transition runs on route change).
- [ ] Replace `next/link` with `next-view-transitions`’ `Link` for:
  - Event card → `/events/[slug]`
  - Event detail back link → `/`
- [ ] (Optional) Use `useTransitionRouter()` for any programmatic `router.push()` so those also get the transition.
- [ ] Add CSS for a custom transition name (e.g. slide) if desired; otherwise use default.
- [ ] Verify: Navigating to an event and back shows a smooth transition; unsupported browsers still navigate without errors.

### Phase C: Shared-element (card → detail hero) ✅

- [x] Same `view-transition-name`: `event-hero-${event.slug}` on EventCard image container and EventDetail hero.
- [x] View Transitions API morphs the named elements on list → detail and back (supporting browsers).
- [x] Fallback: older browsers get root fade only.

---

## Technical notes

- **Reduced motion:** Use `@media (prefers-reduced-motion: reduce)` to shorten or disable transitions in Phase A and B.
- **Konsta:** No code changes inside Konsta components; we only animate our wrappers and use Konsta as the visual shell.
- **Layout:** `ViewTransitions` in the root layout is the only structural change for Phase B; tab content stays inside `HomeScreen` as today.

---

## Summary

| Area | Konsta support | Approach |
|------|----------------|----------|
| Tab content | None | Our CSS (or later Framer Motion) for slide/fade |
| Route (home ↔ detail) | None | next-view-transitions + View Transitions API |
| Shared element (card → detail) | None | Optional later; View Transitions API + `view-transition-name` |

Konsta stays the source of our mobile UI look; we add a thin animation layer for tabs and routes so the app feels native and responsive.
