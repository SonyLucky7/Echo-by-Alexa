import { z } from "zod";

const configSchema = z.object({
  databaseUrl: z.string().default("file:./dev.db"),
  appUrl: z.string().default("http://localhost:3000"),
  baseCurrency: z.string().length(3).default("USD"),
  taxRateBps: z.coerce.number().int().min(0).max(5000).default(825),
  aiModel: z.string().default("gemini-2.0-flash"),
  googleAiKey: z.string().optional(),
  openaiKey: z.string().optional(),
  elevenLabsKey: z.string().optional(),
  elevenLabsAgentId: z.string().optional(),
  elevenLabsVoiceId: z.string().default("tm4rC0Q4St1T4Nq6wyLZ"),
  stripeSecretKey: z.string().optional(),
  stripePublishableKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
  staffPassword: z.string().default("echo-hearth-pass"),
});

export type AppConfig = z.infer<typeof configSchema>;

let _config: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (_config) return _config;
  _config = configSchema.parse({
    databaseUrl: process.env.DATABASE_URL || "file:./dev.db",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    baseCurrency: process.env.RESTAURANT_BASE_CURRENCY || "USD",
    taxRateBps: process.env.RESTAURANT_TAX_RATE_BPS || 825,
    aiModel: process.env.AI_MODEL || "gemini-2.0-flash",
    googleAiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
    elevenLabsKey: process.env.ELEVENLABS_API_KEY,
    elevenLabsAgentId: process.env.ELEVENLABS_AGENT_ID,
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID || "tm4rC0Q4St1T4Nq6wyLZ",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    staffPassword: process.env.STAFF_PASSWORD || "echo-hearth-pass",
  });
  return _config;
}

export function hasAiProvider(): boolean {
  const c = getConfig();
  return Boolean(c.googleAiKey || c.openaiKey);
}

export function hasVoiceProvider(): boolean {
  return Boolean(getConfig().elevenLabsKey);
}

export function hasPaymentProvider(): boolean {
  return Boolean(getConfig().stripeSecretKey);
}
