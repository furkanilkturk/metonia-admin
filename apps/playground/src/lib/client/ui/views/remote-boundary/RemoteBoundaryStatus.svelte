<script lang="ts">
	import type { RemoteBoundarySnapshot } from '$lib/shared/types/remoteBoundary.js';

	interface Props {
		snapshot: RemoteBoundarySnapshot;
	}

	let { snapshot }: Props = $props();
</script>

<section aria-labelledby="remote-boundary-heading">
	<p class="eyebrow">Boundary proof / explicit experiment</p>
	<h1 id="remote-boundary-heading">SvelteKit Remote Functions</h1>
	<p>{snapshot.message}</p>

	<dl>
		<div>
			<dt>Support status</dt>
			<dd>{snapshot.status}</dd>
		</div>
		<div>
			<dt>Data mode</dt>
			<dd><code>{snapshot.mode}</code></dd>
		</div>
		<div>
			<dt>Server check</dt>
			<dd><time datetime={snapshot.checkedAt}>{snapshot.checkedAt}</time></dd>
		</div>
	</dl>

	<aside aria-label="Remote Functions limitation">
		<strong>Not a production-readiness claim.</strong>
		This generated experiment proves a validated query boundary only. Authentication,
		authorization, and Remote Functions Users CRUD parity are not included.
	</aside>
</section>

<style>
	section {
		max-width: 52rem;
		margin: 0 auto;
		padding: clamp(2rem, 7vw, 5rem) 1.25rem;
		font-family: system-ui, sans-serif;
		color: #172120;
	}

	.eyebrow {
		margin: 0 0 0.75rem;
		font-family: ui-monospace, monospace;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #0b7f79;
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 6vw, 3.75rem);
		line-height: 1;
	}

	dl {
		display: grid;
		gap: 1px;
		margin: 2rem 0;
		background: #cbd8d6;
		border: 1px solid #cbd8d6;
	}

	dl div {
		display: grid;
		grid-template-columns: minmax(8rem, 0.45fr) 1fr;
		gap: 1rem;
		padding: 1rem;
		background: #f7faf9;
	}

	dt {
		font-weight: 700;
	}

	dd {
		margin: 0;
		overflow-wrap: anywhere;
	}

	aside {
		padding: 1rem;
		border-left: 0.25rem solid #c64f1a;
		background: #fff5ef;
	}

	aside strong {
		display: block;
		margin-bottom: 0.25rem;
	}

	@media (max-width: 36rem) {
		dl div {
			grid-template-columns: 1fr;
			gap: 0.25rem;
		}
	}
</style>
