import type {
	DashboardOperation,
	DashboardStatusFilter,
	DashboardWindow
} from '$lib/shared/types/dashboard.js';

export class DashboardState {
	query = $state('');
	status = $state<DashboardStatusFilter>('all');
	window = $state<DashboardWindow>('7d');
	operations = $state.raw<readonly DashboardOperation[]>([]);

	filteredOperations = $derived.by(() => {
		const query = this.query.trim().toLocaleLowerCase();
		return this.operations.filter((operation) => {
			const matchesQuery =
				query.length === 0 ||
				operation.name.toLocaleLowerCase().includes(query) ||
				operation.owner.toLocaleLowerCase().includes(query);
			const matchesStatus = this.status === 'all' || operation.status === this.status;
			return matchesQuery && matchesStatus;
		});
	});

	activeFilterCount = $derived(
		Number(this.query.trim().length > 0) + Number(this.status !== 'all')
	);

	constructor(operations: readonly DashboardOperation[]) {
		this.operations = operations;
	}
}
