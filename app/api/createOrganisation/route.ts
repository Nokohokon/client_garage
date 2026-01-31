// api/auth/createOrganisation/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createOrganization } from "@/lib/actions";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		console.log("Received request to create organization with body:", body);
		const data = await createOrganization(body.name, body.slug, body.logo, body.metadata, body.userId, body.keepCurrentActiveOrganization);

		console.log("Organization created successfully:", data);

		return NextResponse.json(data);
    } catch (error) {
		console.error("Error creating organization:", error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: message }, { status: 500 });
    }

}