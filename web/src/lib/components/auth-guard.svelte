<script lang="ts">
	/**
	 * Auth Guard Component
	 * Protects routes by checking authentication status
	 * Redirects to login page if not authenticated
	 */
	import type { Snippet } from "svelte";
	import { onMount } from "svelte";
	import { auth, isAuthenticated, isLoading } from "$lib/stores/auth";
	import LoaderCircle from "@lucide/svelte/icons/loader-circle";

	interface Props {
		redirectTo?: string;
		children?: Snippet;
	}

	let { redirectTo = "/login", children }: Props = $props();

	let mounted = $state(false);

	onMount(() => {
		// Initialize auth state from localStorage
		auth.init();
		mounted = true;
	});

	// Watch for authentication changes
	$effect(() => {
		if (mounted && !$isLoading && !$isAuthenticated) {
			window.location.href = redirectTo;
		}
	});
</script>

{#if !mounted || $isLoading}
	<!-- Loading state -->
	<div class="flex min-h-svh items-center justify-center bg-background">
		<div class="flex flex-col items-center gap-4">
			<LoaderCircle class="size-8 animate-spin text-primary" />
			<p class="text-muted-foreground text-sm">Loading...</p>
		</div>
	</div>
{:else if $isAuthenticated}
	<!-- Render protected content -->
	{@render children?.()}
{:else}
	<!-- Redirecting state -->
	<div class="flex min-h-svh items-center justify-center bg-background">
		<div class="flex flex-col items-center gap-4">
			<LoaderCircle class="size-8 animate-spin text-primary" />
			<p class="text-muted-foreground text-sm">Redirecting to login...</p>
		</div>
	</div>
{/if}
