<script lang="ts">
	import ErrorPage from '$lib/client/ui/pages/error.svelte';
	import { page } from '$app/state';
</script>

<ErrorPage status={page.status} message={page.error?.message} />
