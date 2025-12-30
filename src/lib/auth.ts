export const AUTH_TOKEN_KEY = "token";

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export function logOut() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

