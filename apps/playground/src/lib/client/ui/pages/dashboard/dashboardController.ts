import type { DashboardStatusFilter, DashboardWindow } from '$lib/shared/types/dashboard.js';
import type { DashboardState } from './dashboardState.svelte.js';

export class DashboardController {
	constructor(private readonly state: DashboardState) {}

	clearFilters(): void {
		this.state.query = '';
		this.state.status = 'all';
	}

	setQuery(query: string): void {
		this.state.query = query;
	}

	setStatus(status: DashboardStatusFilter): void {
		this.state.status = status;
	}

	setWindow(window: DashboardWindow): void {
		this.state.window = window;
	}
}
