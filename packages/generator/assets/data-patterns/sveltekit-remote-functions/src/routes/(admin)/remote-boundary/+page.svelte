<script lang="ts">
	import RemoteBoundaryPage from '$lib/client/ui/pages/RemoteBoundaryPage.svelte';

	import { readRemoteBoundary } from './remote-boundary.remote.js';
</script>

<RemoteBoundaryPage snapshot={await readRemoteBoundary({ surface: 'admin-workbench' })} />
