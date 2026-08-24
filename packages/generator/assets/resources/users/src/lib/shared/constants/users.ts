export const userStatuses = ['active', 'invited', 'disabled'] as const;
export const editableUserStatuses = ['active', 'invited'] as const;
export const userRoles = ['admin', 'editor', 'viewer'] as const;
export const userSortFields = ['name', 'email', 'status', 'createdAt'] as const;
export const sortDirections = ['asc', 'desc'] as const;

export const userStatusLabels = {
	active: 'Active',
	invited: 'Invited',
	disabled: 'Disabled'
} as const;

export const userRoleLabels = {
	admin: 'Admin',
	editor: 'Editor',
	viewer: 'Viewer'
} as const;
