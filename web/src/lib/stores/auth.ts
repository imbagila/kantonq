/**
 * Auth Store - Client-side authentication state management
 * Uses localStorage for session persistence
 */

import { writable, derived, get } from 'svelte/store';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: GoogleUser | null;
  accessToken: string | null;
  error: string | null;
}

const AUTH_STORAGE_KEY = 'kantonq_auth';

function createAuthStore() {
  const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    accessToken: null,
    error: null,
  };

  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,

    /**
     * Initialize auth state from localStorage
     * Call this on app startup
     */
    init: () => {
      if (typeof window === 'undefined') return;

      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Check if token is still valid (basic check)
          if (parsed.accessToken && parsed.user) {
            update(state => ({
              ...state,
              isAuthenticated: true,
              isLoading: false,
              user: parsed.user,
              accessToken: parsed.accessToken,
            }));
            return;
          }
        }
      } catch (e) {
        console.error('Failed to restore auth state:', e);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }

      update(state => ({ ...state, isLoading: false }));
    },

    /**
     * Set authenticated user after successful Google OAuth
     */
    setUser: (user: GoogleUser, accessToken: string) => {
      const authData = { user, accessToken };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

      update(state => ({
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user,
        accessToken,
        error: null,
      }));
    },

    /**
     * Set loading state
     */
    setLoading: (isLoading: boolean) => {
      update(state => ({ ...state, isLoading }));
    },

    /**
     * Set error state
     */
    setError: (error: string) => {
      update(state => ({
        ...state,
        isLoading: false,
        error,
      }));
    },

    /**
     * Clear error state
     */
    clearError: () => {
      update(state => ({ ...state, error: null }));
    },

    /**
     * Logout - clear auth state and localStorage
     */
    logout: () => {
      localStorage.removeItem(AUTH_STORAGE_KEY);

      // Revoke Google token if possible
      if (typeof google !== 'undefined' && google.accounts) {
        const currentState = get({ subscribe });
        if (currentState.accessToken) {
          google.accounts.oauth2.revoke(currentState.accessToken, () => {
            console.log('Token revoked');
          });
        }
      }

      set({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        accessToken: null,
        error: null,
      });
    },

    /**
     * Get current auth state (for non-reactive access)
     */
    getState: (): AuthState => {
      return get({ subscribe });
    },
  };
}

export const auth = createAuthStore();

// Derived stores for convenience
export const isAuthenticated = derived(auth, $auth => $auth.isAuthenticated);
export const isLoading = derived(auth, $auth => $auth.isLoading);
export const user = derived(auth, $auth => $auth.user);
export const authError = derived(auth, $auth => $auth.error);
