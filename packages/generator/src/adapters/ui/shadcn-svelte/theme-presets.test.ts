/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import { shadcnSvelteDesignProfile, shadcnSvelteThemePresets } from './index.js';

describe('shadcn-svelte 1.5.0 preset mapping', () => {
	test('pins every registry theme to its durable Nova preset code', () => {
		expect(
			Object.fromEntries(
				Object.entries(shadcnSvelteThemePresets).map(([theme, preset]) => [
					theme,
					preset.presetCode
				])
			)
		).toEqual({
			neutral: 'b6WwhW0Vfs',
			stone: 'b6WwhoSR84',
			zinc: 'b6Wwi6uMaG',
			mauve: 'b6WwiUBTFY',
			olive: 'b6WwimdOhk',
			mist: 'b6Wwj55K9w',
			taupe: 'b6WwjNXFc8'
		});
	});

	test('snapshots the decoded profile instead of conflating it with stock Nova codes', () => {
		expect(shadcnSvelteDesignProfile).toEqual({
			chartColor: 'teal',
			font: 'source-sans-3',
			fontHeading: 'space-grotesk',
			presetIconLibrary: 'lucide',
			menuAccent: 'subtle',
			menuColor: 'default',
			radius: 'medium',
			style: 'nova'
		});
		expect(shadcnSvelteThemePresets.zinc).toMatchObject({
			baseColor: 'zinc',
			presetCode: 'b6Wwi6uMaG',
			snapshot: 'zinc'
		});
		expect(
			Object.fromEntries(
				Object.entries(shadcnSvelteThemePresets).map(([theme, preset]) => [theme, preset.snapshot])
			)
		).toEqual({
			neutral: 'neutral',
			stone: 'stone',
			zinc: 'zinc',
			mauve: 'mauve',
			olive: 'olive',
			mist: 'mist',
			taupe: 'taupe'
		});
	});
});
