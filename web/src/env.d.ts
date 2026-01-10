/// <reference types="astro/client" />

// Svelte 5 components with $props() runes aren't properly typed by @astrojs/svelte shims.
// Override the PropsWithClientDirectives to accept any props.
declare module "@astrojs/svelte/svelte-shims.d.ts" {
  import type { JSX } from "astro/jsx-runtime";
  export type AstroClientDirectives = JSX.AstroComponentDirectives;
  export type StripNeverIndexSignatures<T> = T;
  export type PropsWithClientDirectives<T> = Record<string, any> &
    AstroClientDirectives;
}
