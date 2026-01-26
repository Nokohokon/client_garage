'use client';
import { Accordion } from "@heroui/react";
import { OrganisationSelect } from "./sidebar/organisationSelect";
import { User, FolderKanban, Building2, Settings, CircleSmall } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";


export function Sidebar() {
    const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-full max-w-md gap-4 bg-card rounded-sm border border-border p-4">
      <h2 className="text-xl font-bold mb-4 text-foreground">Menu Sidebar</h2>
      <OrganisationSelect />
        <Accordion allowsMultipleExpanded className="w-full max-w-md text-txt-main ">
        <Accordion.Item>
            <Accordion.Heading>
            <Accordion.Trigger>
                <span className={`flex justify-center items-center gap-2 ${pathname?.startsWith("/dashboard/clients") ? "underline" : ""}`} ><User/> Klienten</span>
                <Accordion.Indicator />
            </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
            <Accordion.Body className="text-txt-muted flex flex-col gap-2 justify-center items-start">
                <Link href="/dashboard/clients" className="hover:text-foreground flex justify-center items-center gap-2"> <CircleSmall/> Alle Klienten</Link>
                <Link href="/dashboard/clients/new" className="hover:text-foreground flex justify-center items-center gap-2"><CircleSmall/> Neuen Klienten anlegen</Link>
                <Link href="/dashboard/clients/statistics" className="hover:text-foreground flex justify-center items-center gap-2"><CircleSmall/> Klienten Statistiken</Link>
            </Accordion.Body>
            </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item>
            <Accordion.Heading>
            <Accordion.Trigger>
                <span className={`flex justify-center items-center gap-2 ${pathname?.startsWith("/dashboard/projects") ? "underline" : ""}`}><FolderKanban/>Einzelklienten-Projekte</span>
                <Accordion.Indicator />
            </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
            <Accordion.Body className="text-txt-muted flex flex-col gap-2 justify-center items-start">
                <Link href="/dashboard/projects" className="hover:text-foreground flex justify-center items-center gap-2"> <CircleSmall/> Alle Projekte</Link>
                <Link href="/dashboard/projects/new" className="hover:text-foreground flex justify-center items-center gap-2"><CircleSmall/> Neues Projekt anlegen</Link>
            </Accordion.Body>
            </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item>
            <Accordion.Heading>
            <Accordion.Trigger>
                <span className={`flex justify-center items-center gap-2 ${pathname?.startsWith("/dashboard/organisation") ? "underline" : ""}`} ><Building2/> Organisation</span>
                <Accordion.Indicator />
            </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
            <Accordion.Body className="text-txt-muted flex flex-col gap-2 justify-center items-start">
                <Link href="/dashboard/organisation/settings" className="hover:text-foreground flex justify-center items-center gap-2"> <CircleSmall/> Organisationseinstellungen</Link>
                <Link href="/dashboard/organisation/teams" className="hover:text-foreground flex justify-center items-center gap-2"><CircleSmall/> Teams verwalten</Link>
                <Link href="/dashboard/organisation/members" className="hover:text-foreground flex justify-center items-center gap-2"><CircleSmall/> Mitglieder verwalten</Link>
                <Link href="/dashboard/organisation/clients" className="hover:text-foreground flex justify-center items-center gap-2"><CircleSmall/> Klienten</Link>
                <Link href="/dashboard/organisation/projects" className="hover:text-foreground flex justify-center items-center gap-2"><CircleSmall/> Projekte</Link>
            </Accordion.Body>
            </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item>
            <Accordion.Heading>
            <Accordion.Trigger>
                <span className={`flex justify-center items-center gap-2 ${pathname?.startsWith("/dashboard/settings") ? "underline" : ""}`}><Settings/> Einstellungen</span>
                <Accordion.Indicator />
            </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
            <Accordion.Body className="text-txt-muted flex flex-col gap-2 justify-center items-start">
                <Link href="/dashboard/settings/profile" className="hover:text-foreground flex justify-center items-center gap-2"><CircleSmall/> Profil Einstellungen</Link>
                <Link href="/dashboard/settings/account" className="hover:text-foreground flex justify-center items-center gap-2"><CircleSmall/> Account Einstellungen</Link>
            </Accordion.Body>
            </Accordion.Panel>
        </Accordion.Item>
        </Accordion>
    </div>
    );
}