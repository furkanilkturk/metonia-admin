export type DependencyKind = 'dependencies' | 'devDependencies';

export interface DependencyContribution {
	kind: DependencyKind;
	name: string;
	version: string;
}

export interface ScriptContribution {
	command: string;
	name: string;
}

/** Facts are deliberately small, serializable values for generated documents. */
export interface DocumentFact {
	key: string;
	value: string;
}

export interface CollectedFacts {
	checks: readonly string[];
	dependencies: Readonly<Record<DependencyKind, Readonly<Record<string, string>>>>;
	documentFacts: Readonly<Record<string, string>>;
	scripts: Readonly<Record<string, string>>;
}
