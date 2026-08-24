<script lang="ts">
	import UsersPage from '$lib/client/ui/pages/users/UsersPage.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<UsersPage result={data.result} />
