<script lang="ts">
	import type { RemoteBoundarySnapshot } from '$lib/shared/types/remoteBoundary.js';

	import RemoteBoundaryStatus from '../views/remote-boundary/RemoteBoundaryStatus.svelte';

	interface Props {
		snapshot: RemoteBoundarySnapshot;
	}

	let { snapshot }: Props = $props();
</script>

<svelte:head>
	<title>Remote boundary · Metonia Admin</title>
</svelte:head>

<RemoteBoundaryStatus {snapshot} />
