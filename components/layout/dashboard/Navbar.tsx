'use client'
import { authClient } from "@/lib/auth-client"
import { Separator, Avatar } from "@heroui/react"
import { Bell, CircleEllipsis } from "lucide-react"
import { JSX, useEffect } from "react"
import { dashboardNavbarStore } from "@/store/dashboardNavbarStore"
import { usePathname } from "next/navigation"

export default function Navbar () {
    const date = dashboardNavbarStore((state) => state.date);
    const setDate = dashboardNavbarStore((state) => state.setDate);
    const pathname: string = usePathname();
    const { data: session} = authClient.useSession()

    useEffect(() => {
        // Set initial date on client mount
        setDate(new Date());
        
        const timer = setInterval(() => {
            setDate(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, [setDate]);


    const codes: Record<string, JSX.Element> = {
        "/dashboard": <h1 className="text-3xl font-bold text-txt-main">Willkommen,<br className="block md:hidden" /> <span className="text-accent">{session?.user.name}</span>!</h1>,
        "/dashboard/clients": <h1 className="text-3xl font-bold text-txt-main">Klienten</h1>,
        "/dashboard/tasks": <h1 className="text-3xl font-bold text-txt-main">Aufgaben</h1>,
        "/dashboard/projects": <h1 className="text-3xl font-bold text-txt-main">Projekte</h1>,
        "/dashboard/notifications": <h1 className="text-3xl font-bold text-txt-main">Benachrichtigungen</h1>,
        "/dashboard/activities": <h1 className="text-3xl font-bold text-txt-main">Letzte Aktivitäten</h1>,
        "/dashboard/revenue": <h1 className="text-3xl font-bold text-txt-main">Umsatz</h1>,
        "/dashboard/organisation": <h1 className="text-3xl font-bold text-txt-main">Organisation</h1>,
        "/dashboard/settings": <h1 className="text-3xl font-bold text-txt-main">Einstellungen</h1>,
        "/dashboard/clients/statistics": <h1 className="text-3xl font-bold text-txt-main">Klienten Statistiken</h1>,
    }


    return (
        <div>
            <div className="py-6 flex mx-1 flex-row justify-between items-center">
                {codes[pathname] || <h1 className="text-3xl font-bold text-txt-main">Willkommen,<br className="block md:hidden" /> <span className="text-accent">{session?.user.name}</span>!</h1>}
                <div
                    className="md:flex items-center hidden rounded-lg bg-card "
                >
                    {/* Linker Bereich: Text & Datum */}
                    <button 
                    className="h-12 px-3 flex flex-row items-center justify-between cursor-pointer hover:bg-card-hover "
                    >
                        <div className="flex flex-col">
                            <span className="text-white font-semibold text-sm">{session?.user.email}</span>
                            <span className="text-white/50 text-[10px]">{date?.toLocaleString()}</span>
                        </div>
                    </button>
                    <div className="flex flex-col justify-center items-center px-2">
                        <Separator orientation="vertical" className="mx-2 h-6 bg-border"/>
                        <button className="cursor-pointer ">
                            <CircleEllipsis className="text-txt-muted  cursor-pointer" />
                        </button>
                        <Separator orientation="vertical" className="mx-2 h-6 bg-border"/>
                    </div>
                    {/* Rechter Bereich: Notification & Profil */}
                    <div className="flex items-center gap-2 hover:bg-card-hover h-12 px-2">
                    <button className="cursor-pointer relative ">
                        <Bell className="text-white " />
                    </button>
                    
                    <button className="cursor-pointer flex items-center gap-2 p-1 rounded-lg ">
                        <Avatar>
                            <Avatar.Image src={session?.user.image || "https://i.pravatar.cc/150?u=a042581f4e29026704d"}/>
                            <Avatar.Fallback>
                                {session?.user.name.charAt(0)}
                            </Avatar.Fallback>
                        </Avatar>
                    </button>
                    </div>
                </div>
                <div className="md:hidden flex items-center gap-2 hover:bg-card-hover h-12 px-2 rounded-lg ">
                    
                    <button className="cursor-pointer flex items-center gap-2 p-1 rounded-lg ">
                        <Avatar>
                            <Avatar.Image src={session?.user.image || "https://i.pravatar.cc/150?u=a042581f4e29026704d"}/>
                            <Avatar.Fallback>
                                {session?.user.name.charAt(0)}
                            </Avatar.Fallback>
                        </Avatar>
                    </button>
                </div>
            </div>
            <Separator className="mb-4 mr-4 h-0.5 bg-card" />

        </div>
    )
}
