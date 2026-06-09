# Iris — Feature Reference

## Email Categories

Iris classifies every incoming email into one of five categories, displayed as tabs on the Emails page:

| Category | What it contains | Primary action |
|---|---|---|
| **RDV** | Emails containing appointment proposals detected by the backend NLP pipeline | Confirm to Google or Apple Calendar |
| **Action** | Emails requiring an action (signature, payment, form, response) | Mark as treated |
| **En attente** | Emails awaiting a reply or follow-up | Set a reminder |
| **Bons plans** | Promotional emails — discounts, promo codes, offers | Copy extracted promo code |
| **Info** | Informational emails — newsletters, confirmations | Summarize with AI |

Category counts are always visible in the tab bar. Switching tabs filters the list instantly.

---

## Quick Actions (⋮)

Every email card has a three-dot menu (orange ⋮). Clicking it reveals contextual action buttons:

- **Confirmer RDV** (RDV only) — sends a confirmation request to the backend and adds the event to your connected calendar. Supports multi-provider selection when both Google and Apple Calendar are connected.
- **Résumer** — sends the email subject + body to the backend AI summarizer and displays the result in the side panel.
- **Répondre** — generates three reply variants (formal, neutral, short) via the backend AI and displays them with one-click copy.
- **\[Promo code\]** (Bons plans only) — shows the extracted code as a copyable pill. The code is extracted client-side from the email body using keyword + pattern matching. If no code is found, this button is not shown.

A short click sound plays when the ⋮ button is pressed (respects the Sound setting).

---

## Iris Toggle (Power Button)

Iris has an active/inactive state controlled by the power button:

- **Home page** — full-size animated button with glow, ripple rings, and animated caption.
- **Emails page** — compact circular button in the page header, same functionality.
- **State** — stored in `AuthContext.isIrisActive`. When inactive, all quick action buttons are dimmed and non-interactive (opacity 0.28).

When activated from the home page, Iris automatically navigates to the Emails page after 2 seconds.

---

## Read State

Opening an email (clicking the card) marks it as read for the session:
- The card fades to 50% opacity with a subtle desaturation.
- A small "Lu" badge appears at the top-right corner.
- This state is in-memory only and resets on page reload.

---

## Email Side Panel

Clicking an email opens a detail panel on the right side of the Emails page. It has three modes:

| Mode | How to enter | Content |
|---|---|---|
| **Read** | Click any email card | Full email body (fetched from backend for Gmail) |
| **Summary** | Click Résumer | AI-generated summary with toggle back to original |
| **Reply** | Click Répondre | Three reply variants with copy buttons |

---

## Guided Tour

Accessible via **Settings → Aide & Tutoriel**. A 4-step contextual tour:

1. **Home page — Power button**: explains Iris activation
2. **Emails — Mini Iris toggle**: explains in-page control
3. **Emails — Category tabs**: explains the five categories
4. **Emails — Quick actions**: explains the ⋮ menu

Each step auto-navigates to the correct page and positions a tooltip card next to the relevant element using `getBoundingClientRect()`. Steps can be navigated forward/backward; clicking the backdrop closes the tour.

---

## Sound System

Sounds are synthesized at runtime via the Web Audio API (no audio files). Implemented in `src/lib/sounds.ts`:

| Function | Trigger | Description |
|---|---|---|
| `playPop(expanding)` | Sidebar expand/collapse | Short frequency sweep |
| `playSettingsPanelPop(opening)` | Settings drawer open/close | Slightly brighter or lower sweep |
| `playDotsClick()` | Quick action ⋮ button | Short snappy tick |

All sounds check `isSoundAlertsEnabled()` from `src/lib/notificationPreferences.ts` before playing. The Sound toggle in Settings persists the preference to `localStorage`.

---

## Onboarding Flow

New users go through a multi-step signup flow:

1. `/signup` — Email + password + terms acceptance
2. `/begin` — Enter display name
3. `/profile-choose` — Pick a profile icon (6 options)
4. `/connect-app` — Connect Gmail, Outlook, and/or Apple Calendar
5. `/dashboard` — Preview of the app with a "Start" button

---

## Settings Panel

Accessible via the sidebar gear icon. Sections:

- **Profile** — change display name and profile icon; change password
- **Connected services** — connect/disconnect Gmail, Google Calendar, Apple Calendar
- **Notifications** — toggle desktop notifications and sound alerts
- **Aide & Tutoriel** — launches the guided tour

---

## Version

The app version is defined in a single place: `src/lib/version.ts`. All UI references import `APP_VERSION` from there — updating one constant updates the entire app.
