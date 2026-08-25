import type { DashboardStatusFilter, DashboardWindow } from '$lib/shared/types/dashboard.js';
import type { DashboardState } from './dashboardState.svelte.js';

export class DashboardController {
	constructor(private readonly state: DashboardState) {}

	clearFilters(): void {
		this.state.query = '';
		this.state.status = 'all';
		this.state.window = '7d';
	}

	async refresh(): Promise<void> {
		if (this.state.isLoading) return;
		this.state.isLoading = true;
		try {
			await new Promise((resolve) => setTimeout(resolve, 700));
			this.state.lastUpdated = 'Updated just now';
		} finally {
			this.state.isLoading = false;
		}
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
