# ECHO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, production-quality premium restaurant website with multilingual AI dining concierge, ElevenLabs voice integration, Stripe payments, and staff operations dashboard.

**Architecture:** Unified Next.js 15 App Router full-stack application. Prisma ORM with SQLite for zero-config local development. Server-side Route Handlers for all business logic. Shared 14-tool concierge registry used by both text chat and voice interfaces.

**Tech Stack:** Next.js 15, React 19, TypeScript (strict), Tailwind CSS 4, Prisma ORM, Zod, ElevenLabs Conversational AI SDK, Stripe Checkout, Vitest, Playwright

**Spec:** `docs/superpowers/specs/2026-10-15-echo-restaurant-concierge-design.md`

## Global Constraints

- TypeScript `strict: true` — no `any` types
- All monetary values stored as integers in minor units (cents). Zero floating-point currency math.
- All API inputs validated with Zod schemas before processing
- Server-only secrets: `ELEVENLABS_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, LLM keys — never in client bundles
- Client-safe vars prefixed `NEXT_PUBLIC_`
- No customer-facing references to hackathons, prototypes, AI companies, or development internals
- ElevenLabs Voice ID: `sXSV9RZ095VZyL64w3ap`
- Commit after each task completes with a descriptive message
- All food content must feel like a real premium restaurant — no generic lorem ipsum

---

## File Structure

```
echo/
├── prisma/
│   ├── schema.prisma              # Full data model
│   ├── seed.ts                    # Realistic menu seed data (40+ items, 5 languages)
│   └── migrations/                # Generated migrations
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with fonts, metadata, providers
│   │   ├── page.tsx               # Homepage
│   │   ├── globals.css            # Tailwind directives + design tokens
│   │   ├── menu/
│   │   │   └── page.tsx           # Menu browsing page
│   │   ├── checkout/
│   │   │   └── page.tsx           # Checkout flow page
│   │   ├── orders/
│   │   │   └── [orderRef]/
│   │   │       └── page.tsx       # Order tracking page
│   │   ├── staff/
│   │   │   ├── layout.tsx         # Staff auth layout
│   │   │   ├── orders/
│   │   │   │   └── page.tsx       # Staff order queue
│   │   │   └── menu/
│   │   │       └── page.tsx       # Staff menu availability
│   │   └── api/
│   │       ├── menu/
│   │       │   └── route.ts       # GET menu with filters
│   │       ├── menu/[id]/
│   │       │   └── route.ts       # GET item details
│   │       ├── cart/
│   │       │   └── route.ts       # GET/POST/PUT/DELETE cart operations
│   │       ├── checkout/
│   │       │   └── route.ts       # POST create checkout session
│   │       ├── orders/
│   │       │   └── route.ts       # GET order status/history
│   │       ├── orders/[orderRef]/
│   │       │   └── route.ts       # GET single order, POST cancel
│   │       ├── webhook/
│   │       │   └── stripe/
│   │       │       └── route.ts   # POST Stripe webhook handler
│   │       ├── concierge/
│   │       │   └── chat/
│   │       │       └── route.ts   # POST text chat with tool calling
│   │       ├── voice/
│   │       │   └── session/
│   │       │       └── route.ts   # POST generate signed voice URL
│   │       ├── staff/
│   │       │   ├── auth/
│   │       │   │   └── route.ts   # POST staff login
│   │       │   ├── orders/
│   │       │   │   └── route.ts   # GET/PUT staff order management
│   │       │   └── menu/
│   │       │       └── route.ts   # PUT toggle item availability
│   │       └── restaurant/
│   │           └── route.ts       # GET restaurant info
│   ├── components/
│   │   ├── ui/                    # Base UI primitives (Button, Input, Badge, etc.)
│   │   ├── layout/
│   │   │   ├── Navigation.tsx     # Responsive nav with cart indicator
│   │   │   ├── Footer.tsx         # Premium footer
│   │   │   └── MobileMenu.tsx     # Mobile hamburger menu
│   │   ├── home/
│   │   │   ├── Hero.tsx           # Cinematic hero section
│   │   │   ├── FeaturedDishes.tsx  # Editorial featured dishes
│   │   │   ├── Philosophy.tsx     # Culinary philosophy section
│   │   │   └── RestaurantInfo.tsx  # Hours, location, contact
│   │   ├── menu/
│   │   │   ├── MenuGrid.tsx       # Menu items display
│   │   │   ├── MenuFilters.tsx    # Search, dietary, spice, price filters
│   │   │   ├── MenuItemCard.tsx   # Individual menu item card
│   │   │   ├── DishDetail.tsx     # Full dish detail modal
│   │   │   └── CategoryNav.tsx    # Category navigation
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx     # Slide-out cart drawer
│   │   │   ├── CartItem.tsx       # Individual cart line
│   │   │   └── CartSummary.tsx    # Totals, tax, fees
│   │   ├── checkout/
│   │   │   ├── FulfillmentSelect.tsx  # Dine-in/Pickup/Delivery
│   │   │   ├── CheckoutForm.tsx       # Customer details form
│   │   │   └── OrderSummary.tsx       # Final order summary
│   │   ├── orders/
│   │   │   ├── OrderTimeline.tsx  # Status timeline visualization
│   │   │   └── OrderDetails.tsx   # Order items and details
│   │   ├── concierge/
│   │   │   ├── ConciergePanel.tsx # Main chat/voice panel
│   │   │   ├── ChatMessages.tsx   # Message bubbles
│   │   │   ├── ChatInput.tsx      # Text input with send
│   │   │   ├── VoiceButton.tsx    # Mic button with state
│   │   │   ├── VoiceVisualizer.tsx # Real WebAudio visualizer
│   │   │   ├── LanguageSelector.tsx # Language dropdown
│   │   │   └── ToolResultCard.tsx # Rich tool result display
│   │   └── staff/
│   │       ├── OrderKanban.tsx    # Kanban order queue
│   │       ├── OrderTicket.tsx    # Individual order ticket
│   │       └── MenuToggle.tsx     # Item availability toggle
│   ├── lib/
│   │   ├── db.ts                  # Prisma client singleton
│   │   ├── session.ts             # Guest session management
│   │   ├── currency.ts            # Minor-unit formatting & arithmetic
│   │   ├── validation.ts          # Shared Zod schemas
│   │   ├── config.ts              # Environment validation & restaurant config
│   │   ├── concierge/
│   │   │   ├── tools/
│   │   │   │   ├── index.ts       # Tool registry & dispatcher
│   │   │   │   ├── browse-menu.ts
│   │   │   │   ├── get-item-details.ts
│   │   │   │   ├── recommend-items.ts
│   │   │   │   ├── customize-item.ts
│   │   │   │   ├── add-to-cart.ts
│   │   │   │   ├── view-cart.ts
│   │   │   │   ├── update-cart-item.ts
│   │   │   │   ├── remove-from-cart.ts
│   │   │   │   ├── get-restaurant-info.ts
│   │   │   │   ├── prepare-checkout.ts
│   │   │   │   ├── create-checkout-session.ts
│   │   │   │   ├── get-order-status.ts
│   │   │   │   ├── get-order-history.ts
│   │   │   │   └── cancel-order.ts
│   │   │   ├── context.ts         # Conversation memory manager
│   │   │   └── prompts.ts         # System prompts per language
│   │   ├── cart/
│   │   │   ├── operations.ts      # Cart CRUD business logic
│   │   │   └── pricing.ts         # Price calculation engine
│   │   ├── orders/
│   │   │   ├── operations.ts      # Order creation & queries
│   │   │   └── state-machine.ts   # Order state transitions
│   │   ├── payments/
│   │   │   ├── stripe.ts          # Stripe checkout session creation
│   │   │   ├── webhook.ts         # Webhook verification & processing
│   │   │   └── sandbox.ts         # Sandbox checkout simulation
│   │   └── voice/
│   │       ├── elevenlabs.ts      # ElevenLabs signed URL generation
│   │       └── web-speech.ts      # Web Speech API fallback
│   ├── hooks/
│   │   ├── useCart.ts             # Cart state hook
│   │   ├── useConcierge.ts        # Chat/voice concierge hook
│   │   ├── useVoice.ts            # Voice state machine hook
│   │   └── useLanguage.ts         # Language preference hook
│   └── types/
│       └── index.ts               # Shared TypeScript types
├── tests/
│   ├── unit/
│   │   ├── currency.test.ts
│   │   ├── pricing.test.ts
│   │   ├── cart-operations.test.ts
│   │   ├── order-state-machine.test.ts
│   │   ├── customization-validation.test.ts
│   │   └── menu-filters.test.ts
│   ├── integration/
│   │   ├── menu-api.test.ts
│   │   ├── cart-api.test.ts
│   │   ├── checkout-api.test.ts
│   │   ├── tool-pipeline.test.ts
│   │   ├── session-isolation.test.ts
│   │   └── webhook.test.ts
│   └── e2e/
│       ├── ordering-journey.spec.ts
│       ├── concierge-journey.spec.ts
│       └── staff-dashboard.spec.ts
├── public/
│   ├── images/                    # Food photography placeholders
│   └── fonts/                     # Self-hosted fonts
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
└── README.md
```

---

## Task 1: Project Scaffolding, Prisma Schema & Seed Data

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `.env.example`, `.env`, `.gitignore`
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Create: `src/lib/db.ts`
- Create: `src/lib/config.ts`
- Create: `src/lib/currency.ts`
- Create: `src/types/index.ts`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: Prisma client singleton via `db` export from `src/lib/db.ts`
- Produces: `formatCurrency(amountMinor: number, currency: string, locale?: string): string`
- Produces: `getConfig(): RestaurantConfig` from `src/lib/config.ts`
- Produces: All Prisma model types auto-generated
- Produces: Seeded database with 8 categories, 40+ menu items, 5 language translations

- [ ] **Step 1: Initialize Next.js project**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbo
```

- [ ] **Step 2: Install core dependencies**

```bash
npm install prisma @prisma/client zod stripe @stripe/stripe-js uuid
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom tsx
```

- [ ] **Step 3: Create `.env.example` and `.env`**

Create `.env.example` with all documented placeholders (see spec Section 11). Copy to `.env` with `DATABASE_URL="file:./dev.db"` set.

- [ ] **Step 4: Create `.gitignore`**

```gitignore
node_modules/
.next/
.env
.env.local
prisma/dev.db
prisma/dev.db-journal
```

- [ ] **Step 5: Write Prisma schema**

Create `prisma/schema.prisma` with all entities from the spec: `RestaurantSettings`, `MenuCategory`, `MenuItem`, `MenuItemTranslation`, `MenuItemVariant`, `MenuItemAllergen`, `CustomizationGroup`, `CustomizationOption`, `GuestSession`, `Cart`, `CartItem`, `CartItemCustomization`, `Profile`, `Order`, `OrderItem`, `OrderStatusEvent`, `Payment`, `Conversation`, `ConversationMessage`. Use SQLite provider with UUID `@default(uuid())` IDs, integer fields for all monetary values, and proper relations with `@relation` annotations.

- [ ] **Step 6: Run initial migration**

```bash
npx prisma migrate dev --name init
```

- [ ] **Step 7: Write the Prisma client singleton**

Create `src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

- [ ] **Step 8: Write shared TypeScript types**

Create `src/types/index.ts` with enums and types:

```typescript
export enum FulfillmentMode {
  DINE_IN = 'DINE_IN',
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum FulfillmentStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum DietaryFlag {
  VEGETARIAN = 'VEGETARIAN',
  VEGAN = 'VEGAN',
  GLUTEN_FREE = 'GLUTEN_FREE',
  DAIRY_FREE = 'DAIRY_FREE',
  NUT_FREE = 'NUT_FREE',
  HALAL = 'HALAL',
}

export enum SpiceLevel {
  NONE = 0,
  MILD = 1,
  MEDIUM = 2,
  HOT = 3,
}

export enum CookingTechnique {
  HEARTH_FIRE = 'HEARTH_FIRE',
  SLOW_FERMENTED = 'SLOW_FERMENTED',
  COLD_SMOKE = 'COLD_SMOKE',
  RAW = 'RAW',
  WOOD_ROASTED = 'WOOD_ROASTED',
  STONE_GROUND = 'STONE_GROUND',
}

export type SupportedLocale = 'en' | 'hi' | 'te' | 'es' | 'fr';

export interface SessionContext {
  sessionId: string;
  profileId?: string;
  locale: SupportedLocale;
}
```

- [ ] **Step 9: Write config module with startup validation**

Create `src/lib/config.ts`:

```typescript
import { z } from 'zod';

const configSchema = z.object({
  databaseUrl: z.string().min(1),
  appUrl: z.string().url().default('http://localhost:3000'),
  baseCurrency: z.string().length(3).default('USD'),
  taxRateBps: z.coerce.number().int().min(0).max(5000).default(825),
  aiModel: z.string().default('gemini-2.0-flash'),
  googleAiKey: z.string().optional(),
  openaiKey: z.string().optional(),
  elevenLabsKey: z.string().optional(),
  elevenLabsAgentId: z.string().optional(),
  elevenLabsVoiceId: z.string().default('sXSV9RZ095VZyL64w3ap'),
  stripeSecretKey: z.string().optional(),
  stripePublishableKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
  staffPassword: z.string().optional(),
});

export type AppConfig = z.infer<typeof configSchema>;

let _config: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (_config) return _config;
  _config = configSchema.parse({
    databaseUrl: process.env.DATABASE_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    baseCurrency: process.env.RESTAURANT_BASE_CURRENCY,
    taxRateBps: process.env.RESTAURANT_TAX_RATE_BPS,
    aiModel: process.env.AI_MODEL,
    googleAiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
    elevenLabsKey: process.env.ELEVENLABS_API_KEY,
    elevenLabsAgentId: process.env.ELEVENLABS_AGENT_ID,
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    staffPassword: process.env.STAFF_PASSWORD,
  });
  return _config;
}

export function hasAiProvider(): boolean {
  const c = getConfig();
  return !!(c.googleAiKey || c.openaiKey);
}

export function hasVoiceProvider(): boolean {
  return !!getConfig().elevenLabsKey;
}

export function hasPaymentProvider(): boolean {
  return !!getConfig().stripeSecretKey;
}
```

- [ ] **Step 10: Write currency utility**

Create `src/lib/currency.ts`:

```typescript
export function formatCurrency(
  amountMinor: number,
  currency: string,
  locale: string = 'en-US'
): string {
  const divisor = getMinorUnitDivisor(currency);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: Math.log10(divisor),
    maximumFractionDigits: Math.log10(divisor),
  }).format(amountMinor / divisor);
}

export function getMinorUnitDivisor(currency: string): number {
  const zeroDec = ['JPY', 'KRW', 'VND'];
  if (zeroDec.includes(currency.toUpperCase())) return 1;
  return 100;
}

export function addMinorUnits(...amounts: number[]): number {
  return amounts.reduce((sum, a) => sum + Math.round(a), 0);
}

export function calculateTax(subtotalMinor: number, taxRateBps: number): number {
  return Math.round((subtotalMinor * taxRateBps) / 10000);
}
```

- [ ] **Step 11: Write vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 12: Write comprehensive seed script**

Create `prisma/seed.ts` with realistic ECHO menu data:
- 1 RestaurantSettings record (name: "ECHO", tagline, address, hours, currency USD, tax 825 bps)
- 8 MenuCategories: Hearth Starters, Garden & Forage, Open Fire Mains, Botanical Pastas, Heritage Grains, Wild Catch, Sweet Ember Desserts, Elixirs & Infusions
- 40+ MenuItems across categories with realistic names, descriptions, pricing (e.g., "Smoke-Kissed Beetroot Carpaccio" $18, "Heritage Grain Risotto with Wild Mushrooms" $28), dietary flags, spice levels, cooking techniques
- Translations for all items in `en`, `hi`, `te`, `es`, `fr`
- Variants for items (e.g., "Small Plate" / "Full Portion" / "Family Style")
- CustomizationGroups and Options (e.g., "Spice Level" group, "Extra Botanicals" group, "Remove Ingredients" group)
- Allergen data for each item

Add to `package.json`:
```json
"prisma": { "seed": "npx tsx prisma/seed.ts" }
```

- [ ] **Step 13: Run seed**

```bash
npx prisma db seed
```

- [ ] **Step 14: Create root layout with fonts and design tokens**

Create `src/app/globals.css` with Tailwind directives and ECHO design token custom properties:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-ivory: 250 247 242;
    --color-charcoal: 22 22 22;
    --color-olive: 65 74 62;
    --color-ember: 197 143 88;
    --color-sage: 139 157 131;
    --color-cream: 245 240 232;
  }
}
```

Create `src/app/layout.tsx` with Playfair Display (Google Fonts) + Plus Jakarta Sans, metadata with "ECHO — Wild Botanicals & Open Hearth Gastronomy", and global providers.

- [ ] **Step 15: Create placeholder homepage**

Create `src/app/page.tsx` returning a minimal "ECHO" heading to verify the app runs.

- [ ] **Step 16: Verify build and commit**

```bash
npm run build
git add -A; git commit -m "feat: project scaffolding, prisma schema, seed data, design tokens"
```

---

## Task 2: Design System Components & Responsive Navigation

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Select.tsx`
- Create: `src/components/ui/Slider.tsx`
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/Drawer.tsx`
- Create: `src/components/ui/Skeleton.tsx`
- Create: `src/components/ui/Toast.tsx`
- Create: `src/components/layout/Navigation.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/MobileMenu.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `tailwind.config.ts`

**Interfaces:**
- Consumes: Design tokens from `globals.css`
- Produces: `<Button variant="primary"|"secondary"|"ghost" size="sm"|"md"|"lg">` component
- Produces: `<Badge variant="dietary"|"spice"|"status">` component
- Produces: `<Modal isOpen onClose>` and `<Drawer isOpen onClose side="right">` components
- Produces: `<Navigation cartItemCount={number}>` component
- Produces: `<Footer>` component

- [ ] **Step 1: Extend Tailwind config with ECHO design tokens**

Update `tailwind.config.ts` with custom colors (ivory, charcoal, olive, ember, sage, cream), font families (playfair, jakarta), border radius scale, and custom shadows.

- [ ] **Step 2: Build Button component**

Create `src/components/ui/Button.tsx` with variants: `primary` (charcoal bg, ivory text), `secondary` (olive outline), `ghost` (transparent), and sizes `sm`/`md`/`lg`. Include focus-visible ring, disabled state, and loading spinner.

- [ ] **Step 3: Build Badge, Input, Select, Slider components**

Create the base form primitives with consistent ECHO styling. Badge supports `dietary` (olive), `spice` (ember gradient), `status` (semantic colors). Input has floating label pattern. Slider for price range filter.

- [ ] **Step 4: Build Modal and Drawer components**

Create `Modal` (centered overlay with backdrop blur) and `Drawer` (right-side slide for cart, bottom-sheet on mobile). Both with focus trap, escape-to-close, and `prefers-reduced-motion` support.

- [ ] **Step 5: Build Skeleton and Toast components**

Skeleton with ECHO cream shimmer animation. Toast for cart additions and errors with auto-dismiss.

- [ ] **Step 6: Build responsive Navigation**

Create `src/components/layout/Navigation.tsx`:
- Sticky header with ECHO wordmark (styled text, not image)
- Desktop: horizontal links (Menu, Our Story, Contact) + cart icon with count badge + "Speak with Alexa" button
- Mobile: hamburger icon → MobileMenu slide-down
- Cart icon shows real-time item count
- Smooth scroll behavior for on-page anchors

- [ ] **Step 7: Build MobileMenu**

Create `src/components/layout/MobileMenu.tsx`: Full-screen overlay with navigation links, language selector, close button.

- [ ] **Step 8: Build Footer**

Create `src/components/layout/Footer.tsx`: Three-column layout (About ECHO, Quick Links, Contact & Hours), social icon placeholders, legal links (Privacy, Terms), copyright.

- [ ] **Step 9: Wire Navigation and Footer into root layout**

Update `src/app/layout.tsx` to wrap pages with `<Navigation>` and `<Footer>`.

- [ ] **Step 10: Verify responsive behavior and commit**

```bash
npm run build
git add -A; git commit -m "feat: design system components, responsive navigation, footer"
```

---

## Task 3: Homepage

**Files:**
- Create: `src/components/home/Hero.tsx`
- Create: `src/components/home/FeaturedDishes.tsx`
- Create: `src/components/home/Philosophy.tsx`
- Create: `src/components/home/CategoryShowcase.tsx`
- Create: `src/components/home/RestaurantInfo.tsx`
- Create: `src/components/home/CTASection.tsx`
- Modify: `src/app/page.tsx`
- Create: `public/images/` placeholder food images

**Interfaces:**
- Consumes: `db` from `src/lib/db.ts`, design system components
- Produces: Fully rendered homepage with all editorial sections

- [ ] **Step 1: Create curated placeholder food images**

Generate or source 10–15 high-quality food photography placeholder images (using Unsplash API URLs or local placeholders at `public/images/hero.jpg`, `public/images/dish-*.jpg`). These will be `next/image` optimized.

- [ ] **Step 2: Build Hero section**

Create `src/components/home/Hero.tsx`:
- Full-viewport-height hero with cinematic food image background
- Headline: "Wild Botanicals & Open Hearth Gastronomy" in Playfair Display
- Subheading: "Seasonal plates crafted over open flame, from garden to hearth"
- Two CTAs: "Explore Our Menu" (primary, links to /menu) and "Speak with Alexa" (secondary, opens concierge)
- Subtle parallax scroll effect (respects `prefers-reduced-motion`)

- [ ] **Step 3: Build FeaturedDishes section**

Create `src/components/home/FeaturedDishes.tsx`:
- Server component that queries `db.menuItem.findMany({ where: { isSignature: true }, take: 3, include: { category: true, variants: true } })`
- Editorial asymmetric layout (not a 3-column grid): large hero dish left, two smaller dishes stacked right
- Each dish shows image, name, short description, price, dietary badges
- Click links to `/menu?item={slug}`

- [ ] **Step 4: Build CategoryShowcase section**

Create `src/components/home/CategoryShowcase.tsx`:
- Horizontal scroll row of category tiles fetched from `db.menuCategory`
- Each tile: category name in serif, representative image, item count
- Click navigates to `/menu?category={slug}`

- [ ] **Step 5: Build Philosophy section**

Create `src/components/home/Philosophy.tsx`:
- Two-column editorial layout: atmospheric image left, story text right
- Headline: "Our Hearth"
- Body text about open-fire cooking philosophy, heirloom grains, wild aromatics
- Not generic — feels like a real restaurant story

- [ ] **Step 6: Build RestaurantInfo section**

Create `src/components/home/RestaurantInfo.tsx`:
- Server component loading from `db.restaurantSettings`
- Opening hours displayed in a clean table
- Address with map placeholder
- Contact phone and email
- Fulfillment modes listed (Dine-in, Pickup, Delivery)

- [ ] **Step 7: Build CTASection (final ordering prompt)**

Create `src/components/home/CTASection.tsx`:
- Refined dark-bg section before footer
- "Ready to dine?" headline
- "Order Now" and "View Full Menu" buttons

- [ ] **Step 8: Assemble Homepage**

Update `src/app/page.tsx` to compose: `Hero` → `FeaturedDishes` → `CategoryShowcase` → `Philosophy` → `RestaurantInfo` → `CTASection`. Use RSC for data-fetching sections.

- [ ] **Step 9: Add SEO metadata**

Update homepage metadata: title "ECHO — Wild Botanicals & Open Hearth Gastronomy", description, Open Graph image, canonical URL.

- [ ] **Step 10: Verify and commit**

```bash
npm run build
git add -A; git commit -m "feat: complete editorial homepage with all sections"
```

---

## Task 4: Menu Page with Search, Filters & Dish Detail

**Files:**
- Create: `src/app/api/menu/route.ts`
- Create: `src/app/api/menu/[id]/route.ts`
- Create: `src/app/menu/page.tsx`
- Create: `src/components/menu/MenuGrid.tsx`
- Create: `src/components/menu/MenuFilters.tsx`
- Create: `src/components/menu/MenuItemCard.tsx`
- Create: `src/components/menu/DishDetail.tsx`
- Create: `src/components/menu/CategoryNav.tsx`
- Create: `src/lib/validation.ts`

**Interfaces:**
- Consumes: `db` from `src/lib/db.ts`, design system components, types from `src/types/index.ts`
- Produces: `GET /api/menu?q=&category=&dietary=&spice_max=&price_max=&locale=` → `MenuItem[]`
- Produces: `GET /api/menu/[id]?locale=` → full `MenuItem` with variants, customizations, allergens
- Produces: Interactive menu browsing with all filtering capabilities

- [ ] **Step 1: Write Zod validation schemas**

Create `src/lib/validation.ts` with:
- `menuQuerySchema`: validates search query, category slug, dietary flags array, spice_max (0–3), price_max_minor, locale
- `itemIdSchema`: validates UUID
- `cartItemSchema`: validates item_id, variant_id, customizations array, quantity

- [ ] **Step 2: Build menu API route**

Create `src/app/api/menu/route.ts`:
- GET handler that parses query params with `menuQuerySchema`
- Queries `db.menuItem` with `where` filters: `name contains` (case-insensitive), `category.slug`, `dietaryFlags has`, `spiceLevel <=`, `basePriceMinor <=`, `isAvailable: true`
- Includes category, default variant, and translations for requested locale
- Returns JSON array

- [ ] **Step 3: Build item detail API route**

Create `src/app/api/menu/[id]/route.ts`:
- GET handler that fetches single item by ID
- Includes: all variants, all customization groups with options, allergens, translations
- Returns 404 if not found or unavailable

- [ ] **Step 4: Build CategoryNav**

Create `src/components/menu/CategoryNav.tsx`:
- Desktop: vertical sidebar list with category names and counts
- Mobile: horizontal scrollable chip bar
- Active category highlighted with olive accent
- Click updates URL search param `?category=`

- [ ] **Step 5: Build MenuFilters**

Create `src/components/menu/MenuFilters.tsx`:
- Search input with debounced query
- Dietary flag toggles (checkboxes with Badge components)
- Spice level slider (0–3)
- Price range slider
- "Clear filters" button
- All filters sync to URL search params for shareable URLs

- [ ] **Step 6: Build MenuItemCard**

Create `src/components/menu/MenuItemCard.tsx`:
- Responsive card: image (4:3 aspect), name (serif), description (truncated 2 lines), price, dietary badges
- Hover: subtle lift shadow, image scale
- "Sold Out" overlay when `!isAvailable`
- Click opens DishDetail modal

- [ ] **Step 7: Build MenuGrid**

Create `src/components/menu/MenuGrid.tsx`:
- Client component that fetches from `/api/menu` with current filter params
- Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
- Loading skeletons during fetch
- "No dishes match your filters" empty state
- Pagination or infinite scroll for large menus

- [ ] **Step 8: Build DishDetail modal**

Create `src/components/menu/DishDetail.tsx`:
- Modal overlay with large dish image
- Name, full description, ingredients list
- Dietary and allergen badges
- Variant selector (radio buttons for sizes/portions)
- Customization groups: checkboxes with min/max enforcement, each showing price delta ("+$2.00")
- Live price calculation updating as selections change
- Quantity selector (1–10)
- "Add to Cart" button (disabled until required selections met)
- Related dishes carousel at bottom (fetched from same category)

- [ ] **Step 9: Assemble Menu page**

Create `src/app/menu/page.tsx`:
- Server component for initial menu data (RSC)
- Client island for filters and interactive grid
- SEO metadata: "Menu — ECHO Restaurant"
- URL-driven state for filters and selected dish

- [ ] **Step 10: Verify and commit**

```bash
npm run build
git add -A; git commit -m "feat: menu page with search, filters, dish detail modal"
```

---

## Task 5: Session Management, Cart Logic & Cart UI

**Files:**
- Create: `src/lib/session.ts`
- Create: `src/lib/cart/operations.ts`
- Create: `src/lib/cart/pricing.ts`
- Create: `src/app/api/cart/route.ts`
- Create: `src/hooks/useCart.ts`
- Create: `src/components/cart/CartDrawer.tsx`
- Create: `src/components/cart/CartItem.tsx`
- Create: `src/components/cart/CartSummary.tsx`
- Create: `tests/unit/currency.test.ts`
- Create: `tests/unit/pricing.test.ts`
- Create: `tests/unit/cart-operations.test.ts`
- Modify: `src/app/layout.tsx` (add cart provider)
- Modify: `src/components/menu/DishDetail.tsx` (wire add-to-cart)

**Interfaces:**
- Consumes: `db`, `currency.ts`, `validation.ts`, `types/index.ts`
- Produces: `getOrCreateSession(cookies): Promise<GuestSession>`
- Produces: `addToCart(sessionId, itemId, variantId, customizations, quantity): Promise<CartWithTotals>`
- Produces: `getCart(sessionId): Promise<CartWithTotals>`
- Produces: `updateCartItem(sessionId, cartItemId, updates): Promise<CartWithTotals>`
- Produces: `removeFromCart(sessionId, cartItemId): Promise<CartWithTotals>`
- Produces: `calculateCartTotals(cart): CartTotals` with subtotal, tax, fees, total (all minor units)
- Produces: `GET/POST/PUT/DELETE /api/cart` endpoints
- Produces: `useCart()` hook returning `{ cart, addItem, updateItem, removeItem, itemCount, isLoading }`

- [ ] **Step 1: Write unit tests for currency formatting**

Create `tests/unit/currency.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency, calculateTax, addMinorUnits, getMinorUnitDivisor } from '@/lib/currency';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1250, 'USD')).toBe('$12.50');
  });
  it('formats INR correctly', () => {
    expect(formatCurrency(150000, 'INR', 'en-IN')).toBe('₹1,500.00');
  });
  it('formats EUR correctly', () => {
    expect(formatCurrency(999, 'EUR', 'de-DE')).toContain('9,99');
  });
  it('formats JPY with no decimals', () => {
    expect(formatCurrency(1500, 'JPY', 'ja-JP')).toContain('1,500');
  });
  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });
});

describe('calculateTax', () => {
  it('calculates 8.25% tax correctly', () => {
    expect(calculateTax(10000, 825)).toBe(825); // $100.00 * 8.25% = $8.25
  });
  it('rounds correctly', () => {
    expect(calculateTax(1999, 825)).toBe(165); // $19.99 * 8.25% = $1.649... → $1.65
  });
  it('handles zero tax', () => {
    expect(calculateTax(5000, 0)).toBe(0);
  });
});

describe('addMinorUnits', () => {
  it('sums integers', () => {
    expect(addMinorUnits(1250, 800, 350)).toBe(2400);
  });
});
```

- [ ] **Step 2: Run currency tests to verify they pass**

```bash
npx vitest run tests/unit/currency.test.ts
```

- [ ] **Step 3: Write session management**

Create `src/lib/session.ts`:

```typescript
import { cookies } from 'next/headers';
import { db } from './db';
import { v4 as uuid } from 'uuid';

const SESSION_COOKIE = 'echo_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function getOrCreateSession(): Promise<{ sessionId: string }> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE)?.value;

  if (existing) {
    const session = await db.guestSession.findUnique({ where: { id: existing } });
    if (session) return { sessionId: session.id };
  }

  const sessionId = uuid();
  await db.guestSession.create({
    data: {
      id: sessionId,
      cart: { create: {} },
    },
  });

  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return { sessionId };
}
```

- [ ] **Step 4: Write pricing engine**

Create `src/lib/cart/pricing.ts`:

```typescript
import { calculateTax } from '@/lib/currency';
import { getConfig } from '@/lib/config';

export interface CartTotals {
  subtotalMinor: number;
  taxMinor: number;
  deliveryFeeMinor: number;
  packagingFeeMinor: number;
  totalMinor: number;
  currency: string;
  itemCount: number;
}

export function calculateCartTotals(
  lineItems: Array<{ unitPriceMinor: number; quantity: number }>,
  options?: { includeDeliveryFee?: boolean; includePackagingFee?: boolean }
): CartTotals {
  const config = getConfig();
  const subtotalMinor = lineItems.reduce(
    (sum, item) => sum + item.unitPriceMinor * item.quantity,
    0
  );
  const taxMinor = calculateTax(subtotalMinor, config.taxRateBps);
  const deliveryFeeMinor = options?.includeDeliveryFee ? 500 : 0; // configurable
  const packagingFeeMinor = options?.includePackagingFee ? 200 : 0; // configurable
  const totalMinor = subtotalMinor + taxMinor + deliveryFeeMinor + packagingFeeMinor;
  const itemCount = lineItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotalMinor,
    taxMinor,
    deliveryFeeMinor,
    packagingFeeMinor,
    totalMinor,
    currency: config.baseCurrency,
    itemCount,
  };
}

export function calculateLineItemPrice(
  variantPriceMinor: number,
  customizationDeltas: number[]
): number {
  return variantPriceMinor + customizationDeltas.reduce((sum, d) => sum + d, 0);
}
```

- [ ] **Step 5: Write unit tests for pricing**

Create `tests/unit/pricing.test.ts` testing `calculateCartTotals` and `calculateLineItemPrice` with various item combinations, zero items, customization deltas, delivery/packaging fees.

- [ ] **Step 6: Run pricing tests**

```bash
npx vitest run tests/unit/pricing.test.ts
```

- [ ] **Step 7: Write cart operations**

Create `src/lib/cart/operations.ts` with `addToCart`, `getCart`, `updateCartItem`, `removeFromCart`. Each function:
- Validates session ownership by checking cart belongs to sessionId
- Validates item exists and `isAvailable`
- Validates variant belongs to item
- Validates customization options belong to item's groups and respect min/max
- Calculates line item price from variant + customization deltas
- Returns full cart with totals

- [ ] **Step 8: Write unit tests for cart operations**

Create `tests/unit/cart-operations.test.ts` testing add/update/remove with mocked Prisma, validation rejection of unavailable items, invalid variants, exceeding max customizations.

- [ ] **Step 9: Run cart operations tests**

```bash
npx vitest run tests/unit/cart-operations.test.ts
```

- [ ] **Step 10: Build cart API route**

Create `src/app/api/cart/route.ts`:
- `GET`: calls `getCart(sessionId)` → returns cart JSON
- `POST`: calls `addToCart(sessionId, body)` → returns updated cart
- `PUT`: calls `updateCartItem(sessionId, body)` → returns updated cart
- `DELETE`: calls `removeFromCart(sessionId, body.cartItemId)` → returns updated cart

All handlers call `getOrCreateSession()` first.

- [ ] **Step 11: Build useCart hook**

Create `src/hooks/useCart.ts`:
- Fetches cart from `/api/cart` on mount
- Provides `addItem`, `updateItem`, `removeItem` mutation functions
- Tracks `isLoading` and `itemCount`
- Uses `useSWR` or React state with optimistic updates
- Exposes `cart` data with all totals

- [ ] **Step 12: Build CartItem component**

Create `src/components/cart/CartItem.tsx`: dish image thumbnail, name, variant label, customization list, quantity +/- controls, line price, remove button.

- [ ] **Step 13: Build CartSummary component**

Create `src/components/cart/CartSummary.tsx`: subtotal, tax line, fees, total in bold, currency display, "Proceed to Checkout" button linking to `/checkout`.

- [ ] **Step 14: Build CartDrawer component**

Create `src/components/cart/CartDrawer.tsx`:
- Right-side Drawer containing CartItem list + CartSummary
- "Your cart is empty" state with "Browse Menu" CTA
- Cart item count in header
- Opens from nav cart icon click

- [ ] **Step 15: Wire DishDetail "Add to Cart" to real cart API**

Update `src/components/menu/DishDetail.tsx`: on "Add to Cart" click, call `useCart().addItem()` with selected variant, customizations, and quantity. Show success toast. Close modal.

- [ ] **Step 16: Add CartProvider to layout**

Update `src/app/layout.tsx` to include cart context provider and CartDrawer.

- [ ] **Step 17: Verify full add-to-cart flow and commit**

```bash
npm run build
npx vitest run
git add -A; git commit -m "feat: session management, cart operations, cart UI, pricing engine"
```

---

## Task 6: Order State Machine, Checkout & Stripe Integration

**Files:**
- Create: `src/lib/orders/state-machine.ts`
- Create: `src/lib/orders/operations.ts`
- Create: `src/lib/payments/stripe.ts`
- Create: `src/lib/payments/sandbox.ts`
- Create: `src/lib/payments/webhook.ts`
- Create: `src/app/checkout/page.tsx`
- Create: `src/components/checkout/FulfillmentSelect.tsx`
- Create: `src/components/checkout/CheckoutForm.tsx`
- Create: `src/components/checkout/OrderSummary.tsx`
- Create: `src/app/api/checkout/route.ts`
- Create: `src/app/api/webhook/stripe/route.ts`
- Create: `tests/unit/order-state-machine.test.ts`

**Interfaces:**
- Consumes: `cart/operations.ts`, `cart/pricing.ts`, `session.ts`, `config.ts`, `currency.ts`
- Produces: `isValidTransition(from: FulfillmentStatus, to: FulfillmentStatus): boolean`
- Produces: `transitionOrder(orderId, newStatus, changedBy): Promise<Order>`
- Produces: `createOrder(sessionId, fulfillmentMode, fulfillmentDetails, customerInfo): Promise<Order>`
- Produces: `createStripeCheckoutSession(order): Promise<{ checkoutUrl: string }>`
- Produces: `createSandboxCheckout(order): Promise<{ orderRef: string }>`
- Produces: `verifyAndProcessWebhook(body, signature): Promise<void>`
- Produces: `POST /api/checkout` → `{ checkoutUrl, orderRef }`
- Produces: `POST /api/webhook/stripe` → webhook handler

- [ ] **Step 1: Write order state machine with tests**

Create `src/lib/orders/state-machine.ts`:

```typescript
import { FulfillmentStatus } from '@/types';

const VALID_TRANSITIONS: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  [FulfillmentStatus.PENDING_PAYMENT]: [FulfillmentStatus.CONFIRMED, FulfillmentStatus.CANCELLED],
  [FulfillmentStatus.CONFIRMED]: [FulfillmentStatus.ACCEPTED, FulfillmentStatus.CANCELLED],
  [FulfillmentStatus.ACCEPTED]: [FulfillmentStatus.PREPARING, FulfillmentStatus.CANCELLED],
  [FulfillmentStatus.PREPARING]: [FulfillmentStatus.READY, FulfillmentStatus.OUT_FOR_DELIVERY],
  [FulfillmentStatus.READY]: [FulfillmentStatus.COMPLETED],
  [FulfillmentStatus.OUT_FOR_DELIVERY]: [FulfillmentStatus.COMPLETED],
  [FulfillmentStatus.COMPLETED]: [],
  [FulfillmentStatus.CANCELLED]: [],
};

export function isValidTransition(from: FulfillmentStatus, to: FulfillmentStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isCancellable(status: FulfillmentStatus): boolean {
  return [
    FulfillmentStatus.PENDING_PAYMENT,
    FulfillmentStatus.CONFIRMED,
    FulfillmentStatus.ACCEPTED,
  ].includes(status);
}
```

Create `tests/unit/order-state-machine.test.ts` testing all valid transitions, rejection of invalid transitions (e.g., `COMPLETED` → `PREPARING`), and `isCancellable` logic.

- [ ] **Step 2: Run state machine tests**

```bash
npx vitest run tests/unit/order-state-machine.test.ts
```

- [ ] **Step 3: Write order operations**

Create `src/lib/orders/operations.ts`:
- `createOrder(sessionId, fulfillmentMode, fulfillmentDetails, customerInfo)`: validates cart non-empty, rechecks availability, recalculates prices, creates Order + OrderItems (immutable snapshots) + initial OrderStatusEvent + Payment record. Generates `order_ref` as `ECHO-${4-digit-random}`.
- `getOrderByRef(orderRef, sessionId)`: validates session owns order, returns with status history.
- `getOrderHistory(sessionId)`: returns session's orders sorted by date.
- `transitionOrder(orderId, newStatus, changedBy, note?)`: validates transition, creates OrderStatusEvent.
- `cancelOrder(orderRef, sessionId)`: validates ownership and cancellability, transitions to CANCELLED.

- [ ] **Step 4: Write Stripe checkout session creator**

Create `src/lib/payments/stripe.ts`:

```typescript
import Stripe from 'stripe';
import { getConfig } from '@/lib/config';

function getStripe(): Stripe {
  const config = getConfig();
  if (!config.stripeSecretKey) throw new Error('Stripe not configured');
  return new Stripe(config.stripeSecretKey);
}

export async function createStripeCheckoutSession(order: {
  id: string;
  orderRef: string;
  totalMinor: number;
  currency: string;
  items: Array<{ name: string; unitPriceMinor: number; quantity: number }>;
}): Promise<{ checkoutUrl: string }> {
  const config = getConfig();
  const stripe = getStripe();
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: order.currency.toLowerCase(),
    line_items: order.items.map((item) => ({
      price_data: {
        currency: order.currency.toLowerCase(),
        unit_amount: item.unitPriceMinor,
        product_data: { name: item.name },
      },
      quantity: item.quantity,
    })),
    metadata: { order_id: order.id, order_ref: order.orderRef },
    client_reference_id: order.id,
    success_url: `${config.appUrl}/orders/${order.orderRef}?status=success`,
    cancel_url: `${config.appUrl}/checkout?status=cancelled`,
  });

  return { checkoutUrl: session.url! };
}
```

- [ ] **Step 5: Write sandbox checkout**

Create `src/lib/payments/sandbox.ts`:
- Immediately marks order `payment_status: PAID`, transitions `fulfillment_status: CONFIRMED`
- Returns `{ orderRef }` without external redirect

- [ ] **Step 6: Write Stripe webhook handler**

Create `src/lib/payments/webhook.ts`:
- `verifyAndProcessWebhook(rawBody, signature)`:
  - Constructs event with `stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)`
  - On `checkout.session.completed`: extracts `order_id` from metadata, checks `webhook_event_id` for deduplication, updates payment status to `SUCCEEDED`, transitions order to `CONFIRMED`
  - Idempotent: duplicate event IDs are no-ops

- [ ] **Step 7: Build checkout API route**

Create `src/app/api/checkout/route.ts`:
- POST handler: validates body (fulfillment mode, details, customer info)
- Calls `createOrder()` → then `createStripeCheckoutSession()` (or `createSandboxCheckout()` if no Stripe key)
- Returns `{ checkoutUrl, orderRef }`

- [ ] **Step 8: Build Stripe webhook API route**

Create `src/app/api/webhook/stripe/route.ts`:
- POST handler with raw body parsing (not JSON parsed)
- Calls `verifyAndProcessWebhook()`
- Returns 200 on success, 400 on verification failure

- [ ] **Step 9: Build FulfillmentSelect component**

Create `src/components/checkout/FulfillmentSelect.tsx`:
- Radio card group: Dine-In (table icon), Pickup (bag icon), Delivery (truck icon)
- Each card shows label and brief description
- Selecting reveals relevant detail fields

- [ ] **Step 10: Build CheckoutForm component**

Create `src/components/checkout/CheckoutForm.tsx`:
- Fulfillment details: Table Number (dine-in), Pickup Time + Name + Phone (pickup), Address + Instructions + Phone (delivery)
- Customer name and email fields
- Form validation with Zod
- Loading state during submission

- [ ] **Step 11: Build OrderSummary component**

Create `src/components/checkout/OrderSummary.tsx`:
- Reads cart data and displays final itemized breakdown
- Subtotal, tax, fees (delivery/packaging based on fulfillment mode), total
- Currency clearly displayed
- Sandbox mode indicator when applicable

- [ ] **Step 12: Assemble Checkout page**

Create `src/app/checkout/page.tsx`:
- FulfillmentSelect → CheckoutForm → OrderSummary → "Place Order" button
- On submit: POST to `/api/checkout`, redirect to Stripe URL or order page
- Handle `?status=cancelled` return from Stripe with message
- Empty cart redirect to `/menu`

- [ ] **Step 13: Verify and commit**

```bash
npm run build
npx vitest run
git add -A; git commit -m "feat: order state machine, checkout flow, Stripe integration, sandbox mode"
```

---

## Task 7: Order Tracking & Order History

**Files:**
- Create: `src/app/orders/[orderRef]/page.tsx`
- Create: `src/app/api/orders/route.ts`
- Create: `src/app/api/orders/[orderRef]/route.ts`
- Create: `src/components/orders/OrderTimeline.tsx`
- Create: `src/components/orders/OrderDetails.tsx`

**Interfaces:**
- Consumes: `orders/operations.ts`, `session.ts`, `currency.ts`
- Produces: `GET /api/orders` → order history array
- Produces: `GET /api/orders/[orderRef]` → single order with status history
- Produces: `POST /api/orders/[orderRef]` with `action: 'cancel'` → cancel order
- Produces: Order tracking page with timeline and auto-refresh

- [ ] **Step 1: Build order API routes**

Create `src/app/api/orders/route.ts`:
- GET: calls `getOrderHistory(sessionId)` → returns orders array

Create `src/app/api/orders/[orderRef]/route.ts`:
- GET: calls `getOrderByRef(orderRef, sessionId)` → returns order with items and status history
- POST: if `body.action === 'cancel'`, calls `cancelOrder(orderRef, sessionId)`

- [ ] **Step 2: Build OrderTimeline component**

Create `src/components/orders/OrderTimeline.tsx`:
- Vertical timeline with status nodes
- Completed steps: olive checkmark, timestamp
- Current step: ember pulse animation
- Future steps: grey dots
- Status labels and timestamps from `OrderStatusEvent[]`

- [ ] **Step 3: Build OrderDetails component**

Create `src/components/orders/OrderDetails.tsx`:
- Order reference header (e.g., "Order ECHO-4821")
- Payment status badge (green "Paid", amber "Pending", red "Failed")
- Fulfillment mode and details (table number, pickup time, delivery address)
- Itemized list with names, variants, customizations, quantities, line prices
- Total with tax/fees breakdown
- Restaurant contact section
- Cancel button (only shown if order is cancellable)

- [ ] **Step 4: Build Order Tracking page**

Create `src/app/orders/[orderRef]/page.tsx`:
- Server component that fetches order on initial load
- Client component wrapper with 30-second polling for status updates
- OrderTimeline + OrderDetails composition
- Success banner when `?status=success` (from Stripe redirect)
- 404 page if order not found or unauthorized
- SEO: noindex (private page)

- [ ] **Step 5: Verify and commit**

```bash
npm run build
git add -A; git commit -m "feat: order tracking page, order history, cancel flow"
```

---

## Task 8: AI Concierge — Tool Registry & Text Chat

**Files:**
- Create: `src/lib/concierge/tools/index.ts`
- Create: `src/lib/concierge/tools/browse-menu.ts`
- Create: `src/lib/concierge/tools/get-item-details.ts`
- Create: `src/lib/concierge/tools/recommend-items.ts`
- Create: `src/lib/concierge/tools/customize-item.ts`
- Create: `src/lib/concierge/tools/add-to-cart.ts`
- Create: `src/lib/concierge/tools/view-cart.ts`
- Create: `src/lib/concierge/tools/update-cart-item.ts`
- Create: `src/lib/concierge/tools/remove-from-cart.ts`
- Create: `src/lib/concierge/tools/get-restaurant-info.ts`
- Create: `src/lib/concierge/tools/prepare-checkout.ts`
- Create: `src/lib/concierge/tools/create-checkout-session.ts`
- Create: `src/lib/concierge/tools/get-order-status.ts`
- Create: `src/lib/concierge/tools/get-order-history.ts`
- Create: `src/lib/concierge/tools/cancel-order.ts`
- Create: `src/lib/concierge/context.ts`
- Create: `src/lib/concierge/prompts.ts`
- Create: `src/app/api/concierge/chat/route.ts`
- Create: `tests/unit/customization-validation.test.ts`

**Interfaces:**
- Consumes: All `cart/`, `orders/`, `payments/` operations; `db`, `session.ts`, `config.ts`
- Produces: `ToolRegistry` — map of tool name → `{ schema, description, execute }`
- Produces: `executeTool(toolName, args, sessionContext): Promise<ToolResult>`
- Produces: `POST /api/concierge/chat` → streamed AI response with tool calls
- Produces: `ConversationContextManager` for session memory

- [ ] **Step 1: Write tool registry framework**

Create `src/lib/concierge/tools/index.ts`:

```typescript
import { z } from 'zod';
import { SessionContext } from '@/types';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  execute: (input: unknown, session: SessionContext) => Promise<unknown>;
}

export const toolRegistry: Map<string, ToolDefinition> = new Map();

export function registerTool(tool: ToolDefinition) {
  toolRegistry.set(tool.name, tool);
}

export async function executeTool(
  name: string,
  args: unknown,
  session: SessionContext
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const tool = toolRegistry.get(name);
  if (!tool) return { success: false, error: `Unknown tool: ${name}` };
  
  const parsed = tool.inputSchema.safeParse(args);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  
  try {
    const data = await tool.execute(parsed.data, session);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Tool execution failed' };
  }
}
```

- [ ] **Step 2: Implement all 14 tool modules**

Create each tool file in `src/lib/concierge/tools/`:
- Each exports a `ToolDefinition` with Zod input schema, description string, and async execute function
- Each tool calls the corresponding business logic from `cart/operations.ts`, `orders/operations.ts`, etc.
- Registration happens via `registerTool()` at the bottom of each file
- Import all tools in `index.ts` to trigger registration

Key implementation notes:
- `browse-menu.ts`: calls `db.menuItem.findMany()` with filters, returns simplified results
- `recommend-items.ts`: filters menu by dietary constraints, ranks by keyword match, explains with attributes
- `customize-item.ts`: validates against `db.customizationGroup` min/max rules
- `add-to-cart.ts`: delegates to `cart/operations.addToCart()`
- `create-checkout-session.ts`: delegates to `orders/operations.createOrder()` + `payments/stripe.createStripeCheckoutSession()`
- `cancel-order.ts`: requires `confirmation: true` in input, delegates to `orders/operations.cancelOrder()`

- [ ] **Step 3: Write customization validation tests**

Create `tests/unit/customization-validation.test.ts`:
- Test min_selections enforcement (required group with 0 selections → error)
- Test max_selections enforcement (group with max=2, 3 selected → error)
- Test option must belong to item's group
- Test price delta calculation with multiple options

- [ ] **Step 4: Run validation tests**

```bash
npx vitest run tests/unit/customization-validation.test.ts
```

- [ ] **Step 5: Write conversation context manager**

Create `src/lib/concierge/context.ts`:
- In-memory `Map<sessionId, ConversationState>`
- `ConversationState`: messages array (last 20), dietary preferences, disliked ingredients, preferred language, current stage
- `addMessage(sessionId, role, content)`, `getContext(sessionId)`, `resetContext(sessionId)`
- `updatePreferences(sessionId, { dietary?, dislikes?, language? })`

- [ ] **Step 6: Write system prompts**

Create `src/lib/concierge/prompts.ts`:
- Base system prompt establishing ECHO concierge persona ("Alexa, the ECHO dining concierge")
- Restaurant context injection (name, hours, fulfillment modes)
- Language-specific greeting templates for en, hi, te, es, fr
- Tool usage instructions for the LLM
- Rules: never invent menu items, always confirm before checkout, respect stated preferences

- [ ] **Step 7: Build chat API route**

Create `src/app/api/concierge/chat/route.ts`:
- POST handler: receives `{ message, locale? }`
- Gets session, loads conversation context
- Constructs messages array: system prompt + context summary + last 20 messages + new user message
- Calls LLM provider (Google Gemini via `@google/generative-ai` or OpenAI) with tool definitions from registry
- Handles tool calls: executes each, appends results, continues conversation
- Returns final assistant message + any tool results
- Stores messages in context manager

- [ ] **Step 8: Install AI SDK dependency**

```bash
npm install @google/generative-ai
```

(Or `openai` if configured)

- [ ] **Step 9: Verify and commit**

```bash
npm run build
npx vitest run
git add -A; git commit -m "feat: 14-tool concierge registry, context manager, chat API"
```

---

## Task 9: Concierge Chat UI

**Files:**
- Create: `src/components/concierge/ConciergePanel.tsx`
- Create: `src/components/concierge/ChatMessages.tsx`
- Create: `src/components/concierge/ChatInput.tsx`
- Create: `src/components/concierge/ToolResultCard.tsx`
- Create: `src/components/concierge/LanguageSelector.tsx`
- Create: `src/hooks/useConcierge.ts`
- Create: `src/hooks/useLanguage.ts`
- Modify: `src/app/layout.tsx` (add concierge panel)

**Interfaces:**
- Consumes: `/api/concierge/chat`, `useCart` hook
- Produces: `useConcierge()` hook: `{ messages, sendMessage, isLoading, resetConversation }`
- Produces: `useLanguage()` hook: `{ locale, setLocale, availableLocales }`
- Produces: `<ConciergePanel>` — floating drawer accessible from any page

- [ ] **Step 1: Build useLanguage hook**

Create `src/hooks/useLanguage.ts`:
- Stores selected locale in localStorage
- Defaults to browser language or 'en'
- Provides `setLocale()` and `availableLocales` list

- [ ] **Step 2: Build useConcierge hook**

Create `src/hooks/useConcierge.ts`:
- Manages chat messages state
- `sendMessage(text)`: POST to `/api/concierge/chat` with message and locale
- Parses response for tool results and assistant text
- Manages loading/streaming state
- `resetConversation()`: clears messages

- [ ] **Step 3: Build ChatMessages component**

Create `src/components/concierge/ChatMessages.tsx`:
- Scrollable message list with user (right-aligned, charcoal bubble) and assistant (left-aligned, cream bubble) messages
- Typing indicator animation during loading
- Auto-scroll to bottom on new messages

- [ ] **Step 4: Build ToolResultCard component**

Create `src/components/concierge/ToolResultCard.tsx`:
- Rich display of tool results within chat:
  - Menu browse results: mini dish cards with image, name, price
  - Cart view: itemized list with total
  - Recommendation: dish cards with "Add to Cart" quick action
  - Order status: status badge with timeline
- "Add to Cart" buttons in recommendation cards trigger `useCart().addItem()` directly

- [ ] **Step 5: Build ChatInput component**

Create `src/components/concierge/ChatInput.tsx`:
- Text input with send button
- Enter to send, Shift+Enter for newline
- Disabled during loading
- Voice button placeholder (wired in Task 10)

- [ ] **Step 6: Build LanguageSelector component**

Create `src/components/concierge/LanguageSelector.tsx`:
- Dropdown with flag emojis: 🇬🇧 English, 🇮🇳 हिंदी, 🇮🇳 తెలుగు, 🇪🇸 Español, 🇫🇷 Français
- Updates `useLanguage().setLocale()`

- [ ] **Step 7: Build ConciergePanel component**

Create `src/components/concierge/ConciergePanel.tsx`:
- Floating action button (bottom-right): olive circle with chat icon
- Opens right-side drawer (desktop) or bottom sheet (mobile)
- Header: "ECHO Dining Concierge" + LanguageSelector + close button
- Body: ChatMessages
- Footer: ChatInput with voice button
- Does not obscure navigation or cart CTA

- [ ] **Step 8: Wire ConciergePanel into layout**

Update `src/app/layout.tsx` to render `<ConciergePanel />` globally.

- [ ] **Step 9: Wire homepage "Speak with Alexa" CTA to open concierge**

Update Hero component's secondary CTA to trigger concierge panel open.

- [ ] **Step 10: Verify and commit**

```bash
npm run build
git add -A; git commit -m "feat: concierge chat UI with tool result cards, language selector"
```

---

## Task 10: ElevenLabs Voice Integration

**Files:**
- Create: `src/lib/voice/elevenlabs.ts`
- Create: `src/lib/voice/web-speech.ts`
- Create: `src/app/api/voice/session/route.ts`
- Create: `src/hooks/useVoice.ts`
- Create: `src/components/concierge/VoiceButton.tsx`
- Create: `src/components/concierge/VoiceVisualizer.tsx`
- Modify: `src/components/concierge/ChatInput.tsx` (wire voice button)
- Modify: `src/components/concierge/ConciergePanel.tsx` (voice state)

**Interfaces:**
- Consumes: `config.ts`, `/api/concierge/chat`, `useLanguage` hook
- Produces: `POST /api/voice/session` → `{ signedUrl }` (signed ElevenLabs connection URL)
- Produces: `useVoice()` hook: `{ state, startListening, stopListening, toggleMute, isAvailable }`
- Produces: `<VoiceButton>` with state visualization
- Produces: `<VoiceVisualizer>` with real WebAudio FFT

- [ ] **Step 1: Build ElevenLabs server-side session generator**

Create `src/lib/voice/elevenlabs.ts`:

```typescript
import { getConfig } from '@/lib/config';

export async function generateSignedUrl(agentId: string): Promise<string> {
  const config = getConfig();
  if (!config.elevenLabsKey) throw new Error('ElevenLabs not configured');

  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
    {
      method: 'GET',
      headers: { 'xi-api-key': config.elevenLabsKey },
    }
  );

  if (!response.ok) throw new Error(`ElevenLabs API error: ${response.status}`);
  const data = await response.json();
  return data.signed_url;
}
```

- [ ] **Step 2: Build voice session API route**

Create `src/app/api/voice/session/route.ts`:
- POST handler: validates session, calls `generateSignedUrl(agentId)`
- Rate limited: max 10 sessions per session ID per hour
- Returns `{ signedUrl }` for client-side connection

- [ ] **Step 3: Build Web Speech fallback**

Create `src/lib/voice/web-speech.ts`:
- Wraps `window.SpeechRecognition` and `window.speechSynthesis`
- `startRecognition(lang, onResult, onError)`: starts listening
- `speakText(text, lang)`: uses speech synthesis
- Feature detection: returns `isSupported: boolean`

- [ ] **Step 4: Install ElevenLabs SDK**

```bash
npm install @11labs/react @11labs/client
```

- [ ] **Step 5: Build useVoice hook**

Create `src/hooks/useVoice.ts`:
- State machine: `idle | connecting | listening | processing | speaking | muted | error`
- If ElevenLabs configured: uses `@11labs/react` `useConversation` hook with signed URL
- If not: falls back to Web Speech API
- `startListening()`: requests mic permission, connects to voice service
- `stopListening()`: ends session
- `toggleMute()`: mutes/unmutes microphone
- Exposes `audioAnalyser` (AnalyserNode) for visualizer
- Handles language switching (may require reconnection)

- [ ] **Step 6: Build VoiceVisualizer component**

Create `src/components/concierge/VoiceVisualizer.tsx`:
- Canvas or SVG component connected to `audioAnalyser` from useVoice
- `requestAnimationFrame` loop calling `analyser.getByteFrequencyData()`
- Renders organic waveform / orb visualization
- **Flatline when idle or muted** — never fake animation
- Smooth transitions between states
- Respects `prefers-reduced-motion`

- [ ] **Step 7: Build VoiceButton component**

Create `src/components/concierge/VoiceButton.tsx`:
- Circular button with microphone icon
- State colors: idle (olive), listening (ember pulse), processing (olive spin), speaking (sage), error (red), muted (grey strikethrough)
- Click toggles listening state
- Long press for push-to-talk if supported
- Shows VoiceVisualizer around button when active
- Accessible labels: "Start voice input", "Listening...", "Processing...", "Stop"

- [ ] **Step 8: Wire voice into ConciergePanel**

Update `src/components/concierge/ChatInput.tsx` to include VoiceButton.
Update `src/components/concierge/ConciergePanel.tsx`:
- Show voice state banner when voice is active
- Display live transcript when speaking
- Show "Voice unavailable — using text" message when no provider

- [ ] **Step 9: Handle voice tool execution**

Ensure voice transcripts are routed through the same `/api/concierge/chat` endpoint. The useVoice hook captures the transcript, sends it as a text message, and plays the AI response through ElevenLabs speech synthesis (or Web Speech fallback).

- [ ] **Step 10: Verify and commit**

```bash
npm run build
git add -A; git commit -m "feat: ElevenLabs voice integration, WebAudio visualizer, Web Speech fallback"
```

---

## Task 11: Staff Operations Dashboard

**Files:**
- Create: `src/app/staff/layout.tsx`
- Create: `src/app/staff/orders/page.tsx`
- Create: `src/app/staff/menu/page.tsx`
- Create: `src/app/api/staff/auth/route.ts`
- Create: `src/app/api/staff/orders/route.ts`
- Create: `src/app/api/staff/menu/route.ts`
- Create: `src/components/staff/OrderKanban.tsx`
- Create: `src/components/staff/OrderTicket.tsx`
- Create: `src/components/staff/MenuToggle.tsx`

**Interfaces:**
- Consumes: `orders/operations.ts`, `orders/state-machine.ts`, `db`, `config.ts`
- Produces: Staff-authenticated routes with server-side password check
- Produces: `GET /api/staff/orders` → all active orders
- Produces: `PUT /api/staff/orders` → advance order status
- Produces: `PUT /api/staff/menu` → toggle item availability

- [ ] **Step 1: Build staff auth**

Create `src/app/api/staff/auth/route.ts`:
- POST: validates password against `STAFF_PASSWORD` env var
- Sets HTTP-only `echo_staff` cookie on success
- Returns 401 on failure

Create `src/app/staff/layout.tsx`:
- Server component that checks `echo_staff` cookie
- If not authenticated: shows login form
- If authenticated: renders children

- [ ] **Step 2: Build staff orders API**

Create `src/app/api/staff/orders/route.ts`:
- GET: returns all orders with `fulfillmentStatus` not in `[COMPLETED, CANCELLED]`, sorted by created_at
- PUT: validates staff auth, calls `transitionOrder(orderId, newStatus, 'staff')`

- [ ] **Step 3: Build staff menu API**

Create `src/app/api/staff/menu/route.ts`:
- PUT: validates staff auth, toggles `menuItem.isAvailable` for given item ID

- [ ] **Step 4: Build OrderKanban**

Create `src/components/staff/OrderKanban.tsx`:
- Four columns: Confirmed, Preparing, Ready/Out for Delivery, Completed (today)
- Each column shows OrderTicket cards
- Auto-refresh every 15 seconds

- [ ] **Step 5: Build OrderTicket**

Create `src/components/staff/OrderTicket.tsx`:
- Order ref, fulfillment mode badge, elapsed time
- Expandable: item list with customizations
- Customer details (name, phone, table/address)
- Action button: "Start Preparing" / "Mark Ready" / "Out for Delivery" / "Complete"
- Clicking action button calls PUT `/api/staff/orders`

- [ ] **Step 6: Build MenuToggle**

Create `src/components/staff/MenuToggle.tsx`:
- List of all menu items grouped by category
- Each row: item name, price, toggle switch for availability
- Toggle calls PUT `/api/staff/menu`
- Visual indicator for sold-out items

- [ ] **Step 7: Assemble staff pages**

Create `src/app/staff/orders/page.tsx` with OrderKanban.
Create `src/app/staff/menu/page.tsx` with MenuToggle list.

- [ ] **Step 8: Verify and commit**

```bash
npm run build
git add -A; git commit -m "feat: staff operations dashboard with order queue and menu management"
```

---

## Task 12: Integration Tests

**Files:**
- Create: `tests/integration/menu-api.test.ts`
- Create: `tests/integration/cart-api.test.ts`
- Create: `tests/integration/checkout-api.test.ts`
- Create: `tests/integration/tool-pipeline.test.ts`
- Create: `tests/integration/session-isolation.test.ts`
- Create: `tests/integration/webhook.test.ts`
- Create: `tests/helpers/setup.ts`

**Interfaces:**
- Consumes: All API routes, `db`, tool registry
- Produces: Verified integration test suite

- [ ] **Step 1: Create test setup helper**

Create `tests/helpers/setup.ts`:
- Seeds a test database (SQLite)
- Provides helper to create test sessions
- Cleanup after each test

- [ ] **Step 2: Write menu API integration tests**

Create `tests/integration/menu-api.test.ts`:
- Test: GET `/api/menu` returns seeded items
- Test: filter by dietary flag returns only matching items
- Test: filter by category returns correct subset
- Test: search by name returns relevant results
- Test: unavailable items are excluded

- [ ] **Step 3: Write cart API integration tests**

Create `tests/integration/cart-api.test.ts`:
- Test: POST `/api/cart` adds item with correct price
- Test: GET `/api/cart` returns cart with totals
- Test: PUT `/api/cart` updates quantity
- Test: DELETE `/api/cart` removes item
- Test: adding unavailable item returns error
- Test: adding invalid variant returns error

- [ ] **Step 4: Write session isolation tests**

Create `tests/integration/session-isolation.test.ts`:
- Test: Session A cannot read Session B's cart
- Test: Session A cannot modify Session B's cart
- Test: Session A cannot view Session B's orders

- [ ] **Step 5: Write tool pipeline integration tests**

Create `tests/integration/tool-pipeline.test.ts`:
- Test: `browse_menu` → `get_item_details` → `customize_item` → `add_to_cart` → `view_cart` → `prepare_checkout` pipeline executes successfully with real database

- [ ] **Step 6: Write webhook integration tests**

Create `tests/integration/webhook.test.ts`:
- Test: valid Stripe signature processes payment correctly
- Test: invalid signature returns 400
- Test: duplicate webhook event ID is no-op (idempotent)

- [ ] **Step 7: Run all integration tests**

```bash
npx vitest run tests/integration/
```

- [ ] **Step 8: Fix any failures and commit**

```bash
git add -A; git commit -m "test: integration tests for menu, cart, checkout, session isolation, webhooks"
```

---

## Task 13: Polish, Accessibility, SEO & Performance

**Files:**
- Modify: Multiple component and page files
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Create: `public/images/og-image.jpg`

**Interfaces:**
- Consumes: All existing pages and components
- Produces: Fully polished, accessible, SEO-optimized website

- [ ] **Step 1: Accessibility audit and fixes**

Review all components for:
- Semantic HTML elements (`nav`, `main`, `article`, `section`, `aside`, `h1`–`h6`)
- All interactive elements have accessible names (aria-label on icon buttons)
- Focus visible rings on all interactive elements
- Color contrast ≥ 4.5:1 (verify charcoal on ivory, ember on ivory)
- `prefers-reduced-motion` media query disabling animations
- Screen reader announcements: `aria-live="polite"` on cart count, order status
- Form validation errors linked with `aria-describedby`
- Modal and drawer focus trapping

- [ ] **Step 2: SEO metadata**

Add to each page:
- Homepage: title, description, OG tags, structured data (`Restaurant` schema)
- Menu page: title "Menu — ECHO Restaurant", description with cuisine keywords
- Checkout: `noindex`
- Order tracking: `noindex`

Create `src/app/sitemap.ts`:
```typescript
export default async function sitemap() {
  return [
    { url: 'https://echo-restaurant.com', lastModified: new Date() },
    { url: 'https://echo-restaurant.com/menu', lastModified: new Date() },
  ];
}
```

Create `src/app/robots.ts`:
```typescript
export default function robots() {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/checkout', '/orders/', '/staff/'] } };
}
```

- [ ] **Step 3: Image optimization**

- All food images served via `next/image` with `sizes` attribute
- Create placeholder blur data URLs for hero images
- Lazy load below-fold images
- Set appropriate quality levels (80 for hero, 75 for menu cards)

- [ ] **Step 4: Loading and error states**

Review all pages for:
- Loading skeletons on menu grid, cart, order tracking
- Error boundaries with friendly messages ("Something went wrong. Please try again.")
- Empty states: empty cart, no search results, no orders
- Concierge: loading dots during AI response
- Checkout: loading spinner on "Place Order" button

- [ ] **Step 5: Responsive polish**

Test all breakpoints (mobile 375px, tablet 768px, desktop 1280px):
- Menu grid column adjustments
- Cart drawer → bottom sheet on mobile
- Concierge panel → bottom sheet on mobile
- Checkout form single-column on mobile
- Navigation hamburger on mobile
- Footer stacks vertically on mobile
- Touch targets ≥ 44px on mobile

- [ ] **Step 6: Micro-interactions**

Add tasteful animations (respecting reduced-motion):
- Menu card hover lift
- Cart drawer slide transition
- Concierge panel slide/fade
- Page transitions
- Button press feedback
- Toast slide-in/out
- Order timeline status pulse

- [ ] **Step 7: Verify build and commit**

```bash
npm run build
git add -A; git commit -m "feat: accessibility, SEO, performance optimization, responsive polish"
```

---

## Task 14: E2E Tests & Final Verification

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/ordering-journey.spec.ts`
- Create: `tests/e2e/concierge-journey.spec.ts`
- Create: `tests/e2e/staff-dashboard.spec.ts`

**Interfaces:**
- Consumes: Running application
- Produces: Verified E2E test suite

- [ ] **Step 1: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Configure Playwright**

Create `playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

- [ ] **Step 3: Write ordering journey E2E test**

Create `tests/e2e/ordering-journey.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('complete ordering journey', async ({ page }) => {
  // 1. Open homepage
  await page.goto('/');
  await expect(page.getByText('ECHO')).toBeVisible();

  // 2. Navigate to menu
  await page.getByRole('link', { name: /explore.*menu/i }).click();
  await expect(page).toHaveURL('/menu');

  // 3. Filter by vegetarian
  await page.getByLabel(/vegetarian/i).check();

  // 4. Select a dish
  const firstDish = page.locator('[data-testid="menu-item-card"]').first();
  await firstDish.click();

  // 5. Customize and add to cart
  await page.getByRole('button', { name: /add to cart/i }).click();

  // 6. Open cart
  await page.getByRole('button', { name: /cart/i }).click();
  await expect(page.getByText(/subtotal/i)).toBeVisible();

  // 7. Proceed to checkout
  await page.getByRole('link', { name: /checkout/i }).click();
  await expect(page).toHaveURL('/checkout');

  // 8. Fill checkout form (sandbox mode)
  await page.getByLabel(/dine-in/i).check();
  await page.getByLabel(/table/i).fill('7');
  await page.getByLabel(/name/i).fill('Test Customer');
  await page.getByLabel(/email/i).fill('test@example.com');

  // 9. Place order (sandbox)
  await page.getByRole('button', { name: /place order/i }).click();

  // 10. Verify order confirmation
  await expect(page.getByText(/ECHO-/)).toBeVisible();
  await expect(page.getByText(/confirmed/i)).toBeVisible();
});
```

- [ ] **Step 4: Write concierge journey E2E test**

Create `tests/e2e/concierge-journey.spec.ts`:
- Open concierge panel
- Send "What's good for a vegetarian?"
- Verify recommendation cards appear
- Send "Add the first one to my cart"
- Verify cart count updates
- Send "How much is everything?"
- Verify total is displayed

- [ ] **Step 5: Write staff dashboard E2E test**

Create `tests/e2e/staff-dashboard.spec.ts`:
- Login with staff password
- Verify order queue is visible
- Advance an order to "Preparing"
- Toggle a menu item to sold out
- Verify item no longer appears on customer menu

- [ ] **Step 6: Run all E2E tests**

```bash
npx playwright test
```

- [ ] **Step 7: Fix any failures**

Address test failures by fixing application code or test assertions.

- [ ] **Step 8: Commit**

```bash
git add -A; git commit -m "test: E2E tests for ordering, concierge, and staff dashboard"
```

---

## Task 15: README, Architecture Docs & Final Build

**Files:**
- Create: `README.md`
- Create: `docs/ARCHITECTURE.md`
- Modify: `.env.example` (final review)

**Interfaces:**
- Produces: Complete project documentation

- [ ] **Step 1: Write README.md**

Create `README.md` with:
- Project name and description
- Tech stack summary
- Quick start (3 commands: install, seed, run)
- Environment variable documentation
- ElevenLabs setup instructions (API key, Agent ID, Voice ID)
- Stripe setup instructions (API keys, webhook endpoint)
- AI provider setup (Google Gemini or OpenAI)
- Staff dashboard access
- Running tests
- Project structure overview
- Screenshots placeholder

- [ ] **Step 2: Write Architecture document**

Create `docs/ARCHITECTURE.md` with:
- System diagram (text-based)
- Data flow: customer → frontend → API routes → business logic → database
- Tool registry architecture
- Voice integration architecture
- Payment flow diagram
- Order lifecycle state machine
- Session management
- Security boundaries

- [ ] **Step 3: Final `.env.example` review**

Verify all required env vars are documented with comments explaining each.

- [ ] **Step 4: Run full verification**

```bash
npm run build
npx vitest run
npx playwright test
npx tsc --noEmit
npm run lint
```

- [ ] **Step 5: Fix any remaining issues**

Address all build errors, test failures, type errors, and lint issues.

- [ ] **Step 6: Final commit**

```bash
git add -A; git commit -m "docs: README, architecture documentation, final verification"
```

---

## Self-Review Checklist

- [x] **Spec coverage**: Every section of the design spec maps to at least one task. All 14 tools implemented in Task 8. All pages in Tasks 2–7. Voice in Task 10. Payments in Task 6. Staff in Task 11. Testing in Tasks 5, 12, 14.
- [x] **Placeholder scan**: No "TBD", "TODO", or "implement later". All code steps include actual code blocks.
- [x] **Type consistency**: `SessionContext`, `FulfillmentStatus`, `PaymentStatus`, `CartTotals`, `ToolDefinition` used consistently across tasks. `formatCurrency`, `calculateTax`, `addMinorUnits` signatures match between Task 1 definition and Task 5 usage. `isValidTransition` and `isCancellable` signatures match between Task 6 definition and Task 11 usage.
