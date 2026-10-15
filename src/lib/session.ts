import { cookies } from "next/headers";
import { db } from "./db";
import { v4 as uuid } from "uuid";

const SESSION_COOKIE = "echo_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export async function getOrCreateSession(): Promise<{ sessionId: string }> {
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get(SESSION_COOKIE)?.value;

  if (existingCookie) {
    const existingSession = await db.guestSession.findUnique({
      where: { id: existingCookie },
    });
    if (existingSession) {
      return { sessionId: existingSession.id };
    }
  }

  // Create new guest session and associate an empty cart
  const newSessionId = uuid();
  await db.guestSession.create({
    data: {
      id: newSessionId,
      cart: {
        create: {},
      },
    },
  });

  cookieStore.set(SESSION_COOKIE, newSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return { sessionId: newSessionId };
}
