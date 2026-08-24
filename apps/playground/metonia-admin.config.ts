export default {
	"schemaVersion": 1,
	"project": {
		"name": "playground"
	},
	"packageManager": "bun",
	"ui": {
		"library": "shadcn-svelte",
		"theme": "zinc"
	},
	"dataPattern": "sveltekit-remote-functions",
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
		"users": false
	}
} as const;
