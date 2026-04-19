/**
 * auth.js — shared auth helpers loaded on every page.
 * Redirects unauthenticated users and provides logout().
 */

// Pages that don't need a token
const PUBLIC_PATHS = ["/", "/login", "/signup"];

(function guardRoute() {
  const path  = window.location.pathname;
  const token = localStorage.getItem("token");

  if (!PUBLIC_PATHS.includes(path) && !token) {
    window.location.replace("/login");
  }
  if (PUBLIC_PATHS.includes(path) && token) {
    window.location.replace("/dashboard");
  }
})();

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.replace("/login");
}

/** Returns headers with JWT Bearer token for fetch calls. */
function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
  };
}
