'use client'
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "nextjs-toast-notify";
import Link from "next/link";
import { Button, Separator, Card } from "@heroui/react";
import { Progress } from "@/components/ui/Progress";
import { UsersIcon } from "@/components/icons/UsersIcon";
import { FolderIcon } from "@/components/icons/FolderIcon";
import {MessageCircleWarning, ReceiptEuro } from "lucide-react";
import { dashboardStore } from "@/store/dashboardData";


export default function DashboardPage() {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const setDashboardData = dashboardStore((state) => state.setData);
    const dashboardData = dashboardStore((state) => state.data);


    
    useEffect(() => {
        async function fetchData() {
            await fetch('/api/dashboard')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Netzwerkantwort war nicht ok');
                }
                return response.json();
            }
            )
            .then(data => {
                console.log('Dashboard-Daten:', data);
                setDashboardData(data);
            })
            .catch(error => {
                console.error('Fehler beim Abrufen der Dashboard-Daten:', error);
                showToast.error(
                    'Fehler beim Laden der Dashboard-Daten. Bitte versuche es erneut.',
                    { duration: 5000 }
                );
            });
        }
        fetchData();
    }, []);


    if (!session) {
        return null; // Oder ein Ladeindikator
    }



    return (
        <div className="flex flex-col min-h-screen w-full bg-background p-4 transition-colors duration-300">
            <h1 className="text-2xl font-bold mb-4 text-txt-main">Willkommen im Dashboard, <span className="text-accent">{session.user.name}</span>!</h1>
            <Separator className="my-4 mr-4 bg-card" />
            {/* Weitere Dashboard-Inhalte hier */} 
            <div className="flex md:flex-row flex-col gap-4">
                <Link href="/clients" className="flex flex-1 items-center gap-2 text-secondary hover:text-secondary-hover">
                    <Card className="flex-1 m-2 p-4 bg-card hover:bg-card-hover transition-colors duration-300">
                        <Card.Header>
                            <Card.Title className="text-lg font-semibold text-txt-muted mb-2 ml-4 flex justify-start">Aktive Klienten</Card.Title>
                        </Card.Header>
                        <Card.Content className="flex flex-row justify-around items-end text-txt-muted text-2xl mb-4">
                            <div className="flex flex-col gap-2 w-1/2 gap">
                                <h3 className="text-txt-main text-5xl font-bold pb-3">{dashboardData.activeClients}</h3>
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
                            <Card.Title className="text-lg font-semibold text-txt-muted mb-2 ml-4 flex justify-start">Laufende Projekte</Card.Title>
                        </Card.Header>
                        <Card.Content className="flex flex-row justify-around items-end text-txt-muted text-2xl mb-4">
                            <div className="flex flex-col gap-2 w-1/2 gap">
                                <h3 className="text-txt-main text-5xl font-bold pb-3">{dashboardData.runningProjects}</h3>
                                <Progress value={60} className="w-32 h-2" />
                            </div>
                            <FolderIcon className="w-16 h-16 p-2  rounded-lg" />
                        </Card.Content>
                        <Card.Footer>
                        </Card.Footer>
                    </Card>
                </Link>
                <Link href="/clients" className="flex flex-1 items-center gap-2 text-secondary hover:text-secondary-hover">
                    <Card className="flex-1 m-2 p-4 bg-card hover:bg-card-hover transition-colors duration-300">
                        <Card.Header>
                            <Card.Title className="text-lg font-semibold text-txt-muted mb-2 ml-4 flex justify-start">Offene Ausgaben</Card.Title>
                        </Card.Header>
                        <Card.Content className="flex flex-row justify-around items-end text-txt-muted text-2xl mb-4">
                            <div className="flex flex-col gap-2 w-1/2 gap">
                                <h3 className="text-txt-main text-5xl font-bold pb-3">{dashboardData.openTasks}</h3>
                                <Progress value={60} className="w-32 h-2" />
                            </div>
                            <MessageCircleWarning className="w-16 h-16 text-amber-500 p-2 rounded-lg" />
                            
                        </Card.Content>
                        <Card.Footer>
                        </Card.Footer>
                    </Card>
                </Link>
                <Link href="/clients" className="flex flex-1 items-center gap-2 text-secondary hover:text-secondary-hover">
                    <Card className="flex-1 m-2 p-4 bg-card hover:bg-card-hover transition-colors duration-300">
                        <Card.Header>
                            <Card.Title className="text-lg font-semibold text-txt-muted mb-2 ml-4 flex justify-start">Umsatz (monatlich)</Card.Title>
                        </Card.Header>
                        <Card.Content className="flex flex-row justify-around items-end text-txt-muted text-2xl mb-4">
                            <div className="flex flex-col gap-2 w-1/2 gap">
                                <h3 className="text-txt-main text-5xl font-bold pb-3">{dashboardData.monthlyRevenue}€</h3>
                                <Progress value={60} className="w-32 h-2" />
                            </div>
                            <ReceiptEuro className="w-16 h-16 text-white p-2 bg-green-800/60 rounded-xl" />
                        </Card.Content>
                        <Card.Footer>
                        </Card.Footer>
                    </Card>
                </Link>
            </div>
            <div className="grid grid-cols-2 mt-4 ">
                <div>
                    <Card className="m-2 p-4 bg-card hover:bg-card-hover transition-colors duration-300">
                        <Card.Header className="flex flex-row justify-between items-start">
                            <Card.Title className="text-lg font-semibold text-txt-muted mb-2 ml-4 flex justify-start">
                                Aktuelle Aufgaben
                            </Card.Title>
                            <Link href="/tasks">
                                <button className="text-info">Alle Aufgaben anzeigen</button>
                            </Link>
                        </Card.Header>
                        <Card.Content>
                            {/* Hier kannst du eine Liste der aktuellen Aufgaben einfügen */}
                            <ul className="list-disc list-inside text-txt-main">
                                {dashboardData.currentTasks && dashboardData.currentTasks.length > 0 ? (
                                    dashboardData.currentTasks.map((task) => (
                                        <li key={task.id} className="mb-2">
                                            <span className="font-semibold">{task.title}</span> für <span className="italic">{task.clientName || 'Unbekannter Klient'}</span>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-txt-muted">Keine aktuellen Aufgaben.</p>
                                )}
                            </ul>
                        </Card.Content>
                    </Card>
                </div>
                <div>
                    <Card className="m-2 p-4 bg-card hover:bg-card-hover transition-colors duration-300">
                        <Card.Header className="flex flex-row justify-between items-start">
                            <Card.Title className="text-lg font-semibold text-txt-muted mb-2 ml-4 flex justify-start">
                                Letzte Aktivitäten
                            </Card.Title>
                            <Link href="/clients">
                                <button className="text-info">Mehr anzeigen</button>
                            </Link>
                        </Card.Header>
                        <Card.Content>
                            {/* Hier kannst du eine Liste der kürzlich hinzugefügten Klienten einfügen */}
                            <ul className="list-disc list-inside text-txt-main">
                                {dashboardData.recentClients && dashboardData.recentClients.length > 0 ? (
                                    dashboardData.recentClients.map((client) => (
                                        <li key={client.id} className="mb-2">
                                            <span className="font-semibold">{client.name}</span> ({client.email || 'Keine E-Mail'})
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-txt-muted">Keine kürzlich hinzugefügten Klienten.</p>
                                )}
                            </ul>
                        </Card.Content>
                    </Card>
                </div>
            </div>

        </div>
    );
}