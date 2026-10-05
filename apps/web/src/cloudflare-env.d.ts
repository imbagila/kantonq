declare module "cloudflare:workers" {
  export const env: {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    API_URL: string;
  };
}
