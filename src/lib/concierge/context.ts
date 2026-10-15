import { db } from "@/lib/db";

export interface ConciergeSessionContext {
  conversationId: string;
  locale: string;
  preferences: Record<string, any>;
  recentMessages: {
    role: "user" | "assistant" | "system";
    content: string;
    toolCalls?: any;
    toolResults?: any;
  }[];
}

export async function getOrCreateConversation(
  sessionId: string,
  locale: string = "en"
): Promise<ConciergeSessionContext> {
  // Ensure the guest session exists in DB
  await db.guestSession.upsert({
    where: { id: sessionId },
    update: {},
    create: { id: sessionId },
  });

  let conversation = await db.conversation.findFirst({
    where: { guestSessionId: sessionId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 30,
      },
    },
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        guestSessionId: sessionId,
        locale,
        preferences: "{}",
      },
      include: {
        messages: true,
      },
    });
  } else if (locale && conversation.locale !== locale) {
    conversation = await db.conversation.update({
      where: { id: conversation.id },
      data: { locale },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 30,
        },
      },
    });
  }

  let prefs: Record<string, any> = {};
  try {
    prefs = JSON.parse(conversation.preferences || "{}");
  } catch {}

  const recentMessages = conversation.messages.map((m) => {
    let toolCalls = undefined;
    let toolResults = undefined;
    try {
      if (m.toolCalls) toolCalls = JSON.parse(m.toolCalls);
      if (m.toolResults) toolResults = JSON.parse(m.toolResults);
    } catch {}
    return {
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
      toolCalls,
      toolResults,
    };
  });

  return {
    conversationId: conversation.id,
    locale: conversation.locale,
    preferences: prefs,
    recentMessages,
  };
}

export async function recordMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string,
  toolCalls?: any,
  toolResults?: any
) {
  return db.conversationMessage.create({
    data: {
      conversationId,
      role,
      content,
      toolCalls: toolCalls ? JSON.stringify(toolCalls) : null,
      toolResults: toolResults ? JSON.stringify(toolResults) : null,
    },
  });
}

export async function updatePreferences(
  conversationId: string,
  newPrefs: Record<string, any>
) {
  const conv = await db.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conv) return;

  let currentPrefs: Record<string, any> = {};
  try {
    currentPrefs = JSON.parse(conv.preferences || "{}");
  } catch {}

  const merged = { ...currentPrefs, ...newPrefs };
  return db.conversation.update({
    where: { id: conversationId },
    data: {
      preferences: JSON.stringify(merged),
    },
  });
}
