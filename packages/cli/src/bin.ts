/// <reference types="bun" />

import { createNodeCliIo, runCli } from './run-cli.js';

const result = await runCli(process.argv.slice(2), { io: createNodeCliIo() });
process.exitCode = result.exitCode;
