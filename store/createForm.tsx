import { create } from "zustand";

interface setMetadata {
    property: string,
    value: string
}

interface OrganisationForm {
    name: string;
    slug: string;
    metadata: {
        logo?: string;
        email?: string;
        telefon?: string;
        website?: string;
        branche?: string;
    };
    setName: (name: string) => void;
    setSlug: (slug: string) => void;
    setMetadata: ({property, value}:setMetadata ) => void;
    resetForm: () => void;
}

export const createOrganisation = create<OrganisationForm>((set) => ({
    name: 'Muster GmbH',
    slug: 'muster-gmbh',
    metadata: {  
    },
    setName: (name: string) => set({name: name}),
    setSlug: (slug: string) => set({slug: slug}),
    setMetadata: ({ property, value }: setMetadata) => 
        set((state) => ({
            metadata: {
                ...state.metadata, // Wir kopieren das alte Metadata-Objekt
                [property]: value  // Wir setzen den dynamischen Key
            }
        })),
    resetForm: () => set({
        name: '',
        slug: '',
        metadata: {}
    }),
}))


interface ClientForm {
    name: string;
    email: string;
    setName: (name: string) => void;
    setEmail: (email: string) => void;
    resetForm: () => void;
}

export const clientFormState = create<ClientForm>((set) => ({
    name: 'Max Mustermann',
    email: 'max@mustermann.de',
    setName: (name: string) => set({name: name}),
    setEmail: (email: string) => set({email: email}),
    resetForm: () => set({
        name: 'Max Mustermann',
        email: 'max@mustermann.de',
    }),
}))