import type {
	DashboardOperation,
	DashboardStatusFilter,
	DashboardWindow
} from '$lib/shared/types/dashboard.js';

const windowRank: Readonly<Record<DashboardWindow, number>> = { '24h': 0, '7d': 1, '30d': 2 };

export class DashboardState {
	query = $state('');
	status = $state<DashboardStatusFilter>('all');
	window = $state<DashboardWindow>('7d');
	isLoading = $state(false);
	lastUpdated = $state('Updated just now');
	operations = $state.raw<readonly DashboardOperation[]>([]);

	filteredOperations = $derived.by(() => {
		const query = this.query.trim().toLocaleLowerCase();
		return this.operations.filter((operation) => {
			const matchesQuery =
				query.length === 0 ||
				operation.name.toLocaleLowerCase().includes(query) ||
				operation.owner.toLocaleLowerCase().includes(query);
			const matchesStatus = this.status === 'all' || operation.status === this.status;
			const matchesWindow = windowRank[operation.updatedWithin] <= windowRank[this.window];
			return matchesQuery && matchesStatus && matchesWindow;
		});
	});

	activeFilterCount = $derived(
		Number(this.query.trim().length > 0) +
			Number(this.status !== 'all') +
			Number(this.window !== '7d')
	);

	constructor(operations: readonly DashboardOperation[]) {
		this.operations = operations;
	}
}
