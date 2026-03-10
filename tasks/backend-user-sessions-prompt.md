# Prompt for riot-backend: User sessions and Profile / Saved-events support

**Context**

The **riot-frontend** app (sibling repo) was built from a Phase 5 plan that added a tabbed shell: Events, Search, **Saved**, and **Profile**. The Saved and Profile tabs are implemented in the UI but are placeholders until the backend supports user sessions and saved-events. The frontend already uses the Payload SDK with `credentials: 'include'` and has types generated from this backend (`User`, `SavedEvent`, auth operations). This prompt describes the **interactions the frontend needs** so the backend can implement or document session and saved-events support. Use your **local knowledge of the Payload CMS setup** in this repo (collections, auth config, access control, API shape) to decide how to implement; the frontend will align to whatever the backend exposes.

---

## 1. Authentication and session

The frontend needs to:

- **Log in** (email + password) and establish an authenticated session (cookie-based so the Payload SDK’s `credentials: 'include'` works).
- **Log out** (invalidate the current session so subsequent requests are unauthenticated).
- **Know whether the user is logged in** (e.g. a “me” or “current user” endpoint, or a documented way to infer auth from existing Payload auth APIs).
- **Optional:** Registration (e.g. `registerFirstUser` or a public sign-up flow) and **forgot password** if you already have those in auth config.

The frontend’s generated types include `Config.auth.users` with `login`, `registerFirstUser`, `forgotPassword`, `unlock`. It expects to call the backend with cookies and receive a session that is then sent on all subsequent API requests. Prefer reusing Payload’s built-in auth and session model (including any `sessions` on the User type) rather than inventing a new scheme.

**Defer to your codebase:** Use your existing Payload auth configuration, cookie/session settings, and CORS/domain setup. Document or expose only what the frontend needs: how to login, logout, and how to get the current user (or how to interpret 401 vs 200 on a given endpoint).

---

## 2. Profile screen (current user)

When the user is signed in, the **Profile** tab will show:

- **Read:** Display name (e.g. `firstName` / `lastName`), email, avatar (if present), and any non-sensitive profile fields you expose.
- **Optional:** Update profile (e.g. name, avatar) if you support it.

The frontend expects to resolve “current user” from the session (e.g. via a dedicated “me” endpoint or an existing Payload endpoint that returns the authenticated user). It will use the same `User` (or a safe subset) that’s in the shared payload-types; no extra DTO is required unless you want to restrict fields.

**Defer to your codebase:** Rely on your existing `users` collection, auth middleware, and any existing “current user” or profile API. Expose only the fields that are safe for the client (e.g. no `hash`, `salt`, or internal tokens). If access control or hooks already restrict what’s returned for the logged-in user, document that behavior so the frontend can depend on it.

---

## 3. Saved events screen and “save” actions

The **Saved** tab will list events the current user has saved; event cards and event detail will have a “save” (heart) control that adds or removes a saved-event for the current user. The frontend’s types already define a `saved-events` collection with `user`, `event`, and `savedAt` (and standard timestamps).

Required interactions:

- **List saved events (for the Saved tab)**  
  Return a paginated list of saved-events for the **current user**, with each item including enough event data to render a card (e.g. title, slug, featured image, start date, venue, categories). Either:
  - query `saved-events` with `where: { user: currentUser.id }` and populate `event` (and any nested fields the frontend needs), or  
  - expose a dedicated endpoint that returns the same shape.  
  The frontend will use the same `Event` (and related) types it already has; sorting by `savedAt` descending is desirable.

- **Add save (save an event)**  
  Create a `saved-events` document with `user` set to the current user (preferably server-side from the session) and `event` set to the chosen event id. Return the created document or a stable success response. Idempotency (e.g. “already saved” → 200 or 201 with existing record) is useful so the heart button can be toggled without errors.

- **Remove save (unsave an event)**  
  Delete the `saved-events` document for the current user and the given event (or return 204/success). No error if the record is already missing.

- **Check if an event is saved (for heart state)**  
  For a given event id (or slug), the frontend needs to know whether the current user has a saved-event for it. Options:  
  - a small endpoint that accepts event id (or slug) and returns `{ saved: boolean }` (or equivalent), or  
  - include a `saved` (or similar) flag when the frontend fetches event detail or list, or  
  - allow the frontend to query `saved-events` with `where: { user: currentUser.id, event: eventId }` and interpret “has docs” as saved.  
  Pick one approach that fits your access control and API style.

**Defer to your codebase:** Use your existing `saved-events` collection, its relation to `users` and `events`, and any access control (e.g. users can only read/write their own saved-events). If you already have hooks that set `user` from the session, keep using them. Document any limits (e.g. max saved per user) or validation rules so the frontend can handle errors (e.g. 400 with a message).

---

## 4. Summary of frontend expectations

| Area | Need |
|------|------|
| **Auth** | Login (email/password), logout, and a way to know current user (or auth status). Optional: register, forgot password. Cookie-based session. |
| **Profile** | Read current user profile (name, email, avatar, etc.); optionally update. |
| **Saved events** | List (paginated) for current user with event details; add save; remove save; check “is this event saved?” for UI state. |

The frontend will use the Payload SDK and the existing payload-types (`User`, `SavedEvent`, `Event`, auth operations). It will send credentials on every request and will only call endpoints you expose or document. No new frontend types are assumed beyond what’s already generated from your Payload config.

---

## 5. What to produce in riot-backend

- **Implement or confirm** auth (login, logout, session) and, if applicable, registration and forgot-password flows, using your existing Payload auth and session model.
- **Implement or confirm** a way for the frontend to get the current user (e.g. “me” or existing auth endpoint) and, if you support it, update profile.
- **Implement or confirm** saved-events: list (for current user, with event populate), create (with `user` from session), delete, and one of: “is saved?” endpoint, or “saved” flag on event payloads, or documented query so the frontend can derive “is saved?”.
- **Document** for the frontend: base URL and path for auth (login/logout), how to get current user, and the exact endpoints/query params for saved-events (list, add, remove, and “is saved?”). If you prefer the frontend to use only standard Payload REST/GraphQL and existing collections, document that (including `where`/`depth`/populate) instead of adding custom routes.

Use your **local Payload CMS filetree and config** (collections, auth, access control, hooks, custom routes) as the source of truth; the frontend will integrate to whatever you expose and document.
