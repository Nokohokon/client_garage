'use client'
import { navbarStore } from "@/store/navbarStore";
import { Toolbox, Users, Euro, House, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { Dropdown, Button, Label, Description, Header, Kbd, Separator } from '@heroui/react';


interface links {
    label: string,
    infoPath?: string,
    path: string,
}

export default function Navbar () {
    const isExpanded = navbarStore((state) => state.isExpanded);
    const isMobileExpanded = navbarStore((state) => state.isMobileExpanded);
    const { toggleExpanded, toggleMobileExpanded } = navbarStore();
    const {data: session} = authClient.useSession()
    const router = useRouter()
    const pathname = usePathname()


    const links : links[] = [
        {
            label: "TCUB",
            infoPath: "https://tcub.app",
            path: 'https://tcub.app'
        },
        {
            label: 'Time Tweaks',
            infoPath: 'https://tcub.app/tools/time-tweaks',
            path: 'https://time-tweaks.tcub.app'
        },
        {
            label: 'Client Garage',
            infoPath: 'https://tcub.app/tools/client-garage',
            path: 'https://client-garage.tcub.com'
        },
        {
            label: 'Unit Batch',
            path: 'https://unit-batch.tcub.app',
            infoPath: 'https://tcub.app/tools/unit-batch'
        }
    ]


    return (
        <nav className="flex flex-row md:justify-around justify-between items-center md:items-center md:px-0 px-5 md:pt-10">
            <div className="">
                <Link href={"https://client-garage.tcub.com"}>
                    <Image alt="Client Garage Logo" width={100} height={100} src={"/tcub/client_garage.png"}/>
                </Link>
            </div>
            <div className="md:flex hidden flex-row justify-center items-center gap-4">
                {
                    links.map((link, idx) => (
                        <Link key={link.label} className={`${pathname.startsWith(link.infoPath || '') ? 'text-primary hover:text-primary-hover' : 'text-secondary text-secondary-hover'} hover:bg-card-hover p-2 rounded-lg`} href={link.path}>{link.label}</Link>
                    ))
                }
            </div>
            <div className="md:block hidden">
                {
                session?.user ? (
                    <Dropdown>
                        <Dropdown.Trigger className="cursor-pointer flex items-center gap-2 p-2 rounded-lg bg-card hover:bg-card-hover">

                            <Image 
                                src={session.user.image || "/tcub/client_garage.png"} 
                                width={36} 
                                height={36} 
                                alt="User Avatar" 
                                className="rounded-full border border-border"
                            />
                            <span className="text-txt-main text-xl tracking-tight font-medium">{session.user.name}</span>

                        </Dropdown.Trigger>
                        <Dropdown.Popover className="bg-card border border-border rounded-lg shadow-lg min-w-[200px]">
                            <Dropdown.Menu className="p-2">
                                <Dropdown.Section>
                                    <Header className="px-3 py-2 border-b border-border mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-base font-medium text-txt-main">{session.user.name}</span>
                                            <span className="text-sm text-txt-muted">{session.user.email}</span>
                                        </div>
                                    </Header>
                                </Dropdown.Section>
                                <Dropdown.Item 
                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-card-hover cursor-pointer text-txt-main"
                                    onAction={() => router.push('/dashboard')}
                                >
                                    <House size={18} className="text-primary" />
                                    <Label className="text-txt-main">Dashboard</Label>
                                </Dropdown.Item>
                                <Dropdown.Item 
                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-card-hover cursor-pointer text-txt-main"
                                    onAction={() => router.push('/dashboard/settings')}
                                >
                                    <Toolbox size={18} className="text-primary" />
                                    <Label className="text-txt-main">Einstellungen</Label>
                                </Dropdown.Item>
                                <Separator className="my-2 border-border" />
                                <Dropdown.Item 
                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-500/10 cursor-pointer text-red-500"
                                     
                                    onAction={async () => {
                                        await authClient.signOut();
                                        router.push('/');
                                    }}
                                >
                                    <Label className="text-red-500">Ausloggen</Label>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                )
                : 
                (
                    <div className="">
                        <Button onClick={()=>router.push('/login')}>Einloggen</Button>
                    </div>
                )
                }
            </div>


            <div className="md:hidden block">
                { isMobileExpanded ?
                <X className="text-primary  cursor-pointer " onClick={()=> toggleMobileExpanded(isMobileExpanded)}/>
                :
                <Menu className="text-primary  cursor-pointer " onClick={()=> toggleMobileExpanded(isMobileExpanded)}/>
                }
            </div>

            
            { isMobileExpanded && (
                <div className="absolute top-30 left-0 w-full w-full bg-card border-t border-border flex flex-col justify-center items-center gap-4 py-4 md:hidden z-50">
                    {
                        links.map((link, idx) => (
                            <Link key={link.label} className={`${pathname.startsWith(link.infoPath || '') ? 'text-primary hover:text-primary-hover' : 'text-secondary text-secondary-hover'} hover:bg-card-hover p-2 rounded-lg`} href={link.path}>{link.label}</Link>
                        ))
                    }
                    {
                        session?.user ? (
                            <Link className="flex flex-row p-2 rounded-lg border border-border bg-card hover:bg-card-hover items-center gap-3 cursor-pointer"  href={"/dashboard"}>
                                <Image src={session.user.image || "/tcub/client_garage.png"} width={30} height={30} alt="User Logo"/>
                                <div className="flex flex-col">
                                    <p className="text-xl text-txt-main">{session.user.name}</p>
                                    <p className="text-lg text-txt-muted">{session.user.email}</p>
                                </div>
                            </Link>
                        )
                        : 
                        (
                            <div className="">
                                <Button onClick={()=>router.push('/login')}>Einloggen</Button>
                            </div>
                        )
                    }
                </div>
            )}
        </nav>
    )

}