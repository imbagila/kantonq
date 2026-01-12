/**
 * Google OAuth Service
 * Handles Google Identity Services (GIS) integration for client-side OAuth
 */

import { auth, type GoogleUser } from "$lib/stores/auth";

// Google OAuth configuration
interface GoogleOAuthConfig {
  clientId: string;
  scopes?: string[];
}

// Default scopes for Google OAuth
const DEFAULT_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let isGsiLoaded = false;

/**
 * Load Google Identity Services script
 */
export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isGsiLoaded) {
      resolve();
      return;
    }

    if (typeof window === "undefined") {
      reject(new Error("Window is not defined"));
      return;
    }

    // Check if script already exists
    const existingScript = document.getElementById("google-gsi-script");
    if (existingScript) {
      isGsiLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isGsiLoaded = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error("Failed to load Google Identity Services"));
    };

    document.head.appendChild(script);
  });
}

/**
 * Initialize Google OAuth client
 */
export async function initGoogleOAuth(
  config: GoogleOAuthConfig,
): Promise<void> {
  await loadGoogleScript();

  const { clientId, scopes = DEFAULT_SCOPES } = config;

  if (!clientId) {
    throw new Error("Google Client ID is required");
  }

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: scopes.join(" "),
    callback: handleTokenResponse,
    error_callback: handleTokenError,
  });
}

/**
 * Handle successful token response
 */
async function handleTokenResponse(
  response: google.accounts.oauth2.TokenResponse,
) {
  if (response.error) {
    auth.setError(response.error);
    return;
  }

  try {
    // Fetch user info from Google
    const userInfo = await fetchGoogleUserInfo(response.access_token);
    auth.setUser(userInfo, response.access_token);
  } catch (error) {
    auth.setError("Failed to fetch user information");
    console.error("Error fetching user info:", error);
  }
}

/**
 * Handle token error
 */
function handleTokenError(error: google.accounts.oauth2.ClientConfigError) {
  console.error("Google OAuth error:", error);
  auth.setError(error.message || "Authentication failed");
}

/**
 * Fetch user info from Google API
 */
async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUser> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user info");
  }

  const data = await response.json();

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
    given_name: data.given_name,
    family_name: data.family_name,
  };
}

/**
 * Trigger Google OAuth login flow
 */
export function loginWithGoogle(): void {
  if (!tokenClient) {
    auth.setError("Google OAuth not initialized");
    return;
  }

  auth.setLoading(true);
  auth.clearError();

  // Request access token
  tokenClient.requestAccessToken({ prompt: "consent" });
}

/**
 * Logout from Google
 */
export function logoutFromGoogle(): void {
  auth.logout();
}

/**
 * Check if user is authenticated
 */
export function checkAuth(): boolean {
  const state = auth.getState();
  return state.isAuthenticated;
}
