import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins"; 
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; 
import * as schema from "@/db/schema"; // ALLES importieren

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema, // <--- BEHEBT DEN FEHLER
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
        cookiePrefix: "client_garage",
        crossSubDomainCookies: {
            enabled: true,
            domain: process.env.NODE_ENV === "production" ? ".tcub.app" : "localhost", 
        },
    },    
    trustedOrigins: [
        'https://tcub.app',
        'https://garage.tcub.app',
        'https://timetweaks.tcub.app',
        'https://unitbatch.tcub.app',
        'http://localhost:3000',
    ],
});