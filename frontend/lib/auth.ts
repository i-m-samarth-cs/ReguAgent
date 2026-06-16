import Cookies from "js-cookie";
import { login as apiLogin, getMe } from "./api";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
  department_id: number | null;
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const data = await apiLogin(email, password);
  Cookies.set("ra_token", data.access_token, { expires: 1 });
  return data.user;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const token = Cookies.get("ra_token");
  if (!token) return null;
  try {
    return await getMe();
  } catch {
    Cookies.remove("ra_token");
    return null;
  }
}

export function signOut() {
  Cookies.remove("ra_token");
  window.location.href = "/login";
}

export function getToken(): string | undefined {
  return Cookies.get("ra_token");
}
