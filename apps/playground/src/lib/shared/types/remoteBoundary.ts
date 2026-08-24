export interface RemoteBoundarySnapshot {
	readonly checkedAt: string;
	readonly message: string;
	readonly mode: 'sveltekit-remote-functions';
	readonly status: 'experimental';
}
