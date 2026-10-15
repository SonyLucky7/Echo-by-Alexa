# ECHO — Progressive Global Hearth & Botanicals
### Premium Restaurant Website & Multilingual AI Dining Concierge

![ECHO Banner](https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop)

ECHO is a complete, production-grade restaurant platform for a luxury fine-dining sanctuary celebrating **open fruitwood fire, heirloom grains, and hyper-seasonal wild botanicals**.

The application combines a high-end editorial digital storefront, intuitive food discovery, a 14-tool multilingual AI dining concierge, real-time voice ordering with ElevenLabs, secure international Stripe payments (with instant sandbox fallback), real-time order tracking, and a live staff kitchen operations dashboard.

---

## Key Highlights

- **Multimodal Ordering**: Direct visual UI browsing, conversational text AI concierge, and hands-free voice AI conversation all share the exact same session, cart, pricing logic, and live order records.
- **Voice AI by ElevenLabs**:
  - Voice ID: **`sXSV9RZ095VZyL64w3ap`** ("Alexa" — soft, warm, friendly Brazilian female tone).
  - Multilingual voice support in **English**, **Hindi**, **Telugu**, **Spanish**, and **French**.
  - Real WebAudio FFT `AnalyserNode` frequency spectrum visualizer (organic glowing hearth orb and frequency equalizer responding to live decibel energy; zero fake CSS wave simulations).
  - Graceful fallback to browser Web Speech API when offline or running without API keys.
- **Authoritative AI Concierge**:
  - Powered by Gemini 2.0 Flash function calling mapped to 14 verified database tools (`browse_menu`, `get_item_details`, `recommend_items`, `customize_item`, `add_to_cart`, `view_cart`, `update_cart_item`, `remove_from_cart`, `get_restaurant_information`, `prepare_checkout`, `create_checkout_session`, `get_order_status`, `get_order_history`, `cancel_order`).
  - Seamless fallback to a deterministic semantic intent router when API keys are absent.
  - Zero hallucination guarantee: The database remains the sole source of truth for dish names, prices, allergens, and inventory.
- **Financial Rigor & Integer Math**:
  - 100% of calculations performed in integer minor units (cents). Zero floating-point rounding errors.
  - Accurate 8.25% tax ($825$ basis points), packaging fees, and delivery fees.
- **Multi-Fulfillment Modes**:
  - **Dine-In**: Select table number for live in-restaurant ordering.
  - **Pickup**: Schedule curbside or counter takeaway.
  - **Delivery**: Address verification and real-time courier tracking.
- **Order Lifecycle & Real-Time Tracking**:
  - Strict finite state machine: `PENDING_PAYMENT` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `OUT_FOR_DELIVERY` / `COMPLETED`.
  - Live timeline with auto-polling every 15 seconds.
  - One-click order cancellation with automated refund eligibility checks.
- **Staff Operations Dashboard (`/staff`)**:
  - Kitchen Kanban board with 4 workflow columns and 10s auto-refresh.
  - Dish 86 availability toggle by category.
  - Secured via HTTP-only passkey authentication.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 15 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 3, Custom Editorial Design System |
| **Database** | SQLite via Prisma ORM 6 (19 relational models) |
| **Voice AI** | ElevenLabs SDK (`@11labs/client`), WebAudio API (FFT Analyser) |
| **AI Engine** | Google Generative AI (`@google/generative-ai`), Gemini 2.0 Flash |
| **Payments** | Stripe Checkout (`@stripe/stripe-js`, `stripe`), Sandbox simulation |
| **Validation** | Zod 3 (runtime schema validation) |
| **Testing** | Vitest 3 (unit & integration), Playwright 1.50 (E2E) |

---

## Quick Start Guide

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-org/echo-restaurant.git
cd echo-restaurant
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Restaurant Business Settings
RESTAURANT_BASE_CURRENCY="USD"
RESTAURANT_TAX_RATE_BPS=825

# Staff Operations
STAFF_PASSWORD="echo-hearth-pass"

# AI Concierge (Optional: Graceful fallback active if omitted)
GOOGLE_GENERATIVE_AI_API_KEY=""
AI_MODEL="gemini-2.0-flash"

# ElevenLabs Voice AI (Optional: Web Speech API active if omitted)
ELEVENLABS_API_KEY=""
ELEVENLABS_AGENT_ID=""
ELEVENLABS_VOICE_ID="sXSV9RZ095VZyL64w3ap"

# Stripe Payments (Optional: Instant zero-credential sandbox active if omitted)
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

### 3. Initialize Database & Seed Menu Data

```bash
npx prisma db push
npm run db:seed
```

This seeds 8 curated categories, 8 signature hearth dishes with full translations in English, Hindi, Telugu, Spanish, and French, variants, customization groups, and verified allergen profiles.

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to experience the restaurant.

---

## Exploration & Route Sitemap

- `/` — Editorial Homepage with cinematic hero, culinary philosophy, featured dishes, and dining room ambience.
- `/menu` — Searchable menu catalog with category navigation, dietary filters (Vegan, Vegetarian, Gluten-Free), spice levels (0–3), and dish detail modals.
- `/checkout` — Multi-fulfillment checkout (Table, Pickup, Delivery) with Stripe Checkout or instant sandbox simulation.
- `/orders/[orderRef]` — Live order confirmation & fulfillment tracking timeline with auto-polling.
- `/staff` — Staff operations portal:
  - Default Passkey: `echo-hearth-pass`
  - `/staff/orders`: Live Kitchen Kanban board.
  - `/staff/menu`: Dish 86 availability toggle.
- `/api/concierge/chat` — AI Concierge text & tool-calling endpoint.
- `/api/voice/session` — ElevenLabs voice session & signed URL handshake.
- `/api/voice/tts` — ElevenLabs multilingual text-to-speech audio endpoint.

---

## Automated Verification & Testing

Run unit & integration tests:

```bash
npm test
```

> **Test Suite**: 55 tests across 12 test files covering menu filters, pricing engine, integer arithmetic, order state machine, session isolation, 14-tool concierge pipeline, WebAudio FFT analyser, and webhook idempotency.

Run Next.js production build:

```bash
npm run build
```

Run Playwright E2E tests:

```bash
npm run test:e2e
```

---

## Architectural Documentation

For the comprehensive domain model, ERD diagrams, tool-calling pipelines, and finite state machine transitions, refer to [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## License

Private & Proprietary — ECHO Restaurant & Culinary Group. All rights reserved.
