<script lang="ts">
	import ChoiceField from '$lib/client/ui/components/ChoiceField.svelte';
	import CodePanel from '$lib/client/ui/components/CodePanel.svelte';
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

	function updateProject(event: Event) {
		update('projectName', (event.currentTarget as HTMLInputElement).value);
	}

	function updateBoolean(key: 'docker' | 'users', event: Event) {
		update(key, (event.currentTarget as HTMLInputElement).checked);
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
			<p class="eyebrow">Live project assembler</p>
			<h2 id="configurator-title">Configure the stack. See where every choice lands.</h2>
		</div>
		<p class="registry-note"><span aria-hidden="true"></span>Synced with the capability registry</p>
	</header>

	<div class="workbench">
		<aside class="output" aria-label="Generated project blueprint">
			<div class="output-head">
				<div>
					<span>project / blueprint</span>
					<h3>{draft.projectName || 'untitled-project'}</h3>
				</div>
				<span class:unresolved={!result.ok} class="resolution">
					<i aria-hidden="true"></i>{result.ok ? 'resolved' : 'attention required'}
				</span>
			</div>

			<div class="blueprint">
				<div class="route-node node">
					<span>route boundary</span>
					<strong>src/routes/(admin)/+page.svelte</strong>
					<code>{draft.dataPattern}</code>
				</div>

				<div class="connector" aria-hidden="true"><i></i><i></i><i></i></div>

				<div class="boundary-grid">
					<section class="node client-node">
						<span>browser-safe</span>
						<strong>$lib/client/ui</strong>
						<code>{draft.uiAdapter} / {draft.uiTheme}</code>
						<small>components → views → pages</small>
					</section>
					<section class="node shared-node">
						<span>runtime-neutral</span>
						<strong>$lib/shared</strong>
						<code>{draft.validation} schemas</code>
						<small>contracts · types · pure utilities</small>
					</section>
					<section class="node server-node">
						<span>server-only</span>
						<strong>$lib/server</strong>
						<code>{draft.orm} → {draft.dialect}</code>
						<small>{draft.provider} / {draft.driver}</small>
					</section>
				</div>

				<div class="dependency-rule" aria-label="Dependency direction">
					<code>client</code><b aria-hidden="true">→</b><code>shared</code><b aria-hidden="true">←</b><code>server</code>
				</div>

				<div class="output-modules">
					<span><b>resource/users</b><small>{draft.users ? 'included' : 'omitted'}</small></span>
					<span><b>docker</b><small>{draft.docker ? 'included' : 'omitted'}</small></span>
					<span><b>package manager</b><small>{draft.packageManager}</small></span>
				</div>
			</div>

			<div aria-live="polite">
				{#if result.ok}
					{#if config?.warnings.length}
						<div class="warnings" role="status">
							<strong>Registry notes</strong>
							<ul>
								{#each config.warnings as warning (`${warning.code}-${warning.path}-${warning.message}`)}
									<li>{warning.message}</li>
								{/each}
							</ul>
						</div>
					{/if}
				{:else}
					<div class="warnings error" role="alert">
						<strong>Resolve before generating</strong>
						<p>Keep your selections, then change either side of each reported conflict.</p>
						<ul>
							{#each result.issues as issue (`${issue.code}-${issue.path}-${issue.message}`)}
								<li>{issue.message}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>

			<div class="launch">
				<div>
					<span>{result.ok ? 'Start this project' : 'Command available after resolution'}</span>
					<code>{previewCommand(config)}</code>
				</div>
				<button
					disabled={!result.ok}
					onclick={() => copy(previewCommand(config), 'command')}
					type="button"
				>
					{copied === 'command' ? 'Copied' : 'Copy npx'}
				</button>
			</div>

			<details class="config-source">
				<summary>Inspect metonia-admin.config.ts</summary>
				<CodePanel
					label={copied === 'config' ? 'Config copied' : 'Generated configuration'}
					code={previewModule(config)}
					oncopy={() => copy(previewModule(config), 'config')}
				/>
			</details>
			<p aria-live="polite" class="sr-only">
				{copied === 'error'
					? 'Clipboard access is unavailable.'
					: copied
						? `${copied} preview copied.`
						: ''}
			</p>
		</aside>

		<div class="controls" aria-label="Project selections">
			<fieldset class="control-group">
				<legend>Project shell</legend>
				<div class="project-field">
					<div>
						<label for="project-name">Project name</label>
						<p id="project-name-help">Lowercase letters, numbers, and hyphens.</p>
					</div>
					<input
						aria-describedby="project-name-help"
						autocomplete="off"
						id="project-name"
						oninput={updateProject}
						spellcheck="false"
						value={draft.projectName}
					/>
				</div>
				<ChoiceField
					id="package-manager"
					label="Package manager"
					description="Controls generated install and script commands."
					value={draft.packageManager}
					options={choicesFor('packageManager', draft)}
					onchange={(value) => update('packageManager', value)}
				/>
			</fieldset>

			<fieldset class="control-group">
				<legend>Interface</legend>
				<ChoiceField
					id="ui-adapter"
					label="UI adapter"
					description="Unavailable integrations remain visible."
					value={draft.uiAdapter}
					options={choicesFor('ui.adapter', draft)}
					onchange={(value) => update('uiAdapter', value)}
				/>
				<ChoiceField
					id="ui-theme"
					label="Theme"
					description="Themes belong to their selected adapter."
					value={draft.uiTheme}
					options={themeChoices}
					onchange={(value) => update('uiTheme', value)}
				/>
			</fieldset>

			<fieldset class="control-group">
				<legend>Application boundary</legend>
				<ChoiceField
					id="data-pattern"
					label="Data mode"
					description="Standard SvelteKit is the default; Remote remains experimental."
					value={draft.dataPattern}
					options={choicesFor('dataPattern', draft)}
					onchange={(value) => update('dataPattern', value)}
				/>
				<ChoiceField
					id="validation"
					label="Validation"
					description="Shared schemas enforced at the server boundary."
					value={draft.validation}
					options={choicesFor('validation', draft)}
					onchange={(value) => update('validation', value)}
				/>
			</fieldset>

			<fieldset class="control-group">
				<legend>Persistence</legend>
				<ChoiceField id="orm" label="ORM" description="Persistence stays in $lib/server." value={draft.orm} options={choicesFor('orm', draft)} onchange={(value) => update('orm', value)} />
				<ChoiceField id="database-dialect" label="Dialect" description="The database language, independent of hosting." value={draft.dialect} options={choicesFor('database.dialect', draft)} onchange={(value) => update('dialect', value)} />
				<ChoiceField id="database-provider" label="Provider" description="Filtered by the selected dialect." value={draft.provider} options={providerChoices} onchange={(value) => update('provider', value)} />
				<ChoiceField id="database-driver" label="Driver" description="Filtered by the selected provider." value={draft.driver} options={driverChoices} onchange={(value) => update('driver', value)} />
			</fieldset>

			<fieldset class="control-group starter-options">
				<legend>Generated extras</legend>
				<label class="toggle">
					<input checked={draft.docker} onchange={(event) => updateBoolean('docker', event)} type="checkbox" />
					<span><strong>Docker support</strong><small>Local container setup; not a hosting target.</small></span>
				</label>
				<label class="toggle">
					<input checked={draft.users} onchange={(event) => updateBoolean('users', event)} type="checkbox" />
					<span><strong>Users example</strong><small>Shared, server, and client CRUD reference.</small></span>
				</label>
			</fieldset>
		</div>
	</div>
</section>

<style>
	.configurator {
		background: var(--color-card);
		border: 1px solid var(--color-border-strong);
	}

	.configurator-head {
		align-items: flex-start;
		border-bottom: 1px solid var(--color-border-strong);
		display: flex;
		gap: 1rem;
		justify-content: space-between;
		padding: clamp(1rem, 2.2vw, 1.6rem);
	}

	.eyebrow,
	.output-head span,
	.node > span,
	.registry-note,
	.launch span {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.61rem;
		font-weight: 600;
		letter-spacing: 0.065em;
		text-transform: uppercase;
	}

	.eyebrow {
		color: var(--color-primary);
		margin: 0;
	}

	h2 {
		font-family: 'IBM Plex Sans Condensed', sans-serif;
		font-size: clamp(1.55rem, 3vw, 2.2rem);
		font-weight: 600;
		letter-spacing: -0.025em;
		line-height: 1.06;
		margin: 0.35rem 0 0;
	}

	.registry-note {
		align-items: center;
		color: var(--color-muted-foreground);
		display: flex;
		gap: 0.42rem;
		margin: 0;
		min-height: 2.75rem;
		white-space: nowrap;
	}

	.registry-note span {
		background: var(--color-primary);
		height: 0.45rem;
		width: 0.45rem;
	}

	.workbench {
		display: grid;
		grid-template-areas: 'output' 'controls';
	}

	.controls {
		background: var(--color-background);
		display: grid;
		gap: 0.75rem;
		grid-area: controls;
		padding: 0.75rem;
	}

	.control-group {
		background: var(--color-card);
		border: 1px solid var(--color-border);
		margin: 0;
		min-width: 0;
		padding: 0 0.85rem;
	}

	.control-group legend {
		background: var(--color-card);
		color: var(--color-foreground);
		font-family: 'IBM Plex Sans Condensed', sans-serif;
		font-size: 0.94rem;
		font-weight: 600;
		padding: 0 0.35rem;
	}

	.project-field {
		border-bottom: 1px solid var(--color-border);
		display: grid;
		gap: 0.55rem;
		padding: 0.75rem 0 0.8rem;
	}

	.project-field label {
		font-family: 'IBM Plex Sans Condensed', sans-serif;
		font-size: 0.92rem;
		font-weight: 600;
	}

	.project-field p,
	.toggle small {
		color: var(--color-muted-foreground);
		display: block;
		font-size: 0.75rem;
		line-height: 1.38;
		margin: 0.16rem 0 0;
	}

	.project-field input {
		background: var(--color-card);
		border: 1px solid var(--color-border-strong);
		border-radius: 0;
		color: var(--color-foreground);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.76rem;
		min-height: 2.75rem;
		min-width: 0;
		padding: 0 0.6rem;
		width: 100%;
	}

	.starter-options {
		padding-bottom: 0.2rem;
	}

	.toggle {
		align-items: flex-start;
		border-top: 1px solid var(--color-border);
		display: flex;
		gap: 0.65rem;
		min-height: 3.6rem;
		padding: 0.75rem 0;
	}

	.toggle:first-of-type {
		border-top: 0;
	}

	.toggle input {
		accent-color: var(--color-primary);
		height: 1.2rem;
		margin: 0.12rem 0 0;
		width: 1.2rem;
	}

	.toggle strong {
		font-family: 'IBM Plex Sans Condensed', sans-serif;
		font-size: 0.88rem;
	}

	.output {
		grid-area: output;
		min-width: 0;
		padding: clamp(0.75rem, 2vw, 1.2rem);
	}

	.output-head {
		align-items: flex-start;
		display: flex;
		gap: 0.7rem;
		justify-content: space-between;
	}

	.output-head > div > span {
		color: var(--color-primary);
	}

	.output h3 {
		font-family: 'IBM Plex Sans Condensed', sans-serif;
		font-size: clamp(1.3rem, 3vw, 1.8rem);
		letter-spacing: -0.025em;
		line-height: 1;
		margin: 0.28rem 0 0;
		overflow-wrap: anywhere;
	}

	.resolution {
		align-items: center;
		color: var(--color-primary);
		display: flex;
		gap: 0.38rem;
		line-height: 1.2;
		max-width: 9rem;
		text-align: right;
	}

	.resolution i {
		background: var(--color-primary);
		flex: 0 0 auto;
		height: 0.45rem;
		width: 0.45rem;
	}

	.resolution.unresolved {
		color: var(--color-destructive);
	}

	.resolution.unresolved i {
		background: var(--color-destructive);
	}

	.blueprint {
		background-color: #fbfcff;
		background-image:
			linear-gradient(#dfe6f7 1px, transparent 1px),
			linear-gradient(90deg, #dfe6f7 1px, transparent 1px);
		background-size: 1.25rem 1.25rem;
		border: 1px solid var(--color-primary);
		margin-top: 1rem;
		min-width: 0;
		padding: clamp(0.7rem, 2vw, 1rem);
	}

	.node {
		background: var(--color-card);
		border: 1px solid var(--color-primary);
		box-shadow: 3px 3px 0 #cbd7ff;
		min-width: 0;
		padding: 0.72rem;
	}

	.node > span {
		color: var(--color-primary);
		display: block;
	}

	.node strong {
		display: block;
		font-family: 'IBM Plex Sans Condensed', sans-serif;
		font-size: 0.96rem;
		margin-top: 0.22rem;
		overflow-wrap: anywhere;
	}

	.node code,
	.node small {
		color: var(--color-muted-foreground);
		display: block;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.64rem;
		line-height: 1.4;
		margin-top: 0.35rem;
		overflow-wrap: anywhere;
	}

	.route-node {
		margin: 0 auto;
		max-width: 25rem;
	}

	.connector {
		display: none;
	}

	.boundary-grid {
		display: grid;
		gap: 0.7rem;
		margin-top: 0.7rem;
	}

	.shared-node {
		border-width: 2px;
	}

	.dependency-rule {
		align-items: center;
		background: var(--color-card);
		border: 1px solid var(--color-primary);
		display: flex;
		gap: 0.45rem;
		justify-content: center;
		margin-top: 0.7rem;
		min-height: 2.75rem;
		padding: 0.55rem;
	}

	.dependency-rule code {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.67rem;
	}

	.dependency-rule b {
		color: var(--color-primary);
	}

	.output-modules {
		display: grid;
		margin-top: 0.7rem;
	}

	.output-modules > span {
		align-items: center;
		background: var(--color-card);
		border: 1px solid var(--color-border-strong);
		display: flex;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.63rem;
		justify-content: space-between;
		margin-bottom: -1px;
		min-height: 2.4rem;
		padding: 0.45rem 0.55rem;
	}

	.output-modules b {
		font-weight: 500;
	}

	.output-modules small {
		color: var(--color-primary);
		text-transform: uppercase;
	}

	.warnings {
		background: var(--color-warning-soft);
		border-left: 3px solid var(--color-warning);
		font-size: 0.77rem;
		line-height: 1.42;
		margin-top: 0.8rem;
		padding: 0.7rem 0.8rem;
	}

	.warnings ul {
		margin: 0.35rem 0 0;
		padding-left: 1rem;
	}

	.warnings p {
		margin: 0.2rem 0 0;
	}

	.error {
		background: #fbeaed;
		border-color: var(--color-destructive);
	}

	.launch {
		align-items: stretch;
		background: var(--color-accent);
		color: white;
		display: grid;
		margin-top: 0.8rem;
	}

	.launch > div {
		min-width: 0;
		padding: 0.72rem 0.8rem;
	}

	.launch span {
		display: block;
		opacity: 0.78;
	}

	.launch code {
		display: block;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.69rem;
		line-height: 1.5;
		margin-top: 0.3rem;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
	}

	.launch button {
		background: #d93600;
		border: 0;
		border-top: 1px solid rgba(255, 255, 255, 0.45);
		color: white;
		font-size: 0.78rem;
		font-weight: 600;
		min-height: 2.75rem;
		padding: 0 0.9rem;
	}

	.launch button:hover:not(:disabled) {
		background: var(--color-foreground);
	}

	.launch button:disabled {
		opacity: 0.65;
	}

	.config-source {
		border: 1px solid var(--color-border);
		margin-top: 0.8rem;
	}

	.config-source summary {
		align-items: center;
		background: var(--color-code);
		cursor: pointer;
		display: flex;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.66rem;
		font-weight: 500;
		min-height: 2.75rem;
		padding: 0 0.75rem;
	}

	.config-source :global(.panel) {
		border: 0;
		border-top: 1px solid var(--color-border);
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
			gap: 1rem;
			grid-template-columns: minmax(9rem, 0.85fr) minmax(13rem, 1.15fr);
		}

		.boundary-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.connector {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			height: 1.5rem;
			margin: 0 auto;
			max-width: 75%;
			position: relative;
		}

		.connector::before {
			background: var(--color-primary);
			content: '';
			height: 1px;
			left: 16.66%;
			position: absolute;
			top: 0.75rem;
			width: 66.66%;
		}

		.connector::after {
			background: var(--color-primary);
			content: '';
			height: 0.75rem;
			left: 50%;
			position: absolute;
			top: 0;
			width: 1px;
		}

		.connector i {
			border-left: 1px solid var(--color-primary);
			height: 0.75rem;
			justify-self: center;
			margin-top: 0.75rem;
		}

		.output-modules {
			grid-template-columns: repeat(3, 1fr);
		}

		.output-modules > span {
			align-items: flex-start;
			flex-direction: column;
			gap: 0.25rem;
			margin-bottom: 0;
			margin-right: -1px;
		}

		.launch {
			grid-template-columns: minmax(0, 1fr) auto;
		}

		.launch button {
			border-left: 1px solid rgba(255, 255, 255, 0.45);
			border-top: 0;
		}
	}

	@media (min-width: 70rem) {
		.workbench {
			align-items: start;
			grid-template-areas: 'controls output';
			grid-template-columns: minmax(25rem, 0.76fr) minmax(35rem, 1.24fr);
		}

		.controls {
			border-right: 1px solid var(--color-border-strong);
		}

		.output {
			position: sticky;
			top: 1rem;
		}
	}

	@media (max-width: 39.99rem) {
		.configurator-head {
			flex-direction: column;
		}

		.registry-note {
			min-height: auto;
			white-space: normal;
		}

		.output-head {
			align-items: flex-start;
			flex-direction: column;
		}

		.resolution {
			max-width: none;
			text-align: left;
		}
	}
</style>
