const ADMIN_PASSWORD = "sigma67eeshan";
const ADMIN_SESSION_KEY = "tuitions_admin_session";

export function adminLogin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    return true;
  }
  return false;
}

export function isAdminLoggedIn(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function adminLogout(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
