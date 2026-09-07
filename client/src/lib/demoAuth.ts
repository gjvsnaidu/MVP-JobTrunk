/**
 * One-click hackathon demo login. Calls the demo-login endpoint, which mints
 * a session cookie for a seeded demo account (student / industry / institution
 * / admin / academician), then navigates to that role's dashboard.
 */
export async function demoLogin(role: string): Promise<string> {
  const res = await fetch("/api/auth/demo-login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Demo login failed");
  return data.redirect ?? "/dashboard";
}

export async function demoLoginAndGo(role: string) {
  const redirect = await demoLogin(role);
  window.location.href = redirect;
}