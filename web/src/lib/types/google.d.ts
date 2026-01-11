/**
 * Type definitions for Google Identity Services
 */

declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenClient {
        requestAccessToken(options?: { prompt?: string }): void;
      }

      interface TokenResponse {
        access_token: string;
        expires_in: number;
        scope: string;
        token_type: string;
        error?: string;
        error_description?: string;
        error_uri?: string;
      }

      interface ClientConfigError {
        type: string;
        message: string;
      }

      interface TokenClientConfig {
        client_id: string;
        callback: (response: TokenResponse) => void;
        scope: string;
        prompt?: string;
        error_callback?: (error: ClientConfigError) => void;
      }

      function initTokenClient(config: TokenClientConfig): TokenClient;
      function revoke(token: string, callback?: () => void): void;
    }
  }
}
