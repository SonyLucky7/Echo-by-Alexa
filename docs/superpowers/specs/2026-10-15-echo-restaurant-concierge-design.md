# ECHO — Premium Restaurant Website with Multilingual AI Dining Concierge

## Design Specification

**Date**: 2026-10-15
**Status**: Approved
**Project**: ECHO
**Path**: Architectural

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Architecture & Technology Stack](#2-architecture--technology-stack)
3. [Domain Data Model](#3-domain-data-model)
4. [Shared Tool Registry & AI Orchestration](#4-shared-tool-registry--ai-orchestration)
5. [ElevenLabs Voice Integration & Multilingual Experience](#5-elevenlabs-voice-integration--multilingual-experience)
6. [Frontend Design & Editorial UX](#6-frontend-design--editorial-ux)
7. [Cart, Checkout & Order Lifecycle](#7-cart-checkout--order-lifecycle)
8. [Payments, Currency & Security](#8-payments-currency--security)
9. [Staff Operations Dashboard](#9-staff-operations-dashboard)
10. [Testing Strategy](#10-testing-strategy)
11. [Environment & Configuration](#11-environment--configuration)
12. [Implementation Phases](#12-implementation-phases)

---

## 1. Product Vision

ECHO is a premium restaurant website where customers can explore a curated menu, describe what they want to eat, receive personalized recommendations, customize dishes, place orders, make payments, and track their orders.

Customers interact through three synchronized channels:

1. **Traditional visual navigation** — touch/click browsing, filters, and forms.
2. **Text-based AI conversation** — natural language chat concierge.
3. **ElevenLabs-powered multilingual voice conversation** — real-time voice ordering.

All three share the same session, cart, backend services, pricing rules, and order records.

### Core Principles

- The AI understands the customer and determines the appropriate action. The backend validates and executes it.
- The database is the source of truth. The AI never invents menu items, prices, availability, or order statuses.
- All customer-facing content is professional restaurant content. No references to hackathons, prototypes, or development internals.

### Culinary Identity

**Progressive Global Hearth & Botanicals** — open-fire cooking, heirloom grains, wild aromatics, and fine-dining seasonal plates. Accommodates diverse vegetarian, vegan, and global palate preferences across English, Hindi, Telugu, Spanish, and French.

### Fulfillment Channels

- **Dine-In**: Table service with table number and seat information.
- **Curbside / Counter Pickup**: Scheduled pickup with vehicle/contact notes.
- **Direct Local Delivery**: Address verification with delivery zone rules.

---

## 2. Architecture & Technology Stack

### Approach: Unified Next.js Full-Stack

A single Next.js application serving both the premium editorial frontend and all API route handlers. No separate microservices.

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript (strict) |
| Styling | Tailwind CSS 4 with custom design tokens |
| Component System | Radix UI primitives + custom ECHO design system |
| Database | Prisma ORM — SQLite (local dev/test), PostgreSQL/Supabase (production) |
| AI / LLM | Configurable provider (Google Gemini / OpenAI) with native tool calling |
| Voice | ElevenLabs Conversational AI SDK + Web Speech API fallback |
| Payments | Stripe Checkout (hosted) + sandbox simulation |
| Validation | Zod schemas for all inputs and tool arguments |
| Testing | Vitest (unit/integration), Playwright (E2E) |
| Auth | Cookie-based guest sessions + optional Supabase Auth for accounts |

### Key Architectural Decisions

- **Prisma multi-provider**: SQLite requires zero credentials for immediate local execution. Production deploys against PostgreSQL via `DATABASE_URL`.
- **Integer minor-unit currency**: All monetary values stored as integers (e.g., `$12.50` = `1250`). Zero floating-point arithmetic.
- **Server-only secrets**: All API keys accessed via `process.env` in Route Handlers. Never bundled into client JavaScript.
- **Unified tool registry**: A single TypeScript module (`@/lib/concierge/tools/`) defines all 14 tools. Both the text chat API and voice webhook invoke the same validated functions.

---

## 3. Domain Data Model

### Entity Relationship Overview

```
RestaurantSettings (singleton)
├── MenuCategory (1:N)
│   └── MenuItem (1:N)
│       ├── MenuItemTranslation (1:N per language)
│       ├── MenuItemVariant (1:N — sizes/portions)
│       ├── MenuItemAllergen (1:N)
│       └── CustomizationGroup (1:N)
│           └── CustomizationOption (1:N)
├── GuestSession (1:N)
│   └── Cart (1:1)
│       └── CartItem (1:N)
│           └── CartItemCustomization (1:N)
├── Profile (1:N — authenticated users)
│   └── Cart (1:1)
├── Order (1:N)
│   ├── OrderItem (1:N)
│   ├── Payment (1:1)
│   └── OrderStatusEvent (1:N — state history)
└── Conversation (1:N)
    └── ConversationMessage (1:N)
```

### Key Entities

#### RestaurantSettings
- `name`: "ECHO"
- `tagline`: "Wild Botanicals & Open Hearth Gastronomy"
- `base_currency`: ISO 4217 code (default `USD`)
- `tax_rate_bps`: Tax rate in basis points (e.g., 825 = 8.25%)
- `delivery_fee_minor`: Delivery fee in minor units
- `packaging_fee_minor`: Packaging fee in minor units
- `fulfillment_modes`: JSON array of enabled modes (`DINE_IN`, `PICKUP`, `DELIVERY`)
- `opening_hours`: JSON schedule
- `address`, `phone`, `email`
- `delivery_zones`: JSON array of supported zones with radius/polygon rules

#### MenuItem
- `id`: UUID
- `category_id`: FK to MenuCategory
- `slug`: URL-safe identifier
- `name`: Canonical English name
- `description`: Canonical English description
- `base_price_minor`: Integer minor units
- `spice_level`: 0–3
- `cooking_technique`: Enum (`HEARTH_FIRE`, `SLOW_FERMENTED`, `COLD_SMOKE`, `RAW`, `WOOD_ROASTED`, `STONE_GROUND`)
- `dietary_flags`: Array of enums (`VEGETARIAN`, `VEGAN`, `GLUTEN_FREE`, `DAIRY_FREE`, `NUT_FREE`, `HALAL`)
- `prep_time_minutes`: Estimated preparation time
- `is_available`: Boolean availability toggle
- `is_featured`: Boolean
- `is_signature`: Boolean
- `image_url`: Path to high-quality food photograph
- `sort_order`: Display ordering within category

#### MenuItemTranslation
- `item_id`: FK to MenuItem
- `locale`: Language code (`en`, `hi`, `te`, `es`, `fr`)
- `name`: Translated dish name
- `description`: Translated description
- `ingredients_text`: Translated ingredient list

#### MenuItemVariant
- `id`: UUID
- `item_id`: FK to MenuItem
- `name`: Variant label (e.g., "Small Plate", "Full Portion", "Family Style")
- `price_minor`: Absolute price in minor units for this variant
- `is_default`: Boolean

#### CustomizationGroup
- `id`: UUID
- `item_id`: FK to MenuItem
- `name`: Group label (e.g., "Spice Level", "Extra Botanicals", "Remove Ingredients")
- `min_selections`: Minimum required (0 for optional)
- `max_selections`: Maximum allowed
- `is_required`: Boolean

#### CustomizationOption
- `id`: UUID
- `group_id`: FK to CustomizationGroup
- `name`: Option label (e.g., "Extra Aged Parmesan", "No Cilantro")
- `price_delta_minor`: Additive price adjustment in minor units (can be 0 or negative for removals)
- `is_available`: Boolean

#### Cart & CartItem
- Cart keyed by `guest_session_id` (guests) or `profile_id` (authenticated)
- CartItem stores `item_id`, `variant_id`, `quantity`, and JSON `customizations` array
- All prices recalculated from source on every read — never cached stale

#### Order
- `id`: UUID
- `order_ref`: Human-readable reference (e.g., `ECHO-4821`)
- `session_id` or `profile_id`: Owner
- `fulfillment_mode`: `DINE_IN` | `PICKUP` | `DELIVERY`
- `fulfillment_details`: JSON (table number, pickup time, delivery address)
- `subtotal_minor`, `tax_minor`, `delivery_fee_minor`, `packaging_fee_minor`, `total_minor`: All integers
- `currency`: ISO 4217
- `payment_status`: `PENDING` | `PAID` | `FAILED` | `REFUNDED`
- `fulfillment_status`: `PENDING_PAYMENT` | `CONFIRMED` | `ACCEPTED` | `PREPARING` | `READY` | `OUT_FOR_DELIVERY` | `COMPLETED` | `CANCELLED`
- `created_at`, `updated_at`

#### OrderItem
- Immutable snapshot: `item_name`, `variant_name`, `customizations_snapshot` (JSON), `quantity`, `unit_price_minor`, `total_price_minor`

#### OrderStatusEvent
- `order_id`, `status`, `changed_by` (staff ID or system), `note`, `created_at`
- Append-only audit trail

#### Payment
- `order_id`: FK
- `provider`: `STRIPE` | `SANDBOX`
- `provider_session_id`: Stripe checkout session ID
- `provider_payment_id`: Stripe payment intent ID
- `amount_minor`, `currency`
- `status`: `PENDING` | `SUCCEEDED` | `FAILED` | `REFUNDED`
- `webhook_event_id`: For idempotency deduplication

### Database Requirements
- Stable UUIDs as primary keys
- Foreign keys with cascading rules
- Indexes on: `menu_items.category_id`, `menu_items.is_available`, `cart_items.cart_id`, `orders.session_id`, `orders.order_ref`, `order_status_events.order_id`
- Unique constraints: `order_ref`, `payment.webhook_event_id`
- Reproducible seed script with realistic menu data across all 5 languages

---

## 4. Shared Tool Registry & AI Orchestration

### Tool Architecture

All 14 tools live in `@/lib/concierge/tools/`. Each tool exports:
- A Zod input schema
- A Zod output schema
- An async executor function accepting validated input + session context
- A natural-language description for the LLM

Both `/api/concierge/chat` (text) and `/api/voice/tools` (ElevenLabs webhook) invoke the same executor functions.

### Tool Definitions

#### Tool 1: `browse_menu`
- **Inputs**: `query?`, `category?`, `dietary_flags?[]`, `spice_level_max?`, `price_max_minor?`, `locale?`
- **Behavior**: Queries MenuItem records with filters. Returns array of `{id, name, description, price_minor, image_url, dietary_flags, spice_level, is_available}`. Respects `is_available: true`. Returns translated content when `locale` is provided.

#### Tool 2: `get_item_details`
- **Inputs**: `item_id`, `locale?`
- **Behavior**: Returns full item with variants, customization groups/options, allergens, ingredients, and translated content. Never invents missing data.

#### Tool 3: `recommend_items`
- **Inputs**: `preferences?` (free text), `dietary_restrictions?[]`, `exclude_allergens?[]`, `cart_item_ids?[]`, `max_results?`
- **Behavior**: Filters menu by dietary and allergen constraints, ranks by relevance to preferences, and avoids items already in cart. Explains recommendations using verified attributes only.

#### Tool 4: `customize_item`
- **Inputs**: `item_id`, `variant_id?`, `customizations: [{group_id, option_ids[]}]`, `quantity`
- **Behavior**: Validates variant belongs to item. Validates each option belongs to group. Enforces min/max selection constraints. Calculates total price using `variant.price_minor + sum(option.price_delta_minor)`. Returns validated configuration with computed price.

#### Tool 5: `add_to_cart`
- **Inputs**: `item_id`, `variant_id`, `customizations`, `quantity`, `session_context`
- **Behavior**: Validates session ownership. Checks `is_available`. Runs customize_item validation internally. Creates CartItem. Returns updated cart summary.

#### Tool 6: `view_cart`
- **Inputs**: `session_context`
- **Behavior**: Returns authoritative cart with line items (name, variant, customizations, quantity, line_total_minor), subtotal, tax, fees, and grand total. All calculated from current database prices.

#### Tool 7: `update_cart_item`
- **Inputs**: `cart_item_id`, `quantity?`, `variant_id?`, `customizations?`, `session_context`
- **Behavior**: Validates ownership. Revalidates options. Recalculates pricing. Returns updated cart.

#### Tool 8: `remove_from_cart`
- **Inputs**: `cart_item_id`, `session_context`
- **Behavior**: Validates ownership and existence. Removes line. Returns updated cart.

#### Tool 9: `get_restaurant_information`
- **Inputs**: `locale?`
- **Behavior**: Returns restaurant name, address, phone, email, opening hours, fulfillment modes, delivery zones, and policies.

#### Tool 10: `prepare_checkout`
- **Inputs**: `fulfillment_mode`, `fulfillment_details`, `session_context`
- **Behavior**: Validates cart is non-empty. Rechecks all items are available. Recalculates prices. Validates delivery address against zones (if delivery). Returns complete checkout summary with `{items, subtotal, tax, fees, total, currency, missing_fields[]}`.

#### Tool 11: `create_checkout_session`
- **Inputs**: `fulfillment_mode`, `fulfillment_details`, `customer_name`, `customer_phone?`, `customer_email?`, `session_context`
- **Behavior**: Runs prepare_checkout validation. Creates pending Order record. Creates Stripe Checkout session (or sandbox session). Returns `{order_ref, checkout_url}`. Prevents duplicate creation with idempotency key.

#### Tool 12: `get_order_status`
- **Inputs**: `order_ref`, `session_context`
- **Behavior**: Verifies session owns the order. Returns `{order_ref, items, payment_status, fulfillment_status, status_history[], fulfillment_details, created_at}`.

#### Tool 13: `get_order_history`
- **Inputs**: `session_context`
- **Behavior**: Returns array of customer's orders with refs, dates, totals, and current statuses.

#### Tool 14: `cancel_order`
- **Inputs**: `order_ref`, `confirmation: true`, `session_context`
- **Behavior**: Verifies ownership. Checks order is in a cancellable state (`CONFIRMED` or `ACCEPTED` only). Requires explicit `confirmation: true`. Transitions to `CANCELLED`. Initiates Stripe refund if payment was completed. Returns result.

### Conversational Context Strategy

- **Session Memory**: In-memory store (per session ID) tracking:
  - Preferred language
  - Stated dietary preferences and dislikes
  - Previously discussed dishes
  - Current ordering stage
- **Window Strategy**: Last 20 messages sent to LLM, with a system summary of accumulated preferences prepended.
- **Reset**: Customer can say "start over" to clear conversation context.
- **Isolation**: Guest sessions are fully isolated. No cross-session leakage.
- **Truth Source**: Cart contents, prices, and order status are always fetched fresh from the database — never recalled from conversation history.

---

## 5. ElevenLabs Voice Integration & Multilingual Experience

### Voice Configuration

- **Voice ID**: `sXSV9RZ095VZyL64w3ap` ("Alexa" — soft, natural, warm Brazilian female voice)
- **SDK**: ElevenLabs Conversational AI Web SDK (`@11labs/react` or `@11labs/client`)
- **Connection**: Server-generated signed URL from `/api/voice/session` endpoint

### Language Support

| Language | Code | Status |
|---|---|---|
| English | `en` | Primary |
| Hindi | `hi` | Supported |
| Telugu | `te` | Supported |
| Spanish | `es` | Supported |
| French | `fr` | Supported |

- Language selection via UI dropdown or voice command ("Switch to Hindi")
- If switching languages requires agent reconfiguration or reconnection, the system handles it transparently with a brief transition indicator
- Language preference persisted in session for continuity

### Audio State Machine

```
           ┌──────────┐
     ┌────►│   IDLE   │◄────────────────────┐
     │     └────┬─────┘                     │
     │          │ user clicks mic           │
     │     ┌────▼──────┐                    │
     │     │CONNECTING │───error───►┌───────┴──┐
     │     └────┬──────┘            │  ERROR   │
     │          │ connected         └──────────┘
     │     ┌────▼──────┐                 ▲
     │     │ LISTENING  │───error────────┘
     │     └────┬──────┘
     │          │ speech detected
     │     ┌────▼───────┐
     │     │ PROCESSING │
     │     └────┬───────┘
     │          │ response ready
     │     ┌────▼──────┐
     │     │ SPEAKING  │──interrupt──┐
     │     └────┬──────┘             │
     │          │ finished           │
     └──────────┴────────────────────┘
```

### Real WebAudio Visualization

- `AudioContext` + `AnalyserNode` on the microphone stream
- `getByteFrequencyData()` drives the waveform/orb visualization
- **Flatline when idle or muted** — never animate a fake waveform
- Smooth CSS/Canvas transitions between states

### Security

- `ELEVENLABS_API_KEY` stored server-side only
- `/api/voice/session` generates ephemeral signed connection URLs
- Rate limiting on session creation (e.g., 10 sessions per IP per hour)
- All tool calls from voice go through the same server-side validation as text

### Graceful Fallback

When `ELEVENLABS_API_KEY` is not configured:
- Voice button shows "Text Chat" label instead
- Web Speech API (`SpeechRecognition` + `SpeechSynthesis`) provides basic voice I/O
- Same 14-tool execution pipeline operates identically
- No fake "connecting to voice service" states

---

## 6. Frontend Design & Editorial UX

### Brand Identity

- **Name**: ECHO
- **Tagline**: "Wild Botanicals & Open Hearth Gastronomy"
- **Palette**:
  - Warm ivory: `#FAF7F2`
  - Deep charcoal: `#161616`
  - Organic olive: `#414A3E`
  - Hearth ember accent: `#C58F58`
  - Soft sage: `#8B9D83` (secondary)
  - Cream: `#F5F0E8`
- **Typography**:
  - Headlines: `Playfair Display` or `Cormorant Garamond` (editorial serif)
  - Body/UI: `Plus Jakarta Sans` or `Inter` (geometric sans)
- **Design Characteristics**:
  - Generous whitespace and editorial rhythm
  - Asymmetric layouts (not repetitive card grids)
  - Large composed food photography
  - Subtle borders, controlled shadows, tasteful rounded corners
  - Discreet micro-interactions (hover lifts, smooth page transitions)

### Page Architecture

#### Homepage (`/`)
1. Premium sticky navigation with ECHO wordmark and cart indicator
2. Cinematic hero: full-bleed food photography, headline "Wild Botanicals & Open Hearth Gastronomy"
3. Primary CTA: "Explore Our Menu" / Secondary CTA: "Speak with Alexa"
4. Featured signature dishes (editorial 2-3 item showcase, not a grid)
5. Menu category navigation tiles
6. Culinary philosophy section ("Our Hearth" — story of open-fire cooking)
7. Seasonal botanical ingredients spotlight
8. Dining ambience gallery
9. Opening hours and location with embedded map
10. Fulfillment information (Dine-in, Pickup, Delivery)
11. Premium footer with contact, policies, and social links

#### Menu Page (`/menu`)
- Sticky category sidebar (desktop) / horizontal scroll tabs (mobile)
- Search bar with instant results
- Filter panel: dietary flags, spice level slider, price range
- Sort: recommended, price low-high, price high-low, newest
- Responsive item cards: image, name, price, dietary badges, availability indicator
- Click/tap opens dish detail modal

#### Dish Detail (Modal or `/menu/[slug]`)
- Large hero image
- Name, description, ingredients
- Dietary labels and allergen badges
- Variant selector (e.g., portion size)
- Customization groups with checkboxes/radio buttons enforcing min/max
- Live price calculation
- Quantity selector
- "Add to Cart" button
- Related dishes carousel

#### AI Concierge Panel
- Accessible from a persistent floating button (bottom-right)
- Slides in as a right-side drawer (desktop) or bottom sheet (mobile)
- Text input with send button
- Voice toggle (mic button with state visualization)
- Language selector dropdown
- Message bubbles with typing indicator
- Tool result cards (dish recommendations, cart summary)
- Does not obscure essential page actions

### Responsive Breakpoints
- Mobile: < 640px — single column, bottom sheet concierge, hamburger nav
- Tablet: 640–1024px — two-column menu grid, side drawer concierge
- Desktop: > 1024px — editorial layouts, persistent sidebar filters, right-panel concierge

### Accessibility
- Semantic HTML (`nav`, `main`, `article`, `section`, `aside`)
- Keyboard navigation with visible focus rings
- ARIA labels for voice controls and state announcements
- Color contrast ≥ 4.5:1 for text, ≥ 3:1 for large text
- `prefers-reduced-motion` support — disables animations
- Screen reader announcements for cart changes and order status updates

---

## 7. Cart, Checkout & Order Lifecycle

### Cart Implementation
- Single authoritative cart per session (guest) or profile (authenticated)
- CartItem stores: `item_id`, `variant_id`, `quantity`, `customizations` (JSON array of `{group_id, option_id}`)
- **Price recalculation on every read**: line totals computed from current `variant.price_minor + sum(customization.price_delta_minor) * quantity`
- Cart drawer accessible from any page via header icon
- Displays: item image, name, variant, customizations, quantity controls, line price, remove button
- Footer: subtotal, tax, fees, total, "Proceed to Checkout" button

### Checkout Flow (`/checkout`)
1. **Fulfillment Selection**: Dine-In / Pickup / Delivery radio buttons
2. **Fulfillment Details**:
   - Dine-In: Table number input, optional server notes
   - Pickup: Preferred time selector, name, phone
   - Delivery: Address fields, delivery instructions, phone
3. **Delivery Zone Validation**: If delivery, server checks address against configured zones
4. **Cart Verification**: Server rechecks availability and recalculates totals
5. **Order Summary**: Itemized breakdown with subtotal, tax, fees, total in display currency
6. **"Place Order" Button**: Creates pending order → redirects to Stripe Checkout (or executes sandbox flow)
7. **Payment Result**: Success URL loads `/orders/[orderRef]` showing persisted confirmation

### Order State Machine

```
PENDING_PAYMENT ──paid──► CONFIRMED ──accepted──► ACCEPTED
                                                      │
                                              ┌───────▼───────┐
                                              │   PREPARING   │
                                              └───────┬───────┘
                                          ┌───────────┼───────────┐
                                     (pickup)    (dine-in)   (delivery)
                                          │           │           │
                                     ┌────▼────┐ ┌───▼────┐ ┌───▼──────────┐
                                     │  READY  │ │ READY  │ │OUT_FOR_DELIVERY│
                                     └────┬────┘ └───┬────┘ └───┬──────────┘
                                          │          │           │
                                          └──────────┼───────────┘
                                              ┌──────▼──────┐
                                              │  COMPLETED  │
                                              └─────────────┘

Any state before PREPARING ──cancel──► CANCELLED
PAID + CANCELLED ──refund──► REFUNDED (payment status)
```

- State transitions enforced on the server
- Each transition creates an `OrderStatusEvent` record
- Invalid transitions return structured error

### Order Tracking (`/orders/[orderRef]`)
- Unique reference displayed prominently (e.g., `ECHO-4821`)
- Visual timeline showing completed and current status
- Item list with modifications
- Payment status badge
- Fulfillment details (table, pickup time, delivery address)
- Estimated prep time when available
- Restaurant contact details
- Auto-refresh via polling (30-second interval)

---

## 8. Payments, Currency & Security

### Stripe Checkout Integration

1. Server validates cart: rechecks availability, recalculates prices
2. Creates `Order` record with `payment_status: PENDING`
3. Calls `stripe.checkout.sessions.create()` with:
   - `line_items`: Each cart item as a line with name, unit_amount, quantity
   - `currency`: Restaurant's base currency
   - `success_url`: `/orders/{order_ref}?status=success`
   - `cancel_url`: `/checkout?status=cancelled`
   - `metadata`: `{order_id, order_ref}`
   - `client_reference_id`: order ID
4. Returns checkout URL → frontend redirects
5. Stripe webhook `checkout.session.completed`:
   - Verify `stripe.webhooks.constructEvent()` signature
   - Check `webhook_event_id` for deduplication
   - Update `payment.status` → `SUCCEEDED`
   - Transition order `fulfillment_status` → `CONFIRMED`
6. Success URL page loads persisted order data (not URL params)

### Sandbox Mode
When `STRIPE_SECRET_KEY` is not configured:
- Checkout page shows `[SANDBOX MODE]` badge
- "Complete Order" immediately creates the order as `PAID`
- Clear messaging that no real charge occurs
- Useful for development and demonstration

### Currency Handling
- `base_currency` from RestaurantSettings (e.g., `USD`)
- All prices stored in minor units for the base currency
- `Intl.NumberFormat` for locale-aware display
- If multi-currency display is added later:
  - Exchange rates sourced from a documented provider
  - Rates cached with explicit TTL
  - Customer sees "Prices shown in USD. You will be charged in USD."
  - No misleading converted amounts

### Security Boundaries
- **Server-only env vars**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ELEVENLABS_API_KEY`, `DATABASE_URL`, LLM API keys
- **Client-safe env vars**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_URL`
- **Session isolation**: HTTP-only cookies for guest sessions; no cross-session cart access
- **Tool authorization**: Every tool executor receives `session_context` and validates ownership before mutations
- **Webhook idempotency**: `payment.webhook_event_id` unique constraint prevents duplicate processing
- **Input validation**: All API route inputs validated with Zod; malformed requests return 400 with structured errors
- **No raw cards**: Stripe Checkout is hosted; no card data touches our servers
- **No raw stack traces**: Errors logged server-side; customers see friendly messages
- **Rate limiting**: Voice session creation, checkout creation, and AI chat endpoints rate-limited per session/IP

---

## 9. Staff Operations Dashboard

### Access Control
- Protected route group: `/staff/*`
- Server-side role check on every request
- Initial implementation: simple password-based staff auth via environment variable (`STAFF_PASSWORD`)
- Future: Supabase Auth with `role: staff` claim

### Dashboard Features

#### Order Queue (`/staff/orders`)
- Kanban-style columns: Confirmed → Preparing → Ready / Out for Delivery → Completed
- Each order card shows: order ref, items summary, fulfillment mode, time elapsed
- Click to expand full order details with customizations
- Action buttons to advance order state (e.g., "Start Preparing", "Mark Ready")
- Auto-refresh via polling

#### Menu Availability (`/staff/menu`)
- List of all menu items with availability toggles
- "Mark Sold Out" / "Mark Available" instant toggle
- Changes immediately reflected on customer-facing menu and AI tool queries

#### Order History (`/staff/orders/history`)
- Searchable list of past orders
- Filter by date range, status, fulfillment mode

---

## 10. Testing Strategy

### Unit Tests (Vitest)
- Currency formatting across USD, INR, EUR, GBP
- Minor-unit conversion and arithmetic
- Cart calculations: add items, update quantities, apply tax, apply fees
- Order state machine: valid transitions accepted, invalid rejected with specific error
- Customization validation: min/max group constraints enforced, unsupported modifiers rejected
- Dietary filter logic and menu search relevance ranking
- Session isolation: verify cart access restricted to owner

### Integration Tests (Vitest)
- Database-backed menu retrieval with seeded data
- Tool execution pipeline: `browse_menu` → `get_item_details` → `customize_item` → `add_to_cart` → `view_cart` → `prepare_checkout`
- Session isolation: two independent sessions cannot access each other's carts or orders
- Checkout creation with order record persistence
- Webhook signature verification (valid and invalid signatures)
- Idempotent payment processing (same webhook event processed twice yields same result)
- Unauthorized order access returns 403
- Unavailable item rejection at add-to-cart and checkout

### E2E Tests (Playwright)
- **Full Visual Journey**: Homepage → Menu → Filter by dietary flag → Select dish → Customize → Add to cart → View cart → Checkout → (Sandbox) Payment → Order confirmation → Order tracking page
- **Text Concierge Journey**: Open concierge → Ask "What's good for a vegetarian?" → Receive recommendations → Say "Add the first one" → Verify cart updated → Ask "How much is everything?" → Verify total matches
- **Voice Concierge** (when configured): Mic permission → Voice request → Tool execution → Cart sync verification
- **Staff Dashboard**: Login → View incoming order → Advance to "Preparing" → Advance to "Ready" → Verify customer tracking page updates

---

## 11. Environment & Configuration

### `.env.example`

```env
# ─── Database ───
DATABASE_URL="file:./dev.db"
# For production PostgreSQL:
# DATABASE_URL="postgresql://user:password@host:5432/echo?schema=public"

# ─── Application ───
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# ─── AI / LLM Provider ───
# Google Gemini (recommended):
GOOGLE_GENERATIVE_AI_API_KEY=""
AI_MODEL="gemini-2.0-flash"
# Or OpenAI:
# OPENAI_API_KEY=""
# AI_MODEL="gpt-4o-mini"

# ─── ElevenLabs Voice ───
ELEVENLABS_API_KEY=""
ELEVENLABS_AGENT_ID=""
ELEVENLABS_VOICE_ID="sXSV9RZ095VZyL64w3ap"

# ─── Stripe Payments ───
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# ─── Restaurant Configuration ───
RESTAURANT_BASE_CURRENCY="USD"
RESTAURANT_TAX_RATE_BPS="825"

# ─── Staff Dashboard ───
STAFF_PASSWORD=""

# ─── Optional ───
# SUPABASE_URL=""
# SUPABASE_ANON_KEY=""
# SUPABASE_SERVICE_ROLE_KEY=""
```

### Startup Validation
- Application checks for required env vars at startup
- Missing `DATABASE_URL` → clear error with setup instructions
- Missing `GOOGLE_GENERATIVE_AI_API_KEY` and `OPENAI_API_KEY` → AI concierge disabled with message
- Missing `ELEVENLABS_API_KEY` → voice falls back to Web Speech with UI indicator
- Missing `STRIPE_SECRET_KEY` → checkout operates in sandbox mode with `[SANDBOX]` badge
- All warnings logged to console, never shown to customers

---

## 12. Implementation Phases

### Phase 1: Foundation (Database, Design System, Navigation)
- Initialize Next.js project with TypeScript, Tailwind, Prisma
- Create design token system (colors, typography, spacing, components)
- Implement Prisma schema with all entities
- Create migration and seed script with realistic menu data (40+ items across 8 categories, all 5 languages)
- Build responsive navigation, layout shell, and footer

### Phase 2: Menu & Dish Experience
- Homepage with hero, featured dishes, philosophy sections
- Menu page with search, filters, category navigation
- Dish detail modal/page with variants and customization UI
- Restaurant information pages (story, location, hours, policies)

### Phase 3: Cart & Ordering Logic
- Shared business logic layer for pricing, validation, availability
- Cart API routes and frontend cart drawer
- Guest session management
- Add/update/remove cart operations with server-side validation

### Phase 4: AI Text Concierge
- Configure LLM provider with tool calling
- Implement all 14 tool executors
- Build concierge chat panel UI
- Implement conversation context and memory strategy
- Error handling and text fallback

### Phase 5: ElevenLabs Voice Integration
- Server-side signed URL generation
- ElevenLabs Conversational AI SDK integration
- Audio state machine and WebAudio visualization
- Language selection and switching
- Web Speech API fallback
- Voice-to-tool bridging

### Phase 6: Checkout & Payments
- Checkout page with fulfillment selection
- Stripe Checkout session creation
- Webhook handler with signature verification and idempotency
- Sandbox checkout flow
- Order creation and persistence

### Phase 7: Order Tracking & Staff Operations
- Order confirmation page
- Order tracking with status timeline
- Staff dashboard with order queue and menu management
- Order state transition controls

### Phase 8: Polish & Testing
- Responsive refinement across all breakpoints
- Accessibility audit and fixes
- SEO metadata, structured data, sitemap
- Loading, error, empty, and success states
- Image optimization and performance
- Write and run unit, integration, and E2E tests
- Fix all discovered issues

### Phase 9: Verification & Documentation
- Production build verification
- Type checking and linting pass
- Full E2E journey test execution
- README with setup instructions
- Architecture documentation
- Outstanding prerequisites documented
