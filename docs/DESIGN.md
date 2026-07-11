# Ogod Design Language

Dark-first, content-forward, media-rich — modeled on modern audio-streaming apps. Near-black
canvases, image-led cards, **one** vibrant accent color, bold typography, horizontally
scrolling shelves.

## Color tokens

| Token             | Value     | Usage                                                        |
| ----------------- | --------- | ------------------------------------------------------------ |
| `background`      | `#121212` | App canvas — near-black, never pure `#000`                   |
| `surface`         | `#181818` | Cards, sheets, list rows                                     |
| `surfaceElevated` | `#242424` | Pressed/hover, raised cards, modals                          |
| `accent`          | `#1ED760` | Primary CTAs, active nav, seat-availability highlights, links|
| `textPrimary`     | `#FFFFFF` | Titles, prices                                               |
| `textSecondary`   | `#B3B3B3` | Meta text: dates, poster name, captions                      |
| `divider`         | `#2A2A2A` | Hairline separators (use sparingly — prefer spacing)         |
| `error`           | `#F15E6C` | Validation, destructive actions                              |

- Depth comes from **lighter surface shades**, not borders or drop shadows.
- Detail screens may derive a muted gradient from the cover photo's dominant color.
- Accent is used **sparingly** — one vivid color against neutral darks.

These tokens are mirrored in three places, keep them in sync:
- Backend: n/a
- Admin panel: [`admin-panel/src/styles/theme.css`](../admin-panel/src/styles/theme.css)
- Android: [`android/app/src/main/res/values/colors.xml`](../android/app/src/main/res/values/colors.xml)

## Typography

Geometric sans-serif — **Figtree / DM Sans / Plus Jakarta Sans** (Google Fonts).
Screen titles Bold/ExtraBold 22–28sp, card titles SemiBold 14–16sp, meta Regular 12–13sp in
`textSecondary`. Tight line height on headings; generous whitespace instead of dividers.

## Components

- **Trip card (grid):** surface `#181818`, radius 8dp, edge-to-edge cover (rounded top),
  title/dates/price below, seats-left badge in accent, subtle scale/ripple on press.
- **Shelf card (carousel):** square or 4:5 image ~140–160dp, transparent card background so
  the image floats.
- **List row:** 56–64dp with rounded 48dp thumbnail, title + meta stacked, chevron/action.
- **Hero/detail header:** full-bleed cover with bottom gradient, collapsing toolbar.

## Layout patterns

- **Home:** vertical feed of horizontal shelves — "Departing soon", "Pilgrimage circuits",
  "Treks & adventure", "Weekend getaways", "Popular near you" — each with header + "See all".
- **Browse/Search:** pinned pill search bar; idle → 2-column category tiles; results →
  2-column trip-card grid.
- **Filter chips:** pill chips row (All · Pilgrimage · Trek · Family · Adventure…); selected
  chip fills with accent + dark text.
- **Bottom nav:** 4 items — Home, Search, Post Trip, Profile — translucent dark bar.
- **Primary CTA:** fully-rounded pill, accent fill, dark text `#121212`, 48–56dp tall.

## Motion & states

- Skeleton loaders: dark shimmer (`#242424` over `#181818`) — no spinners on content screens.
- Transitions: quick fades + shared-element image transition card → detail; bottom sheets
  (rounded 16dp top, drag handle) for the inquiry form.
- Empty states: centered muted illustration + one-line message + accent action button.
