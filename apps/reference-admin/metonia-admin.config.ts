export default {
	"schemaVersion": 1,
	"project": {
		"name": "reference-admin"
	},
	"packageManager": "bun",
	"ui": {
		"library": "shadcn-svelte",
		"theme": "zinc"
	},
	"dataPattern": "sveltekit-standard",
	"validation": {
		"library": "zod"
	},
	"database": {
		"orm": "drizzle",
		"dialect": "postgresql",
		"provider": "generic",
		"driver": "pg"
	},
	"docker": {
		"enabled": false
	},
	"resources": {
		"users": true
	}
} as const;
