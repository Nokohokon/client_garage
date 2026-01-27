import { create } from "zustand";


interface ChoiceSwitcher {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const useIsOpen = create<ChoiceSwitcher>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),

}))