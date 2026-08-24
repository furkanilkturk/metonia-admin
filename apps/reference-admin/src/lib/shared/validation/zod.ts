import type { z } from 'zod';

export type FieldErrors<Field extends string = string> = Readonly<Partial<Record<Field, string>>>;

/** Converts Zod issues into one stable message per field without exposing Zod internals. */
export function toFieldErrors<Field extends string>(error: z.ZodError): FieldErrors<Field> {
	const errors: Partial<Record<Field, string>> = {};
	for (const issue of error.issues) {
		const field = issue.path[0];
		if (typeof field === 'string' && errors[field as Field] === undefined) {
			errors[field as Field] = issue.message;
		}
	}
	return errors;
}
