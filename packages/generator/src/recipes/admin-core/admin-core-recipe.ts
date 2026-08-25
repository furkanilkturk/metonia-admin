import type { Recipe, RecipeContext, StagedValidationContext } from '../../contracts/index.js';
import { readGeneratorAsset } from '../assets.js';

const adminCoreAssetFiles = Object.freeze([
	'src/lib/client/ui/pages/dashboard/dashboardController.ts',
	'src/lib/client/ui/pages/dashboard/dashboardState.svelte.ts',
	'src/lib/client/ui/pages/dashboard.svelte',
	'src/lib/client/ui/pages/error.svelte',
	'src/lib/client/ui/pages/layout/AdminShell.svelte',
	'src/lib/client/ui/pages/settings.svelte',
	'src/lib/client/ui/views/dashboard/dashboardActivity.svelte',
	'src/lib/client/ui/views/dashboard/dashboardFilter.svelte',
	'src/lib/client/ui/views/dashboard/dashboardMetrics.svelte',
	'src/lib/client/ui/views/dashboard/dashboardTable.svelte',
	'src/lib/client/ui/views/layout/adminHeader.svelte',
	'src/lib/client/ui/views/layout/adminSidebar.svelte',
	'src/lib/client/ui/views/settings/settingsSummary.svelte',
	'src/lib/shared/types/dashboard.ts',
	'src/routes/+error.svelte',
	'src/routes/+page.server.ts',
	'src/routes/(admin)/+layout.svelte',
	'src/routes/(admin)/dashboard/+page.svelte',
	'src/routes/(admin)/settings/+page.svelte'
]);

export function createAdminCoreRecipe(): Recipe {
	return {
		id: 'admin-core',
		stage: 'admin-core',
		async apply(context) {
			for (const path of adminCoreAssetFiles) {
				await context.writeFile(path, await readAdminCoreAsset(path));
			}
			await context.writeFile(
				'src/lib/client/navigation/adminNavigation.ts',
				await renderAdminNavigation(context)
			);

			context.addDocumentFact({ key: 'admin.shell', value: 'responsive workbench' });
			context.addDocumentFact({ key: 'admin.routes', value: 'dashboard, settings' });
			context.addCheck({ id: 'admin-core-composition', validate: validateAdminCore });
		}
	};
}

async function renderAdminNavigation(context: RecipeContext): Promise<string> {
	const template = await readAdminCoreAsset('src/lib/client/navigation/adminNavigation.template');
	const usersEnabled = context.config.resources.users;
	return template
		.replace(
			'__USERS_ICON_IMPORT__',
			usersEnabled ? "import UsersIcon from '@lucide/svelte/icons/users';" : ''
		)
		.replace(
			'__USERS_NAV_ENTRY__',
			usersEnabled
				? `\t{
\t\tdescription: 'Manage the generated Users resource.',
\t\thref: '/users',
\t\ticon: UsersIcon,
\t\tlabel: 'Users'
\t},`
				: ''
		);
}

async function validateAdminCore(context: StagedValidationContext): Promise<void> {
	const requiredFiles = [...adminCoreAssetFiles, 'src/lib/client/navigation/adminNavigation.ts'];
	if (
		(await Promise.all(requiredFiles.map((path) => context.exists(path)))).some((exists) => !exists)
	) {
		throw new Error('The generated admin core is incomplete.');
	}

	await assertThinRoute(
		context,
		'src/routes/(admin)/dashboard/+page.svelte',
		"import DashboardPage from '$lib/client/ui/pages/dashboard.svelte';",
		'<DashboardPage />'
	);
	await assertThinRoute(
		context,
		'src/routes/(admin)/settings/+page.svelte',
		"import SettingsPage from '$lib/client/ui/pages/settings.svelte';",
		'<SettingsPage />'
	);

	const layout = await context.readFile('src/routes/(admin)/+layout.svelte');
	const rootRedirect = await context.readFile('src/routes/+page.server.ts');
	if (
		!layout.includes("import AdminShell from '$lib/client/ui/pages/layout/AdminShell.svelte';") ||
		!layout.includes('<AdminShell>') ||
		/<(?:main|header|nav)\b/.test(layout)
	) {
		throw new Error('The admin route layout is not a thin shell adapter.');
	}
	if (
		!rootRedirect.includes("import { redirect } from '@sveltejs/kit';") ||
		!rootRedirect.includes("redirect(307, '/dashboard');")
	) {
		throw new Error('The generated root route does not redirect to the canonical Dashboard.');
	}

	const shell = await context.readFile('src/lib/client/ui/pages/layout/AdminShell.svelte');
	const dashboard = await context.readFile('src/lib/client/ui/pages/dashboard.svelte');
	const settings = await context.readFile('src/lib/client/ui/pages/settings.svelte');
	const navigation = await context.readFile('src/lib/client/navigation/adminNavigation.ts');
	if (
		!shell.includes('Skip to content') ||
		!shell.includes('Dialog.Root') ||
		!shell.includes('lg:hidden') ||
		!dashboard.includes('<DashboardMetrics') ||
		!dashboard.includes('<DashboardTable') ||
		!settings.includes('Authentication') ||
		!settings.includes('Not configured')
	) {
		throw new Error('The responsive workbench or Dashboard composition is incomplete.');
	}

	const errorRoute = await context.readFile('src/routes/+error.svelte');
	if (
		!errorRoute.includes("import ErrorPage from '$lib/client/ui/pages/error.svelte';") ||
		!errorRoute.includes('<ErrorPage ') ||
		/<(?:main|section|header|h1)\b/.test(errorRoute)
	) {
		throw new Error('The generated error route is not a thin page adapter.');
	}

	if (context.config.resources.users !== navigation.includes("href: '/users'")) {
		throw new Error('The admin navigation does not match the selected resources.');
	}

	for (const path of adminCoreAssetFiles.filter((path) => path.includes('/views/'))) {
		const source = await context.readFile(path);
		if (
			source.includes('$lib/server') ||
			source.includes('$lib/client/ui/pages') ||
			source.includes('/routes/')
		) {
			throw new Error(`The admin view violates an import boundary: ${path}`);
		}
	}
}

async function assertThinRoute(
	context: StagedValidationContext,
	path: string,
	expectedImport: string,
	expectedComponent: string
): Promise<void> {
	const source = await context.readFile(path);
	if (
		!source.includes(expectedImport) ||
		!source.includes(expectedComponent) ||
		/<(?:main|section|header|h1)\b/.test(source)
	) {
		throw new Error(`The generated route is not a thin page adapter: ${path}`);
	}
}

async function readAdminCoreAsset(path: string): Promise<string> {
	return readGeneratorAsset(`admin-core/${path}`);
}
