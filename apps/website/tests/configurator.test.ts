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

test('website keeps non-zinc themes visible but unavailable from the registry projection', () => {
	const themes = choicesFor('ui.theme', initialDraft());
	expect(themes.find((theme) => theme.id === 'zinc')?.selectable).toBeTrue();
	expect(
		themes.filter((theme) => theme.id !== 'zinc').every((theme) => !theme.selectable)
	).toBeTrue();
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

test('website resolver reports Docker with a non-Bun package manager as incompatible', () => {
	const draft = initialDraft();
	draft.packageManager = 'npm';
	draft.docker = true;
	const result = resolveDraft(draft);
	expect(result.ok).toBeFalse();
	if (result.ok) return;
	expect(result.issues.some((issue) => issue.code === 'incompatible-capabilities')).toBeTrue();
});
