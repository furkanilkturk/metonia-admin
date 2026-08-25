import type { ThemeId } from '@metonia-admin/registry';

export interface ShadcnSvelteThemePreset {
	readonly baseColor: ThemeId;
	readonly id: ThemeId;
	readonly presetCode: string;
	readonly snapshot: ThemeId;
}

/** Values decoded from the durable 1.5.0 preset payload shared by all seven theme codes. */
export const shadcnSvelteDesignProfile = Object.freeze({
	chartColor: 'teal',
	font: 'source-sans-3',
	fontHeading: 'space-grotesk',
	presetIconLibrary: 'lucide',
	menuAccent: 'subtle',
	menuColor: 'default',
	radius: 'medium',
	style: 'nova'
});

/**
 * Pinned shadcn-svelte 1.5.0 Nova preset codes. These encode the Metonia design
 * profile: Source Sans 3, Space Grotesk headings, the preset's Lucide default, medium radius,
 * and teal charts. The resolved icon-library capability overrides that default during generation.
 */
export const shadcnSvelteThemePresets = Object.freeze({
	neutral: Object.freeze({
		baseColor: 'neutral',
		id: 'neutral',
		presetCode: 'b6WwhW0Vfs',
		snapshot: 'neutral'
	}),
	stone: Object.freeze({
		baseColor: 'stone',
		id: 'stone',
		presetCode: 'b6WwhoSR84',
		snapshot: 'stone'
	}),
	zinc: Object.freeze({
		baseColor: 'zinc',
		id: 'zinc',
		presetCode: 'b6Wwi6uMaG',
		snapshot: 'zinc'
	}),
	mauve: Object.freeze({
		baseColor: 'mauve',
		id: 'mauve',
		presetCode: 'b6WwiUBTFY',
		snapshot: 'mauve'
	}),
	olive: Object.freeze({
		baseColor: 'olive',
		id: 'olive',
		presetCode: 'b6WwimdOhk',
		snapshot: 'olive'
	}),
	mist: Object.freeze({
		baseColor: 'mist',
		id: 'mist',
		presetCode: 'b6Wwj55K9w',
		snapshot: 'mist'
	}),
	taupe: Object.freeze({
		baseColor: 'taupe',
		id: 'taupe',
		presetCode: 'b6WwjNXFc8',
		snapshot: 'taupe'
	})
} satisfies Readonly<Record<ThemeId, ShadcnSvelteThemePreset>>);

export function getShadcnSvelteThemePreset(theme: ThemeId): ShadcnSvelteThemePreset {
	return shadcnSvelteThemePresets[theme];
}
