# CineView — Design System & Screen Documentation

> **Source:** Google Stitch Project `projects/17118370163806267301` (**CineView 3D Cinema Booking**)  
> **Design System Asset:** `assets/0c99cc9709704484841840b2f1cdc510` (**Cinematic Avant-Garde**, v1)  
> **URL:** https://stitch.google.com/projects/17118370163806267301  

---

## 1. Brand & Aesthetic Direction

CineView is a luxury, architectural 3D cinema booking experience designed for discerning cinephiles, festival attendees, and premium theatergoers.

The visual language combines **Experimental Brutalism** and **Atmospheric Glassmorphism**:
- Ultra-deep, light-absorbent obsidian backdrops (`#0B0C10` / `#121317`) paired with high-contrast spectral neon accents.
- Sculptural display typography (**Syne**) contrasted with crisp technical sans/monospace-like clarity (**Geist**) for seat coordinates (`E-7`, `ROW G // SEAT 14`), runtime timecodes, pricing, and audio codec specs.
- Interactive 3D auditorium canvases (powered by Three.js) that mimic architectural blueprints bathed in projector light and spatial audio (Dolby Atmos) raycasting.

---

## 2. Color System

### 2.1 Core Brand & Semantic Accents
| Token | Hex | Role & Usage |
| :--- | :--- | :--- |
| **Primary Container / Brand** | `#a78bfa` | Electric Lavender — projector beam, selected seat fill, primary CTAs, active focus rings & radial glows |
| **Primary (Surface/Text)** | `#cebdff` | High-emphasis lavender tint for primary text/icons on dark surfaces |
| **Secondary / VIP** | `#f59e0b` / `#ffb95f` | Radiant Amber / Gold Foil — VIP lounge tiers, Director's Box, premiere laurels, VIP recliner borders |
| **Tertiary / Spatial Audio** | `#06b6d4` / `#4cd7f6` | Cyber Cyan — Dolby Atmos badges, IMAX with Laser indicators, acoustic raycasting, live timestamps |
| **Error** | `#ffb4ab` (container `#93000a`) | Validation errors, unavailable/full warnings |

### 2.2 Neutrals & Surface Hierarchy
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `neutral` / `Canvas Void` | `#0b0c10` | Deepest backdrop void |
| `surface-container-lowest` | `#0d0e12` | Recessed stage & lowest-level containers |
| `background` / `surface` / `surface-dim` | `#121317` | Base page background |
| `Surface 1` (Card base) | `#13151b` | Movie cards, seat nodes, input fields |
| `surface-container-low` | `#1a1b20` | Secondary panels |
| `Surface 2` (Elevated panel) | `#1b1e28` | Elevated floating panels |
| `surface-container` | `#1f1f24` | Standard container fill |
| `Seat Occupied` | `#242836` / `#1e212b` | Non-interactive reserved/occupied seats |
| `surface-container-high` | `#292a2e` | Hover/elevated card states |
| `Border / Wireframe` | `#2a2e3d` | Hairline structural borders |
| `surface-container-highest` / `surface-variant` | `#343439` | Highest surface containers |
| `surface-bright` | `#38393e` | Brightest neutral surface |
| `outline-variant` | `#494552` | Subtle dividers & borders |
| `outline` | `#948e9d` | Default borders & muted icons |
| `on-surface-variant` / `Text Muted` | `#cac4d4` / `#94a3b8` | Metadata, secondary labels |
| `on-surface` / `on-background` | `#e3e2e8` / `#ffffff` | Primary text |

### 2.3 Full Theme Token Map (`designTheme.namedColors`)
- **Primary:** `primary` (`#cebdff`), `on_primary` (`#381385`), `primary_container` (`#a78bfa`), `on_primary_container` (`#3c1989`), `primary_fixed` (`#e8ddff`), `primary_fixed_dim` (`#cebdff`), `on_primary_fixed` (`#21005e`), `on_primary_fixed_variant` (`#4f319c`), `inverse_primary` (`#674bb5`), `surface_tint` (`#cebdff`)
- **Secondary:** `secondary` (`#ffb95f`), `on_secondary` (`#472a00`), `secondary_container` (`#ee9800`), `on_secondary_container` (`#5b3800`), `secondary_fixed` (`#ffddb8`), `secondary_fixed_dim` (`#ffb95f`), `on_secondary_fixed` (`#2a1700`), `on_secondary_fixed_variant` (`#653e00`)
- **Tertiary:** `tertiary` (`#4cd7f6`), `on_tertiary` (`#003640`), `tertiary_container` (`#00acc9`), `on_tertiary_container` (`#003a45`), `tertiary_fixed` (`#acedff`), `tertiary_fixed_dim` (`#4cd7f6`), `on_tertiary_fixed` (`#001f26`), `on_tertiary_fixed_variant` (`#004e5c`)
- **Error:** `error` (`#ffb4ab`), `on_error` (`#690005`), `error_container` (`#93000a`), `on_error_container` (`#ffdad6`)
- **Inverse:** `inverse_surface` (`#e3e2e8`), `inverse_on_surface` (`#2f3035`)

---

## 3. Typography

- **Headline / Display Font:** `Syne` (Google Fonts)
- **Body / UI / Label Font:** `Geist` (Google Fonts)
- **Iconography:** `Material Symbols Outlined`

| Token | Font Family | Size | Weight | Line Height | Letter Spacing | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `display` | Syne | `56px` | `800` | `60px` | `-0.03em` | Desktop hero headlines |
| `display-mobile` | Syne | `36px` | `800` | `40px` | `-0.02em` | Mobile hero headlines |
| `headline-lg` | Syne | `36px` | `700` | `44px` | `-0.02em` | Page section headers |
| `headline-lg-mobile` | Syne | `28px` | `700` | `34px` | `-0.01em` | Mobile section headers |
| `headline-md` | Syne | `24px` | `600` | `32px` | `-0.01em` | Card/panel titles |
| `headline-sm` | Syne | `20px` | `600` | `28px` | — | Sub-section headers |
| `title` | Geist | `16px` | `600` | `24px` | `0.01em` | UI titles & card names |
| `body-lg` | Geist | `18px` | `400` | `28px` | — | Lead copy / synopses |
| `body-md` | Geist | `15px` | `400` | `24px` | — | Standard body text |
| `body-sm` | Geist | `13px` | `400` | `20px` | — | Secondary metadata |
| `label-md` | Geist | `12px` | `600` | `16px` | `0.08em` | Uppercase controls & nav |
| `label-sm` | Geist | `10px` | `700` | `14px` | `0.12em` | Uppercase format chips & seat badges |

---

## 4. Layout, Grid & Spacing

### 4.1 Responsive Grid
- **Desktop (`1200px+`):** 12 columns, `1.5rem` (`24px`) gutters, `3rem` (`48px`) canvas margins. Auditorium visualizers break out to full viewport-height pinning.
- **Tablet (`768px – 1199px`):** 8 columns, `1.25rem` (`20px`) gutters, `2rem` (`32px`) margins. Seat matrix uses interactive pan-and-zoom with a sticky booking summary drawer.
- **Mobile (`<768px`):** 4 columns, `0.75rem` (`12px`) gutters, `1rem` (`16px`) margins.

### 4.2 Spacing Tokens
| Token | Value |
| :--- | :--- |
| `space-xs` | `0.25rem` (`4px`) |
| `space-sm` | `0.5rem` (`8px`) |
| `space-md` | `1rem` (`16px`) |
| `space-lg` | `1.5rem` (`24px`) |
| `space-xl` | `2.5rem` (`40px`) |
| `gutter` / `gutter-mobile` | `1.5rem` / `0.75rem` |
| `margin` / `margin-mobile` | `3rem` / `1rem` |

### 4.3 Border Radius
> Note: `designTheme` defines base `DEFAULT: 0.25rem` (`4px`), while the generated Tailwind config in HTML uses `ROUND_FOUR` (`DEFAULT: 0.125rem`, `lg: 0.25rem`, `xl: 0.5rem`, `full: 0.75rem`).
- **Base (`DEFAULT`):** `0.25rem` (`4px`) — seat nodes, metadata tags, form inputs
- **Containers (`lg`):** `0.5rem` (`8px`) — showtime cards, synopsis panels, checkout side-sheets
- **Hero / Modals (`xl`):** `0.75rem` (`12px`) — auditorium stage frames, floating confirmation modals
- **Pills (`full`):** `9999px` — format chips and filter pills

---

## 5. Elevation, Depth & Luminescence

Depth is modeled after projection physics inside a dark auditorium rather than traditional drop shadows:
- **Layer 0 (Canvas Void):** `#0B0C10` with faint conic gradients simulating screen reflection.
- **Layer 1 (Recessed Panels & Seat Grids):** `#13151B` with hairline borders (`1px solid rgba(255, 255, 255, 0.08)`).
- **Layer 2 (Floating Action Panes & Glass Toolbars):** `background: rgba(19, 21, 27, 0.75); backdrop-filter: blur(16px);` with a top-lit stroke (`1px solid rgba(167, 139, 250, 0.2)`).
- **Luminescence & Glow:**
  - Selected seat glow: `0 0 16px rgba(167, 139, 250, 0.45), 0 0 2px rgba(167, 139, 250, 0.9)`
  - VIP / Accolade glow: `0 0 20px rgba(245, 158, 11, 0.35)`

---

## 6. Reusable UI Patterns & Components

### 6.1 Global Navigation Shell (Shared across all 6 main screens)
- **Top Nav Links:** `Home`, `Movies`, `Cinemas`, `3D Seat View`, `Checkout`, `Digital Ticket`, `My Bookings`, `Hall Studio Admin` + notification bell icon button.
- **Global Footer:** Multi-column layout (`Network`, `Platform`, `Exclusive Screenings`) with legal links (`Terms of Service`, `Privacy Policy`, `Seat Accuracy Guarantee`).

### 6.2 Buttons
- **Primary (Electric Violet):** `#A78BFA` background, `#0B0C10` bold text; hover adds ambient purple halo and `-1px` vertical lift.
- **VIP Action (Gold Foil):** Linear gradient (`#F59E0B` → `#D97706`), `#0B0C10` text; reserved for VIP/recliner tier upgrades.
- **Ghost / Outlined:** `1px solid rgba(255, 255, 255, 0.12)`, `#FFFFFF` text; hover fills with `rgba(167, 139, 250, 0.08)`.

### 6.3 Cinema Seat States & 3D Auditorium Visualizer
- **Available Standard:** `0.25rem` radius, `1px solid #3F4458`, fill `#13151B` (hover: `#A78BFA` border, `scale(1.15)`).
- **Selected:** Fill `#A78BFA`, border `1px solid #C4B5FD`, violet radial bloom.
- **Occupied / Reserved:** Fill `#1E212B`, transparent border, `opacity: 0.45`, non-interactive.
- **VIP / Recliner Tier:** Border `1px solid #F59E0B`, fill `rgba(245, 158, 11, 0.1)`, amber hover aura.
- **Screen Arc & Perspective Stage:** Curved glowing vector (`rgba(255, 255, 255, 0.8)`) with downward gradient projection cone.
- **3D Interactive Controls:** Three.js auditorium viewport with zoom (`add`/`remove`), `Reset View`, Dual Perspective Seat Comparison, and Dolby Atmos Acoustic Raycasting visualization, paired with a sticky bottom/side booking summary bar (`Selected Auditorium Seats`, voucher eligibility, subtotal, taxes/fees, `Proceed to Checkout`).

### 6.4 Screening Format Chips & Badges
- `label-sm` uppercase (`0.12em` tracking), `1px solid rgba(255, 255, 255, 0.1)`, dark fill + neon pip:
  - **IMAX with Laser:** Neon cyan pip (`#06B6D4`)
  - **Dolby Cinema:** Electric purple pip (`#A78BFA`)
  - **70mm Film:** Warm amber pip (`#F59E0B`)

### 6.5 Movie & Showtime Cards
- `#13151B` surface, `2:3` vertical poster frame, bottom gradient overlay (`linear-gradient(to top, #0B0C10, transparent)`), format/genre filter chips, and interactive showtime selection chips (`14:15`, `17:30`, `20:45`, `23:10`) with quick `3D Map →` / `Quick Seat View` actions.

### 6.6 Input Fields & Selectors
- `#13151B` background, `1px solid #2A2E3D` border, `#FFFFFF` text; focus transitions to `#A78BFA` with `0 0 0 2px rgba(167, 139, 250, 0.2)` ring.

---

## 7. Screen Inventory & App Route Mapping

### 7.1 Main CineView UI Screens (15 Screens in Stitch)
| Stitch Screen ID | Stitch Title | Dimensions | App Route |
| :--- | :--- | :--- | :--- |
| `5fedf497dcd34345a6443407dd4bcd38` | Home - CineView | 2560 × 7550 | `/` |
| `b932a10cf84f4fe9bc68c0c76bd0b4b2` | Movies & Film Repertory - CineView | 2754 × 6960 | `/movies` |
| `f920ea49f98e4acd97d067b6704f7d84` | Movie Details - CineView | 2560 × 5920 | `/movies/[id]` & `/showtimes` |
| `53c75095be22482aba15da6b6b5c47bc` | Cinemas & Showtimes - CineView | 3520 × 4440 | `/cinemas` & `/showtimes` |
| `9c4bac010101450e9751434e0dc8147b` | Cinema Details - CineView | 2802 × 6504 | `/cinemas/[id]` |
| `fabd8bd29256451aaf3995c976fe1944` | 3D Seat View & Booking - CineView (v1) | 2560 × 2940 | `/seats/[showtimeId]` (reference) |
| `f9727ae5a82644d98a57ac513399721a` | Interactive 3D Cinema Seat Selection - CineView (v2) | 2560 × 3056 | `/seats/[showtimeId]` (reference) |
| `93118fc3ce764f7dbd0fe79685fea9e3` | Interactive 3D Cinema Seat Selection with Dolby Atmos Acoustic Raycasting - CineView (v3) | 2560 × 2690 | `/seats/[showtimeId]` & `/seat-view` |
| `f7349f90079f4282b26a692c407a7381` | Checkout - CineView | 2560 × 4652 | `/checkout` |
| `cb8a28f2710648e7b4b578f413892a3c` | Booking Confirmation - CineView | 2560 × 4060 | `/confirmation/[bookingId]` |
| `6ef3be22b253482885416da747523f35` | Digital Ticket - CineView | 3044 × 3218 | `/tickets/[bookingId]` |
| `49ecdcd42557403ab9b154c99d30ad27` | Digital Ticket - CineView (alternate) | 3064 × 3306 | `/tickets/[bookingId]` (reference) |
| `17821700bfe444dab8ca7a5483df8a06` | My Bookings - CineView | 3046 × 4938 | `/my-bookings` |
| `5f2ec05728e94eab83e6093256583697` | User Profile - CineView | 2560 × 7588 | `/profile` |
| `2c50577ec79249ebb3d0a38a2ead3627` | Hall Studio Admin — Cinema Management | 3712 × 5124 | `/admin` |
| `4c1865878ad04dff96bd793e64cf4e87` | Auditorium Editor - CineView (Hall Studio Admin) | 2560 × 2840 | `/admin/auditoriums/[id]` |
| `a9a81b4bdd63446a931e68ff35fd2d20` | Auditorium Editor - CineView (alternate) | 2560 × 2334 | `/admin/auditoriums/[id]` (reference) |

### 7.2 3D Canvas Widgets & Visual Assets (13 Screens in Stitch)
- **3D Three.js Auditorium Widgets (512 × 512):** `76f91c133d934457b9ed894f66d5e888`, `ff5cce01881a43d79bec3b7e66eea067`, `dcb6375475ef48ebbc2e56c516522759`, `8a3d5d826de04a5c9321659e38718895`
- **Movie Posters (848 × 1264):** `344b36d1b1f14d4fa61e2c3e3601862d` (*Chrono Overdrive: Dune 2099*), `a1a056e98de04af690de5318c363e691` (*Synthesis: Zero*), `18563375cf6041aea7189c88eb1a8ea6` (*The Echo Chamber*), `8b95997c6c104ae8a54969f6882aab89` (*Orbital Horizon*), `e684835acf2b4bde8518879535f0e6ce` (*Hypersonic Drift: Canyon Protocol*), `89220d76fddd470e81fe49cbbbba7da4` (*Kuroshio: Vector Shift*), `2599582c1b5f47bba4d02ea47bea7b13` (*The Void Polar*), `42440c6ba5e1400899341c901ad3e6be` (*Requiem in Solitude*)
- **Cinema Architecture Photo (1376 × 768):** `e5489bcf0c714941b25b911716598132` (*CineView Premiere Dome*)

### 7.3 Additional App Routes (Frontend-Only)
- `/offers` — Promotional offers, passes, and concessions preview (using existing card & badge patterns).
