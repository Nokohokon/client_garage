'use client'
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "nextjs-toast-notify";
import Link from "next/link";
import { Button, Separator, Card } from "@heroui/react";
import { Progress } from "@/components/ui/Progress";
import { UsersIcon } from "@/components/icons/UsersIcon";
import { Folder, MessageCircleWarning, ReceiptEuro } from "lucide-react";


export default function DashboardPage() {
    const router = useRouter();
    const { data: session } = authClient.useSession();

    if (!session) {
        return null; // Oder ein Ladeindikator
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-background p-4 transition-colors duration-300">
            <h1 className="text-2xl font-bold mb-4 text-txt-main">Willkommen im Dashboard, <span className="text-accent">{session.user.name}</span>!</h1>
            <Separator className="my-4 mr-4 bg-card" />
            {/* Weitere Dashboard-Inhalte hier */} 
            <div className="flex flex-row gap-4">
                <Link href="/clients" className="flex flex-1 items-center gap-2 text-secondary hover:text-secondary-hover">
                    <Card className="flex-1 m-2 p-4 bg-card hover:bg-card-hover transition-colors duration-300">
                        <Card.Header>
                            <Card.Title className="text-lg font-semibold text-txt-muted mb-2 ml-4 flex justify-start">Aktive Klienten</Card.Title>
                        </Card.Header>
                        <Card.Content className="flex flex-row justify-around items-end text-txt-muted text-2xl mb-4">
                            <div className="flex flex-col gap-2 w-1/2 gap">
                                <h3 className="text-txt-main text-5xl font-bold pb-3">24</h3>
                                <Progress value={60} className="w-32 h-2" />
                            </div>
                            <UsersIcon className="w-16 h-16 text-accent p-2 bg-primary/10 rounded-lg" />
                        </Card.Content>
                        <Card.Footer>
                        </Card.Footer>
                    </Card>
                </Link>
                <Link href="/clients" className="flex flex-1 items-center gap-2 text-secondary hover:text-secondary-hover">
                    <Card className="flex-1 m-2 p-4 bg-card hover:bg-card-hover transition-colors duration-300">
                        <Card.Header>
                            <Card.Title className="text-lg font-semibold text-txt-main mb-2">Laufende Projekte</Card.Title>
                        </Card.Header>
                        <Card.Content className="text-txt-muted text-2xl mb-4">
    
                            123
                        </Card.Content>
                        <Card.Footer>

                            <Button variant="primary">Zu den Klienten</Button>

                        </Card.Footer>
                    </Card>
                </Link>
                <Link href="/clients" className="flex flex-1 items-center gap-2 text-secondary hover:text-secondary-hover">
                    <Card className="flex-1 m-2 p-4 bg-card hover:bg-card-hover transition-colors duration-300">
                        <Card.Header>
                            <Card.Title className="text-lg font-semibold text-txt-main mb-2">Offene Aufgaben</Card.Title>
                        </Card.Header>
                        <Card.Content className="text-txt-muted text-2xl mb-4">
                            123
                        </Card.Content>
                        <Card.Footer>
                            <Link href="/clients">
                                <Button variant="primary">Zu den Klienten</Button>
                            </Link>
                        </Card.Footer>
                    </Card>
                </Link>
                <Link href="/clients" className="flex flex-1 items-center gap-2 text-secondary hover:text-secondary-hover">
                    <Card className="flex-1 m-2 p-4 bg-card hover:bg-card-hover transition-colors duration-300">
                        <Card.Header>
                            <Card.Title className="text-lg font-semibold text-txt-main mb-2">Umsatz</Card.Title>
                        </Card.Header>
                        <Card.Content className="text-txt-muted text-2xl mb-4">
                            123
                        </Card.Content>
                        <Card.Footer>
                            <Link href="/clients">
                                <Button variant="primary">Zu den Klienten</Button>
                            </Link>
                        </Card.Footer>
                    </Card>
                </Link>
            </div>
        </div>
    );
}