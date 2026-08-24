export const cliPackage = {
	name: 'create-metonia-admin'
} as const;

export type CliPackage = typeof cliPackage;

export {
	CLI_RESULT_VERSION,
	createNodeCliIo,
	formatHelp,
	parseCliArguments,
	runCli
} from './run-cli.js';

export type {
	CliDependencies,
	CliErrorDetails,
	CliGenerationRequest,
	CliIo,
	CliResult,
	CliRunResult,
	CliSelection,
	GeneratorExecutor,
	PromptAdapter
} from './run-cli.js';
