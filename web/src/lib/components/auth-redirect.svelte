<script lang="ts">
	/**
	 * Auth Redirect Component
	 * Used on the root page to redirect based on auth status
	 * - If authenticated: redirect to dashboard
	 * - If not authenticated: redirect to login
	 */
	import { onMount } from "svelte";
	import { auth, isAuthenticated, isLoading } from "$lib/stores/auth";
	import LoaderCircle from "@lucide/svelte/icons/loader-circle";

	interface Props {
		authenticatedRedirect?: string;
		unauthenticatedRedirect?: string;
	}

	let {
		authenticatedRedirect = "/dashboard",
		unauthenticatedRedirect = "/login"
	}: Props = $props();

	let mounted = $state(false);

	onMount(() => {
		// Initialize auth state from localStorage
		auth.init();
		mounted = true;
	});

	// Watch for authentication changes and redirect
	$effect(() => {
		if (mounted && !$isLoading) {
			if ($isAuthenticated) {
				window.location.href = authenticatedRedirect;
			} else {
				window.location.href = unauthenticatedRedirect;
			}
		}
	});
</script>

<div class="flex min-h-svh items-center justify-center bg-background">
	<div class="flex flex-col items-center gap-4">
		<LoaderCircle class="size-8 animate-spin text-primary" />
		<p class="text-muted-foreground text-sm">
			{#if !mounted || $isLoading}
				Checking authentication...
			{:else if $isAuthenticated}
				Redirecting to dashboard...
			{:else}
				Redirecting to login...
			{/if}
		</p>
	</div>
</div>
