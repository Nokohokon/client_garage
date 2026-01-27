'use client'
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "nextjs-toast-notify";
import Link from "next/link";
import { Button } from "@heroui/react";


export default function DashboardPage() {
    const router = useRouter();
    const { data: session } = authClient.useSession();

    if (!session) {
        return null; // Oder ein Ladeindikator
    }

    return (
        <div className="flex flex-col min-h-screen bg-background p-4 transition-colors duration-300">
            <h1 className="text-2xl font-bold mb-4 text-txt-main">Willkommen im Dashboard, <span className="text-accent">{session.user.name}</span>!</h1>
            {/* Weitere Dashboard-Inhalte hier */} 

        </div>
    );
}