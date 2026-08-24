<script lang="ts">
	import UserEditPage from '$lib/client/ui/pages/users/UserEditPage.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<UserEditPage user={data.user} {form} />
