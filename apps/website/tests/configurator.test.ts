import { expect, test } from 'bun:test';
import { capabilityRegistry } from '@metonia-admin/registry';
import {
	choicesFor,
	initialDraft,
	previewCommand,
	resolveDraft
} from '../src/lib/shared/configurator.js';

test('website exposes themes only from the selected adapter', () => {
	const draft = initialDraft();
	const choices = choicesFor('ui.theme', draft);
	expect(choices.map((choice) => choice.id)).toEqual(
		capabilityRegistry.uiAdapters
			.find((adapter) => adapter.id === draft.uiAdapter)
			?.themes.map((theme) => theme.id)
	);
});

test('website exposes all seven verified shadcn-svelte base colors as selectable', () => {
	const themes = choicesFor('ui.theme', initialDraft());
	expect(themes.map((theme) => theme.id)).toEqual([
		'neutral',
		'stone',
		'zinc',
		'mauve',
		'olive',
		'mist',
		'taupe'
	]);
	expect(themes.every((theme) => theme.selectable)).toBeTrue();
	expect(themes.every((theme) => theme.support.integration === 'experimental')).toBeTrue();
});

test('website exposes the five shadcn-svelte icon-library choices', () => {
	const icons = choicesFor('ui.iconLibrary', initialDraft());
	expect(icons.map((icon) => icon.id)).toEqual([
		'lucide',
		'tabler',
		'hugeicons',
		'phosphor',
		'remixicon'
	]);
	expect(icons.every((icon) => icon.selectable)).toBeTrue();
});

test('unavailable Fluid UI is visible but not selectable', () => {
	const draft = initialDraft();
	const fluid = choicesFor('ui.adapter', draft).find((choice) => choice.id === 'fluid-ui');
	expect(fluid?.selectable).toBeFalse();
	expect(fluid?.support.integration).toBe('unknown');
});

test('preview uses canonical resolved capability IDs and labels remote as an explicit selection', () => {
	const draft = initialDraft();
	draft.dataPattern = 'sveltekit-remote-functions';
	draft.users = false;
	const result = resolveDraft(draft);
	expect(result.ok).toBeTrue();
	if (!result.ok) return;
	const command = previewCommand(result.config);
	expect(command).toStartWith('npx create-metonia-admin@latest');
	expect(command).toContain('--data-pattern remote-functions');
	expect(
		result.config.warnings.some((warning) => warning.code === 'experimental-capability')
	).toBeTrue();
});

test('website resolver reports Remote Functions with Users as incompatible', () => {
	const draft = initialDraft();
	draft.dataPattern = 'sveltekit-remote-functions';
	draft.users = true;
	const result = resolveDraft(draft);
	expect(result.ok).toBeFalse();
	if (result.ok) return;
	expect(result.issues.some((issue) => issue.code === 'incompatible-capabilities')).toBeTrue();
});

test('website resolver keeps Docker available for every stable package manager', () => {
	for (const packageManager of ['bun', 'npm', 'pnpm', 'yarn']) {
		const draft = initialDraft();
		draft.packageManager = packageManager;
		draft.docker = true;
		expect(resolveDraft(draft).ok).toBeTrue();
	}
});
