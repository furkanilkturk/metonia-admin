import { chmod, cp, mkdir, rm } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const cliRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));
const distRoot = resolve(cliRoot, 'dist');
const copies = [
	{
		source: resolve(cliRoot, '../generator/assets'),
		destination: resolve(distRoot, 'generator-assets')
	},
	{
		source: resolve(cliRoot, '../generator/node_modules/sv/dist/templates'),
		destination: resolve(distRoot, 'templates')
	},
	{
		source: resolve(cliRoot, '../generator/node_modules/sv/dist/shared.json'),
		destination: resolve(distRoot, 'shared.json')
	}
];

await mkdir(distRoot, { recursive: true });
for (const { source, destination } of copies) {
	assertOwnedDistPath(destination);
	await rm(destination, { force: true, recursive: true });
	await cp(source, destination, { recursive: true });
}
await chmod(resolve(distRoot, 'create-metonia-admin.js'), 0o755);

function assertOwnedDistPath(path) {
	const relation = relative(distRoot, path);
	if (relation === '' || relation.startsWith('..') || dirname(path) !== distRoot) {
		throw new Error('Refusing to replace an unexpected runtime-asset path.');
	}
}
