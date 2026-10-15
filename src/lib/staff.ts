import { cookies } from "next/headers";

export const STAFF_COOKIE = "echo_staff_token";
export const STAFF_TOKEN_VALUE = "authorized-hearth-staff";

export async function isStaffAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE)?.value;
  return token === STAFF_TOKEN_VALUE;
}
