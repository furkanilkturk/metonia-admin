import type { UserListQuery } from '$lib/shared/types/users.js';

export class UsersController {
	readonly query: UserListQuery;

	constructor(query: UserListQuery) {
		this.query = query;
	}

	pageHref(page: number): string {
		return this.listHref({ page: Math.max(1, page) });
	}

	sortHref(sort: UserListQuery['sort']): string {
		const direction = this.query.sort === sort && this.query.direction === 'asc' ? 'desc' : 'asc';
		return this.listHref({ sort, direction, page: 1 });
	}

	listHref(changes: Partial<UserListQuery> = {}): string {
		const selected = { ...this.query, ...changes };
		const params = new URLSearchParams();
		if (selected.q) params.set('q', selected.q);
		if (selected.status !== 'all') params.set('status', selected.status);
		params.set('sort', selected.sort);
		params.set('direction', selected.direction);
		params.set('page', String(selected.page));
		params.set('pageSize', String(selected.pageSize));
		return `/users?${params.toString()}`;
	}
}
