<script lang="ts">
	import UserDetailPage from '$lib/client/ui/pages/users/UserDetailPage.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<UserDetailPage user={data.user} {form} />
