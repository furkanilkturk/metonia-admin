export type DashboardOperationStatus = 'healthy' | 'attention' | 'scheduled';
export type DashboardStatusFilter = 'all' | DashboardOperationStatus;
export type DashboardWindow = '24h' | '7d' | '30d';

export interface DashboardOperation {
	readonly id: string;
	readonly name: string;
	readonly owner: string;
	readonly status: DashboardOperationStatus;
	readonly updatedAt: string;
}

export interface DashboardMetric {
	readonly detail: string;
	readonly label: string;
	readonly value: string;
}

export interface DashboardActivity {
	readonly detail: string;
	readonly id: string;
	readonly time: string;
	readonly title: string;
}
