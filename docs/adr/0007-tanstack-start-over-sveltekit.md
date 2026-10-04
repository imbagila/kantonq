# TanStack Start (React) instead of SvelteKit

SvelteKit was the first choice for speed, but the official shadcn/ui is React-only, and the Svelte version is a community port. We use TanStack Start with React to get the official shadcn and the whole TanStack family, including TanStack DB for the offline data layer (ADR 0002). Speed comes from client-only app pages reading a local database, which makes framework rendering cost a small factor.
