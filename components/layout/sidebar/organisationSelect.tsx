"use client";

import { Button, Label, Input, TextField, Select, Avatar, AvatarFallback, Modal, ListBox } from "@heroui/react";
import { useIsOpen } from "@/store/open";
import { createOrganisation } from "@/store/createOrganisationForm";
import { authClient } from "@/lib/auth-client";
import { Building2, Plus, Mail } from "lucide-react";
import { showToast } from "nextjs-toast-notify";

// TODO: Diese URL in eine Umgebungsvariable (.env) verschieben!
const webHookUrl = "https://discord.com/api/webhooks/1465779729545040014/4zdrqAOeQS3s2Zx9-4T2IjDFieeiORvWdUvtwoZq4Emhlw8mz2XcD96FhuV4AxOJOCIi";

async function sendDiscordMessage(message: string) {
    const embedPayload = {
        embeds: [{
            title: '🚨 System-Bericht',
            description: message,
            color: 15548997,
            fields: [{ name: 'Zeit', value: new Date().toLocaleString('de-DE') }]
        }]
    };
    try {
        await fetch(webHookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(embedPayload)
        });
    } catch (error) {
        console.error('Discord Webhook Fehler:', error);
    }
}

export function OrganisationSelect() {
    const isOpen = useIsOpen((state) => state.isOpen);
    const setIsOpen = useIsOpen((state) => state.setIsOpen);
    
    // Form State aus dem Store
    const name = createOrganisation((state) => state.name);
    const slug = createOrganisation((state) => state.slug);
    const metadata = createOrganisation((state) => state.metadata);
    const { setName, setSlug, setMetadata, resetForm } = createOrganisation();

    // Auth Hooks
    const { data: session } = authClient.useSession();
    const { data: organisations } = authClient.useListOrganizations();
    const { data: activeOrga } = authClient.useActiveOrganization();
    const { data: activeMember } = authClient.useActiveMember();

    async function handleSubmit(e: React.FormEvent) {
        // Verhindert den Seiten-Reload
        e.preventDefault();

        if (!name || !slug) {
            showToast.error("Bitte fülle alle Pflichtfelder aus.");
            return;
        }

        const response = await fetch('/api/createOrganisation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                slug: slug,
                logo: metadata.logo || "https://example.com/logo.png",
                metadata: metadata,
                keepCurrentActiveOrganization: false
            })
        });

        const data = await response.json();
        
        console.log("Organization create response:", { data});
        await resetForm();
        /*
        if (error) {
            sendDiscordMessage(`Fehler beim Erstellen der Organisation: ${error.message}`);
            showToast.error('Fehler beim Erstellen der Organisation.');

        } else {
            */
            sendDiscordMessage(`Neue Organisation erstellt: ${name} (ID: ${data?.id ?? 'unbekannt'}) von ${session?.user.email}`);
            showToast.success('Organisation erfolgreich erstellt!');
            
            // Seite neu laden, um die neue Organisation in der Liste zu sehen
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        //}
    }

    // Handler zum Wechseln der aktiven Organisation
    async function handleOrganisationChange(orgId: string) {
        if (!orgId) return;
        
        const { error } = await authClient.organization.setActive({
            organizationId: orgId,
        });

        if (error) {
            showToast.error("Fehler beim Wechseln der Organisation.");
            console.error("Fehler beim Wechseln der Organisation:", error);
        } else {
            showToast.success("Organisation gewechselt!");
            setIsOpen(false);
        }
    }



    return (
        <div className="space-y-4">

            {organisations && organisations.length > 0 ? (
                <Select
                    className="w-[256px]"
                    isOpen={isOpen}
                    placeholder="Bitte Organisation wählen"
                    onOpenChange={setIsOpen}
                    onChange={(e) => handleOrganisationChange(e as string)}
                >
                    <Label>Organisation wechseln</Label>
                    <Select.Trigger className="bg-card-nested hover:bg-card-nested-hover border border-border">
                        <div className="flex justify-between gap-4 items-center">
                            <Avatar>
                                <AvatarFallback>{activeOrga?.name.charAt(0) || "M"}</AvatarFallback>
                                <Avatar.Image src={activeOrga?.logo || ""} alt={activeOrga?.name || "Logo"} />
                            </Avatar>
                            <div className="flex flex-col justify-center items-start">
                                <h3 className="text-xl tracking-tight text-txt-main">
                                    {activeOrga?.name || "Wähle Orga"}
                                </h3>
                                <p className="text-md rounded-lg text-txt-muted">
                                    {activeMember?.role.toUpperCase() || "MEMBER"}
                                </p>
                            </div>
                        </div>
                        <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                        <ListBox className="bg-card-nested text-txt-muted border border-border hover:bg-card-nested-hover">
                            {organisations.map((org) => (
                                <ListBox.Item key={org.id} id={org.id} textValue={org.name} className="hover:text-txt-inv">
                                    {org.name}
                                </ListBox.Item>
                            ))}
                        </ListBox>
                    </Select.Popover>
                </Select>
            ) : ( "" )}
            <div className="w-full">
                {/* Info-Modal wenn keine Orga existiert */}
                <Modal>
                    <Modal.Backdrop>
                        <Modal.Container>
                            <Modal.Dialog className="bg-card sm:max-w-[360px]">
                                <Modal.CloseTrigger className="bg-card-nested hover:bg-card-nested-hover text-tertiary-fg" />
                                <Modal.Header>
                                    <Modal.Icon className="bg-tertiary text-tertiary-fg"><Building2 /></Modal.Icon>
                                    <Modal.Heading className="text-txt-main">Organisation erstellen</Modal.Heading>
                                </Modal.Header>
                                <Modal.Body>
                                    <p className="text-txt-muted">Erstelle hier deine erste Organisation, um loszulegen!</p>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button className="w-full" slot="close">Verstanden</Button>
                                </Modal.Footer>
                            </Modal.Dialog>
                        </Modal.Container>
                    </Modal.Backdrop>
                </Modal>

                {/* Eigentliches Formular-Modal */}
                <Modal>
                    <Button className="bg-primary text-primary-fg hover:bg-primary-hover">
                        <Plus /> Organisation erstellen
                    </Button>
                    <Modal.Backdrop isDismissable={false}>
                        <Modal.Container placement="auto">
                            <Modal.Dialog className="bg-card sm:max-w-lg">
                                <Modal.CloseTrigger className="bg-card-nested hover:bg-card-nested-hover text-tertiary-fg" />
                                <Modal.Header>
                                    <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
                                        <Mail className="size-5" />
                                    </Modal.Icon>
                                    <Modal.Heading className="text-txt-main">Organisation erstellen</Modal.Heading>
                                    <p className="mt-1.5 text-sm leading-5 text-txt-muted">
                                        Erstelle deine Organisation mit den wichtigsten Informationen.
                                    </p>
                                </Modal.Header>
                                <Modal.Body className="p-6">
                                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                                        <TextField className="w-full" name="name" type="text" isRequired>
                                            <Label>Organisationsname</Label>
                                            <Input 
                                                placeholder="z.B. Muster GmbH" 
                                                className="bg-tertiary text-txt-muted" 
                                                value={name} 
                                                onChange={(e) => setName(e.target.value)} 
                                            />
                                        </TextField>

                                        <TextField className="w-full" name="slug" type="text" isRequired>
                                            <Label>URL-Slug</Label>
                                            <Input 
                                                placeholder="z.B. muster-gmbh" 
                                                className="bg-tertiary text-txt-muted" 
                                                value={slug} 
                                                onChange={(e) => setSlug(e.target.value)} 
                                            />
                                        </TextField>

                                        <TextField className="w-full" name="logo" type="url">
                                            <Label>Logo URL (optional)</Label>
                                            <Input 
                                                placeholder="https://example.com/logo.png" 
                                                className="bg-tertiary text-txt-muted" 
                                                value={metadata.logo || ""} 
                                                onChange={(e) => setMetadata({ property: "logo", value: e.target.value })} 
                                            />
                                        </TextField>

                                        <div className="flex gap-3">
                                            <TextField className="flex-1" name="email" type="email">
                                                <Label>E-Mail</Label>
                                                <Input 
                                                    placeholder="info@muster-gmbh.de" 
                                                    className="bg-tertiary text-txt-muted" 
                                                    value={metadata.email || ""} 
                                                    onChange={(e) => setMetadata({ property: "email", value: e.target.value })} 
                                                />
                                            </TextField>

                                            <TextField className="flex-1" name="phone" type="tel">
                                                <Label>Telefon</Label>
                                                <Input 
                                                    placeholder="+49 123 456789" 
                                                    className="bg-tertiary text-txt-muted" 
                                                    value={metadata.telefon || ""} 
                                                    onChange={(e) => setMetadata({ property: "telefon", value: e.target.value })} 
                                                />
                                            </TextField>
                                        </div>

                                        <TextField className="w-full" name="website" type="url">
                                            <Label>Website</Label>
                                            <Input 
                                                placeholder="https://muster-gmbh.de" 
                                                className="bg-tertiary text-txt-muted" 
                                                value={metadata.website || ""} 
                                                onChange={(e) => setMetadata({ property: "website", value: e.target.value })} 
                                            />
                                        </TextField>

                                        <TextField className="w-full" name="industry" type="text">
                                            <Label>Branche</Label>
                                            <Input 
                                                placeholder="Software Development" 
                                                className="bg-tertiary text-txt-muted" 
                                                value={metadata.branche || ""} 
                                                onChange={(e) => setMetadata({ property: "branche", value: e.target.value })} 
                                            />
                                        </TextField>

                                        <div className="flex gap-2 pt-4">
                                            <Button type="button" variant="secondary" className="flex-1" slot="close">
                                                Abbrechen
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                className="flex-1 bg-primary text-primary-fg hover:bg-primary-hover"
                                                slot="close"
                                            >
                                                Erstellen
                                            </Button>
                                        </div>
                                    </form>
                                </Modal.Body>
                            </Modal.Dialog>
                        </Modal.Container>
                    </Modal.Backdrop>
                </Modal>
            </div>
        </div>
    );
}