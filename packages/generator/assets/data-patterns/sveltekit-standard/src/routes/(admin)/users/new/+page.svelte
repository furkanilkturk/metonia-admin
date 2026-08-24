<script lang="ts">
	import UserCreatePage from '$lib/client/ui/pages/users/UserCreatePage.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<UserCreatePage {form} />
