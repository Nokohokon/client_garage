import { create } from "zustand";


interface navbarProps {
    isExpanded: boolean,
    toggleExpanded: (expanded: boolean) => void;
    isMobileExpanded: boolean,
    toggleMobileExpanded: (expanded: boolean) => void;
}

export const navbarStore = create<navbarProps>((set) => ({
    isExpanded: false,
    toggleExpanded: (expanded: boolean) =>  set({isExpanded: !expanded}),
    isMobileExpanded: false,
    toggleMobileExpanded: (expanded: boolean) =>  set({isMobileExpanded: !expanded}),
}))