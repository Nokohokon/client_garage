// api/auth/createOrganisation/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		console.log("Received request to create organization with body:", body);
		const data = await auth.api.createOrganization({
			body: {
				name: body.name, // required
				slug: body.slug, // required
				logo: body.logo,
				metadata: body.metadata,
				userId: body.userId,
				keepCurrentActiveOrganization: body.keepCurrentActiveOrganization,
			},
			headers: await headers(),
		});
		console.log("Organization created successfully:", data);

		return NextResponse.json(data);
    } catch (error) {
		console.error("Error creating organization:", error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: message }, { status: 500 });
    }

}