import { create } from "zustand";


interface navbarProps {
    date: Date | null,
    setDate: (date: Date) => void;
}

export const dashboardNavbarStore = create<navbarProps>((set) => ({
    date: null,
    setDate: (date: Date) =>  set({date: date}),
}))