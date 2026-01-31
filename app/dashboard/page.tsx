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
import {MessageCircleWarning, ReceiptEuro, Plus, ArrowRight, MessageSquare } from "lucide-react";
import { dashboardStore } from "@/store/dashboardData";
import { TaskWithClient, Action } from "@/lib/types";


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
        <div className="flex flex-col w-full bg-background py-6 gap-4 transition-colors duration-300">

            {/* Weitere Dashboard-Inhalte hier */} 
            <div className="flex mx-1 md:flex-row flex-col gap-4">
                <Link href="/dashboard/clients" className="flex flex-1 items-center gap-2 text-secondary hover:text-secondary-hover">
                    <Card className="flex-1 p-3 bg-card hover:bg-card-hover transition-colors duration-300">
                        <Card.Header>
                            <Card.Title className="text-sm font-semibold text-txt-muted mb-1 ml-2 flex justify-start">Aktive Klienten</Card.Title>
                        </Card.Header>
                        <Card.Content className="flex flex-row justify-around items-end text-txt-muted text-xl mb-2">
                            <div className="flex flex-col gap-1 w-1/2">
                                <h3 className="text-txt-main text-3xl font-bold pb-1">{dashboardData.activeClients}0</h3>
                                <Progress value={60} className="w-24 h-1.5" />
                            </div>
                            <UsersIcon className="w-14 h-14 text-accent p-1.5 bg-primary/10 rounded-lg" />
                        </Card.Content>
                        <Card.Footer>
                        </Card.Footer>
                    </Card>
                </Link>
                <Link href="/dashboard/projects" className="flex flex-1 items-center gap-2 text-secondary hover:text-secondary-hover">
                    <Card className="flex-1 p-3 bg-card hover:bg-card-hover transition-colors duration-300">
                        <Card.Header>
                            <Card.Title className="text-sm font-semibold text-txt-muted mb-1 ml-2 flex justify-start">Laufende Projekte</Card.Title>
                        </Card.Header>
                        <Card.Content className="flex flex-row justify-around items-end text-txt-muted text-xl mb-2">
                            <div className="flex flex-col gap-1 w-1/2">
                                <h3 className="text-txt-main text-3xl font-bold pb-1">{dashboardData.runningProjects}0</h3>
                                <Progress value={60} className="w-24 h-1.5" />
                            </div>
                            <FolderIcon className="w-14 h-14 p-1.5 rounded-lg" />
                        </Card.Content>
                        <Card.Footer>
                        </Card.Footer>
                    </Card>
                </Link>
                <Link href="/dashboard/tasks" className="flex flex-1 items-center gap-2 text-secondary hover:text-secondary-hover">
                    <Card className="flex-1 p-3 bg-card hover:bg-card-hover transition-colors duration-300">
                        <Card.Header>
                            <Card.Title className="text-sm font-semibold text-txt-muted mb-1 ml-2 flex justify-start">Offene Aufgaben</Card.Title>
                        </Card.Header>
                        <Card.Content className="flex flex-row justify-around items-end text-txt-muted text-xl mb-2">
                            <div className="flex flex-col gap-1 w-1/2">
                                <h3 className="text-txt-main text-3xl font-bold pb-1">{dashboardData.openTasks || 0}0</h3>
                                <Progress value={60} className="w-24 h-1.5" />
                            </div>
                            <MessageCircleWarning className="w-14 h-14 text-amber-500 p-1.5 rounded-lg" />
                        </Card.Content>
                        <Card.Footer>
                        </Card.Footer>
                    </Card>
                </Link>
                <Link href="/dashboard/revenue" className="flex flex-1 items-center gap-2 text-secondary hover:text-secondary-hover">
                    <Card className="flex-1 p-3 bg-card hover:bg-card-hover transition-colors duration-300">
                        <Card.Header>
                            <Card.Title className="text-sm font-semibold text-txt-muted mb-1 ml-2 flex justify-start">Umsatz (monatlich)</Card.Title>
                        </Card.Header>
                        <Card.Content className="flex flex-row justify-around items-end text-txt-muted text-xl mb-2">
                            <div className="flex flex-col gap-1 w-1/2">
                                <h3 className="text-txt-main text-3xl font-bold pb-1">{dashboardData.monthlyRevenue}€</h3>
                                <Progress value={60} className="w-24 h-1.5" />
                            </div>
                            <ReceiptEuro className="w-14 h-14 text-white p-1.5 bg-green-800/60 rounded-xl" />
                        </Card.Content>
                        <Card.Footer>
                        </Card.Footer>
                    </Card>
                </Link>
            </div>



            {/* Bento Box Grid */}
            <div className=" mx-1 grid gap-4 grid-cols-1 lg:grid-cols-2" id="infos">
                {/* Aktuelle Aufgaben */}
                <div className="relative">
                    <div className="absolute inset-px rounded-lg bg-card lg:rounded-tl-[1.5rem]"></div>
                    <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-tl-[calc(1.5rem+1px)]">
                        <div className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-0">
                            <div className="flex justify-between items-center">
                                <p className="text-lg font-medium tracking-tight text-txt-main max-lg:text-center">Aktuelle Aufgaben</p>
                                <Link href="/dashboard/tasks" className="text-info text-xs hover:underline">
                                    Mehr anzeigen <ArrowRight className="w-4 h-4 inline-block ml-1"/>
                                </Link>
                            </div>
                            <p className="mt-1 max-w-lg text-xs text-txt-muted max-lg:text-center">Übersicht deiner aktuellen Aufgaben und deren Status.</p>
                        </div>
                        <div className="relative flex-1 w-full p-3 overflow-auto">
                            {dashboardData.currentTasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-4 gap-2">
                                    <MessageCircleWarning className="w-8 h-8 text-amber-500" />
                                    <p className="text-txt-muted text-center text-sm">Keine aktuellen Aufgaben vorhanden</p>
                                    <Link href="/dashboard/tasks/new">
                                        <Button className="bg-primary hover:bg-primary-hover text-white">
                                            Aufgabe erstellen
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <table className="table-auto w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-txt-muted/70 text-left px-2 py-1">Klient</th>
                                            <th className="text-txt-muted/70 text-left px-2 py-1">Status</th>
                                            <th className="text-txt-muted/70 text-left px-2 py-1">Letzter Kontakt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData.currentTasks.map((task: TaskWithClient) => (
                                            <tr key={task.id} className="border-t border-border hover:bg-card-hover">
                                                <td className="px-2 py-2 text-txt-main">
                                                    {task.clientName || 'Kein Klient'}
                                                </td>
                                                <td className="px-2 py-2">
                                                    <span className={`px-2 py-1 rounded text-sm ${
                                                        task.clientStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                                                        task.clientStatus === 'LEAD' ? 'bg-amber-500/20 text-amber-400' :
                                                        task.clientStatus === 'INACTIVE' ? 'bg-gray-500/20 text-gray-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                        {task.clientStatus || 'Unbekannt'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-txt-muted">
                                                    {task.lastContactAt 
                                                        ? new Date(task.lastContactAt).toLocaleDateString('de-DE')
                                                        : 'Kein Kontakt'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                    <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-white/10 lg:rounded-tl-[1.5rem]"></div>
                </div>

                {/* Letzte Aktivitäten */}
                <div className="relative">
                    <div className="absolute inset-px rounded-lg bg-card lg:rounded-tr-[1.5rem]"></div>
                    <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-tr-[calc(1.5rem+1px)]">
                        <div className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-0">
                            <div className="flex justify-between items-center">
                                <p className="text-lg font-medium tracking-tight text-txt-main max-lg:text-center">Letzte Aktivitäten</p>
                                <Link href="/dashboard/activities" className="text-info text-xs hover:underline">
                                    Mehr anzeigen <ArrowRight className="w-4 h-4 inline-block ml-1"/>
                                </Link>
                            </div>
                            <p className="mt-1 max-w-lg text-xs text-txt-muted max-lg:text-center">Die neuesten Aktionen in deinem Konto.</p>
                       </div>
                        <div className="relative flex-1 w-full p-3 ml-6 overflow-auto">
                            <ul className="list-none text-txt-main w-full">
                                {dashboardData.latestActions && dashboardData.latestActions.length > 0 ? (
                                    dashboardData.latestActions.map((action: Action) => (
                                        <li key={action.id} className="mb-2 flex justify-start items-center">
                                            {action.actionType.startsWith('create') && <Plus className="w-6 h-6  mr-1.5 text-txt-main/80"/>}
                                            <span className="text-base text-txt-main/80">{action.description}</span>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-txt-muted text-lg">Bisher ist noch nichts geschehen.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                    <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-white/10 lg:rounded-tr-[1.5rem]"></div>
                </div>

                {/* Letzte Klienten */}
                <div className="relative">
                    <div className="absolute inset-px rounded-lg bg-card lg:rounded-bl-[1.5rem]"></div>
                    <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-bl-[calc(1.5rem+1px)]">
                        <div className="px-4 pt-4 sm:px-6 sm:pt-6">
                            <div className="flex justify-between items-center">
                                <p className="text-lg font-medium tracking-tight text-txt-main max-lg:text-center">Letzte Klienten</p>
                                <Link href="/dashboard/clients" className="text-info text-xs hover:underline">
                                    Mehr anzeigen <ArrowRight className="w-4 h-4 inline-block ml-1"/>
                                </Link>
                            </div>
                            <p className="mt-1 max-w-lg text-xs text-txt-muted max-lg:text-center">Eine Liste der am letzten mit interagierten Klienten.</p>
                        </div>
                        <div className="relative flex-1 w-full p-3 overflow-auto">
                            {dashboardData.currentTasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-4 gap-2">
                                    <UsersIcon className="w-8 h-8 text-blue-500" />
                                    <p className="text-txt-muted text-center text-sm">Keine Klienten vorhanden</p>
                                    <Link href="/dashboard/clients/new">
                                        <Button className="bg-primary hover:bg-primary-hover text-white">
                                            Klienten erstelen
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <table className="table-auto w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-txt-muted/70 text-left px-2 py-1">Klient</th>
                                            <th className="text-txt-muted/70 text-left px-2 py-1">Status</th>
                                            <th className="text-txt-muted/70 text-left px-2 py-1">Letzter Kontakt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData.currentTasks.map((task: TaskWithClient) => (
                                            <tr key={task.id} className="border-t border-border hover:bg-card-hover">
                                                <td className="px-2 py-2 text-txt-main">
                                                    {task.clientName || 'Kein Klient'}
                                                </td>
                                                <td className="px-2 py-2">
                                                    <span className={`px-2 py-1 rounded text-sm ${
                                                        task.clientStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                                                        task.clientStatus === 'LEAD' ? 'bg-amber-500/20 text-amber-400' :
                                                        task.clientStatus === 'INACTIVE' ? 'bg-gray-500/20 text-gray-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                        {task.clientStatus || 'Unbekannt'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-txt-muted">
                                                    {task.lastContactAt 
                                                        ? new Date(task.lastContactAt).toLocaleDateString('de-DE')
                                                        : 'Kein Kontakt'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        
                    </div>
                    <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-white/10 lg:rounded-bl-[1.5rem]"></div>
                </div>

                {/* Umsatz Übersicht */}
                <div className="relative">
                    <div className="absolute inset-px rounded-lg bg-card lg:rounded-br-[1.5rem]"></div>
                    <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-br-[calc(1.5rem+1px)]">
                        <div className="px-4 pt-4 sm:px-6 sm:pt-6">
                           <div className="flex justify-between items-center">
                                <p className="text-lg font-medium tracking-tight text-txt-main max-lg:text-center">Umsatzübersicht</p>
                                <Link href="https://unit-batch.tcub.app/revenue" className="text-info text-xs hover:underline">
                                    Mehr anzeigen <ArrowRight className="w-4 h-4 inline-block ml-1"/>
                                </Link>
                            </div>
                            <p className="mt-1 max-w-lg text-xs text-txt-muted max-lg:text-center">Übersicht deines Umsatzes.</p>

                        </div>
                        <div className="flex flex-1 items-center justify-center px-4 py-3 sm:px-6">
                            <div className="flex flex-col items-center gap-2">
                                <ReceiptEuro className="w-8 h-8 text-green-500 opacity-50" />
                                <p className="text-xl font-bold text-txt-main">{dashboardData.monthlyRevenue}€</p>
                                <p className="text-txt-muted text-xs text-center">Monatlicher Umsatz</p>
                            </div>
                        </div>
                    </div>
                    <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-white/10 lg:rounded-br-[1.5rem]"></div>
                </div>
            </div>

        </div>
    );
}