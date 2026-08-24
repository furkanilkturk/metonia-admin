import { readFile } from 'node:fs/promises';

/**
 * Recipe assets live beside the generator package. The second location is emitted with the
 * bundled public CLI so its Node artifact does not depend on source-worktree paths.
 */
export async function readGeneratorAsset(relativePath: string): Promise<string> {
	const candidates = [
		new URL(`../../assets/${relativePath}`, import.meta.url),
		new URL(`./generator-assets/${relativePath}`, import.meta.url)
	];
	for (const candidate of candidates) {
		try {
			return await readFile(candidate, 'utf8');
		} catch (error) {
			if (!isMissingFile(error)) throw error;
		}
	}
	throw new Error('A required generator asset is unavailable.');
}

function isMissingFile(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		(error as { code?: unknown }).code === 'ENOENT'
	);
}
