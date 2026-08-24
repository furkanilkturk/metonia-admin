<script lang="ts">
	import ChoiceField from '$lib/client/ui/components/ChoiceField.svelte';
	import CodePanel from '$lib/client/ui/components/CodePanel.svelte';
	import RecipeTrace from '$lib/client/ui/components/RecipeTrace.svelte';
	import {
		choicesFor,
		initialDraft,
		previewCommand,
		previewModule,
		resolveDraft,
		type WebsiteDraft
	} from '$lib/shared/configurator';

	let draft = $state<WebsiteDraft>(initialDraft());
	let copied = $state('');
	let result = $derived(resolveDraft(draft));
	let config = $derived(result.ok ? result.config : undefined);
	let themeChoices = $derived(choicesFor('ui.theme', draft));
	let providerChoices = $derived(choicesFor('database.provider', draft));
	let driverChoices = $derived(choicesFor('database.driver', draft));
	let trace = $derived(
		config
			? [
					config.ui.adapter,
					config.ui.theme,
					config.dataPattern,
					config.database.dialect,
					config.docker ? 'Docker' : 'No Docker'
				]
			: ['Resolve configuration']
	);

	function update<K extends keyof WebsiteDraft>(key: K, value: WebsiteDraft[K]) {
		draft[key] = value;
		if (key === 'uiAdapter') {
			draft.uiTheme = choicesFor('ui.theme', draft).find((choice) => choice.selectable)?.id ?? '';
		}
		if (key === 'dialect') {
			draft.provider =
				choicesFor('database.provider', draft).find((choice) => choice.selectable)?.id ?? '';
			draft.driver =
				choicesFor('database.driver', draft).find((choice) => choice.selectable)?.id ?? '';
		}
		if (key === 'provider') {
			draft.driver =
				choicesFor('database.driver', draft).find((choice) => choice.selectable)?.id ?? '';
		}
		copied = '';
	}

	async function copy(value: string, target: string) {
		try {
			if (!navigator.clipboard) throw new Error('Clipboard unavailable');
			await navigator.clipboard.writeText(value);
			copied = target;
		} catch {
			copied = 'error';
		}
	}
</script>

<section class="configurator" aria-labelledby="configurator-title">
	<header class="configurator-head">
		<div>
			<p class="eyebrow">Interactive assembly desk</p>
			<h2 id="configurator-title">Build the recipe. Inspect the output.</h2>
		</div>
		<p class="registry-note"><span aria-hidden="true"></span>Registry-linked</p>
	</header>
	<p class="lede">
		Every option comes from the same capability catalog as the CLI. Unsupported choices stay in
		view, with selection disabled and their status left intact.
	</p>

	<div class="workbench">
		<div class="controls">
			<section class="station" aria-labelledby="station-project">
				<header><span>01</span><div><h3 id="station-project">Project</h3><p>Name the starter and choose its command runner.</p></div></header>
				<div class="station-body">
					<div class="project-field">
						<div><label for="project-name">Project name</label><p id="project-name-help">Lowercase letters, numbers, and hyphens.</p></div>
						<input bind:value={draft.projectName} aria-describedby="project-name-help" id="project-name" autocomplete="off" spellcheck="false" />
					</div>
					<ChoiceField id="package-manager" label="Package manager" description="Controls generated install and script commands." value={draft.packageManager} options={choicesFor('packageManager', draft)} onchange={(value) => update('packageManager', value)} />
				</div>
			</section>

			<section class="station" aria-labelledby="station-interface">
				<header><span>02</span><div><h3 id="station-interface">Interface</h3><p>Pair a verified UI adapter with one of its own themes.</p></div></header>
				<div class="station-body">
					<ChoiceField id="ui-adapter" label="UI adapter" description="Unavailable integrations stay visible and disabled." value={draft.uiAdapter} options={choicesFor('ui.adapter', draft)} onchange={(value) => update('uiAdapter', value)} />
					<ChoiceField id="ui-theme" label="Theme" description="Theme support belongs to the selected adapter." value={draft.uiTheme} options={themeChoices} onchange={(value) => update('uiTheme', value)} />
				</div>
			</section>

			<section class="station" aria-labelledby="station-boundary">
				<header><span>03</span><div><h3 id="station-boundary">Data boundary</h3><p>Choose how pages reach server-side application code.</p></div></header>
				<div class="station-body">
					<ChoiceField id="data-pattern" label="Boundary" description="Standard SvelteKit is the native default; Remote Functions remain experimental." value={draft.dataPattern} options={choicesFor('dataPattern', draft)} onchange={(value) => update('dataPattern', value)} />
					<ChoiceField id="validation" label="Validation" description="Shared schemas, enforced again at the server boundary." value={draft.validation} options={choicesFor('validation', draft)} onchange={(value) => update('validation', value)} />
				</div>
			</section>

			<section class="station" aria-labelledby="station-persistence">
				<header><span>04</span><div><h3 id="station-persistence">Persistence</h3><p>Keep ORM, dialect, provider, and driver as separate choices.</p></div></header>
				<div class="station-body">
					<ChoiceField id="orm" label="ORM" description="Persistence code stays in $lib/server." value={draft.orm} options={choicesFor('orm', draft)} onchange={(value) => update('orm', value)} />
					<ChoiceField id="database-dialect" label="Dialect" description="The database language, independent from hosting." value={draft.dialect} options={choicesFor('database.dialect', draft)} onchange={(value) => update('dialect', value)} />
					<ChoiceField id="database-provider" label="Provider" description="Providers are filtered by the selected dialect." value={draft.provider} options={providerChoices} onchange={(value) => update('provider', value)} />
					<ChoiceField id="database-driver" label="Driver" description="Drivers are filtered by the selected provider." value={draft.driver} options={driverChoices} onchange={(value) => update('driver', value)} />
				</div>
			</section>

			<fieldset class="station starter-options">
				<legend><span>05</span><strong>Starter options</strong></legend>
				<label class="switch"><input bind:checked={draft.docker} type="checkbox" /><span><strong>Generate Docker support</strong><small>Optional; this does not imply a hosted deployment target.</small></span></label>
				<label class="switch"><input bind:checked={draft.users} type="checkbox" /><span><strong>Include the Users example</strong><small>The canonical shared, server, and client CRUD resource.</small></span></label>
			</fieldset>
		</div>

		<aside class="output" aria-label="Generated project preview">
			<div class="output-head">
				<div><p class="eyebrow">Resolved output</p><h3>{draft.projectName || 'Untitled project'}</h3></div>
				<span class:unresolved={!result.ok} class="resolution"><i aria-hidden="true"></i>{result.ok ? 'Ready to generate' : 'Needs attention'}</span>
			</div>
			<div class="trace-wrap"><RecipeTrace labels={trace} compact /></div>

			<div class="project-preview" aria-label="Generated architecture preview">
				<p>Generated SvelteKit structure</p>
				<div class="tree">
					<span>src/lib/</span>
					<strong>├─ client/</strong><small>UI · views · pages</small>
					<strong>├─ shared/</strong><small>schemas · types</small>
					<strong>└─ server/</strong><small>repositories · services</small>
				</div>
				<div class="ownership"><span>Metonia runtime</span><strong>Not required</strong></div>
			</div>

			<div aria-live="polite">
				{#if result.ok}
					{#if config?.warnings.length}
						<div class="warnings" role="status"><strong>Selection notes</strong><ul>{#each config.warnings as warning (`${warning.code}-${warning.path}-${warning.message}`)}<li>{warning.message}</li>{/each}</ul></div>
					{/if}
				{:else}
					<div class="warnings error" role="alert"><strong>Resolve this configuration</strong><p>Change one of the conflicting selections in the numbered stations.</p><ul>{#each result.issues as issue (`${issue.code}-${issue.path}-${issue.message}`)}<li>{issue.message}</li>{/each}</ul></div>
				{/if}
			</div>

			<div class="previews">
				<CodePanel label={copied === 'command' ? 'Command copied' : 'CLI command'} code={previewCommand(config)} oncopy={() => copy(previewCommand(config), 'command')} />
				<CodePanel label={copied === 'config' ? 'Config copied' : 'metonia-admin.config.ts'} code={previewModule(config)} oncopy={() => copy(previewModule(config), 'config')} />
			</div>
			<p aria-live="polite" class="sr-only">{copied === 'error' ? 'Clipboard access is unavailable.' : copied ? `${copied} preview copied.` : ''}</p>
		</aside>
	</div>
</section>

<style>
	.configurator {
		background: var(--color-card);
		border: 1px solid var(--color-border-strong);
		box-shadow: 10px 10px 0 var(--color-primary-soft);
		padding: clamp(1rem, 2.5vw, 2rem);
	}

	.configurator-head {
		align-items: flex-start;
		display: flex;
		gap: 1rem;
		justify-content: space-between;
	}

	.eyebrow {
		color: var(--color-primary);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.09em;
		margin: 0;
		text-transform: uppercase;
	}

	h2 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: clamp(1.6rem, 3vw, 2.35rem);
		letter-spacing: -0.045em;
		line-height: 1.05;
		margin: 0.45rem 0 0;
	}

	.lede {
		color: var(--color-muted-foreground);
		line-height: 1.5;
		margin: 0.9rem 0 1.5rem;
		max-width: 48rem;
	}

	.registry-note {
		align-items: center;
		border: 1px solid var(--color-border);
		display: flex;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.65rem;
		gap: 0.4rem;
		margin: 0;
		min-height: 2rem;
		padding: 0 0.6rem;
		white-space: nowrap;
	}

	.registry-note span {
		background: var(--color-primary);
		border-radius: 50%;
		height: 0.4rem;
		width: 0.4rem;
	}

	.workbench {
		display: grid;
		gap: 1rem;
	}

	.controls {
		display: grid;
		gap: 0.7rem;
	}

	.station {
		background: var(--color-raised);
		border: 1px solid var(--color-border);
		margin: 0;
	}

	.station > header {
		align-items: flex-start;
		background: var(--color-muted);
		border-bottom: 1px solid var(--color-border);
		display: flex;
		gap: 0.75rem;
		padding: 0.75rem 0.85rem;
	}

	.station > header > span,
	.starter-options legend > span {
		color: var(--color-primary);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.64rem;
		font-weight: 600;
		padding-top: 0.18rem;
	}

	.station h3,
	.output h3 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1rem;
		letter-spacing: -0.025em;
		margin: 0;
	}

	.station header p {
		color: var(--color-muted-foreground);
		font-size: 0.78rem;
		line-height: 1.35;
		margin: 0.18rem 0 0;
	}

	.station-body {
		padding: 0.9rem;
	}

	.project-field {
		display: grid;
		gap: 0.65rem;
		padding-bottom: 1rem;
	}

	.project-field label {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 0.92rem;
		font-weight: 600;
	}

	.project-field p,
	.switch small {
		color: var(--color-muted-foreground);
		display: block;
		font-size: 0.79rem;
		line-height: 1.4;
		margin: 0.2rem 0 0;
	}

	.project-field input {
		background: var(--color-raised);
		border: 1px solid var(--color-border-strong);
		border-radius: 0.25rem;
		color: var(--color-foreground);
		font-family: 'IBM Plex Mono', monospace;
		min-height: 2.75rem;
		min-width: 0;
		padding: 0 0.65rem;
		width: 100%;
	}

	.starter-options {
		padding: 0.9rem;
	}

	.starter-options legend {
		align-items: center;
		display: flex;
		font-family: 'Space Grotesk', sans-serif;
		gap: 0.75rem;
		padding: 0 0.25rem;
	}

	.switch {
		align-items: flex-start;
		border-top: 1px solid var(--color-border);
		display: flex;
		gap: 0.7rem;
		min-height: 3.5rem;
		padding: 0.8rem 0;
	}

	.switch:first-of-type {
		border-top: 0;
	}

	.switch input {
		accent-color: var(--color-primary);
		height: 1.25rem;
		margin: 0.1rem 0 0;
		width: 1.25rem;
	}

	.switch strong {
		font-size: 0.88rem;
	}

	.output {
		align-self: start;
		background: var(--color-background);
		border: 1px solid var(--color-border-strong);
		min-width: 0;
		padding: 1rem;
	}

	.output-head {
		align-items: flex-start;
		display: flex;
		gap: 0.75rem;
		justify-content: space-between;
	}

	.output h3 {
		font-size: 1.2rem;
		margin-top: 0.25rem;
		overflow-wrap: anywhere;
	}

	.resolution {
		align-items: center;
		display: flex;
		font-size: 0.72rem;
		font-weight: 600;
		gap: 0.4rem;
		white-space: nowrap;
	}

	.resolution i {
		background: var(--color-primary);
		border-radius: 50%;
		height: 0.45rem;
		width: 0.45rem;
	}

	.resolution.unresolved i {
		background: var(--color-destructive);
	}

	.trace-wrap {
		border-bottom: 1px solid var(--color-border);
		border-top: 1px solid var(--color-border);
		margin-top: 1rem;
		padding: 0.9rem 0;
	}

	.project-preview {
		background: var(--color-raised);
		border: 1px solid var(--color-border);
		margin-top: 1rem;
		padding: 0.9rem;
	}

	.project-preview > p,
	.ownership span {
		color: var(--color-muted-foreground);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.64rem;
		letter-spacing: 0.06em;
		margin: 0;
		text-transform: uppercase;
	}

	.tree {
		display: grid;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.72rem;
		gap: 0.35rem;
		grid-template-columns: minmax(7.5rem, auto) minmax(0, 1fr);
		margin-top: 0.8rem;
	}

	.tree > span {
		grid-column: 1 / -1;
	}

	.tree strong {
		color: var(--color-primary);
		font-weight: 600;
	}

	.tree small {
		color: var(--color-muted-foreground);
		overflow-wrap: anywhere;
	}

	.ownership {
		align-items: center;
		border-top: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		margin-top: 0.85rem;
		padding-top: 0.75rem;
	}

	.ownership strong {
		color: var(--color-primary);
		font-size: 0.82rem;
	}

	.warnings {
		background: var(--color-warning-soft);
		border-left: 3px solid var(--color-warning);
		font-size: 0.82rem;
		line-height: 1.4;
		margin-top: 1rem;
		padding: 0.75rem 0.85rem;
	}

	.warnings ul {
		margin: 0.35rem 0 0;
		padding-left: 1.1rem;
	}

	.warnings p {
		margin: 0.25rem 0 0;
	}

	.error {
		background: color-mix(in srgb, var(--color-destructive), white 90%);
		border-color: var(--color-destructive);
	}

	.previews {
		display: grid;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.sr-only {
		clip: rect(0, 0, 0, 0);
		height: 1px;
		margin: -1px;
		overflow: hidden;
		position: absolute;
		width: 1px;
	}

	@media (min-width: 38rem) {
		.project-field {
			align-items: center;
			gap: 1.25rem;
			grid-template-columns: minmax(9.5rem, 0.9fr) minmax(13rem, 1.1fr);
		}
	}

	@media (min-width: 70rem) {
		.workbench {
			align-items: start;
			grid-template-columns: minmax(0, 1.08fr) minmax(24rem, 0.92fr);
		}

		.output {
			position: sticky;
			top: 1rem;
		}
	}

	@media (max-width: 39.99rem) {
		.configurator {
			box-shadow: 5px 5px 0 var(--color-primary-soft);
			padding: 0.8rem;
		}

		.configurator-head {
			align-items: flex-start;
			flex-direction: column;
		}

		.registry-note {
			align-self: flex-start;
		}

		.output-head {
			align-items: flex-start;
			flex-direction: column;
		}

		.tree {
			grid-template-columns: 1fr;
		}

		.tree > span {
			grid-column: auto;
		}
	}
</style>
