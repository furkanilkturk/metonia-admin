export type DashboardOperationStatus = 'healthy' | 'attention' | 'scheduled';
export type DashboardStatusFilter = 'all' | DashboardOperationStatus;
export type DashboardWindow = '24h' | '7d' | '30d';

export interface DashboardOperation {
	readonly detail: string;
	readonly id: string;
	readonly name: string;
	readonly owner: string;
	readonly ownerInitials: string;
	readonly status: DashboardOperationStatus;
	readonly updatedAt: string;
	readonly updatedWithin: DashboardWindow;
}

export interface DashboardMetric {
	readonly detail: string;
	readonly label: string;
	readonly tone: 'brand' | 'success' | 'warning';
	readonly value: string;
}

export interface DashboardActivity {
	readonly detail: string;
	readonly id: string;
	readonly time: string;
	readonly title: string;
}
