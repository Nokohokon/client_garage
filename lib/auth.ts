// Steht alles in ../wiki/betterAuth.md

import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins"; 
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
    }),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		organization({
			teams: {
				enabled: true,
			},
		}),
	],
	user: {
		deleteUser: {
			enabled: true
		},
		additionalFields: {
			initialized: {
				type: "boolean",
				required: true,
				defaultValue: false,
			},
		},
	},
	advanced: {
		database: {
			useNumberId: true,
		},
		cookiePrefix: "client_garage",
	},
});