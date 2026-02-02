import { create } from "zustand";


interface ChoiceSwitcher {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    isTypeOpen: boolean;
    setIsTypeOpen: (isTypeOpen: boolean) => void;
    isStatusOpen: boolean;
    setIsStatusOpen: (isStatusOpen: boolean) => void;
    isAddClientOpen: boolean;
    setIsAddClientOpen: (isAddClientOpen: boolean) => void;
}

export const useIsOpen = create<ChoiceSwitcher>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
  isTypeOpen: false,
  setIsTypeOpen: (isTypeOpen: boolean) => set({ isTypeOpen }),
  isStatusOpen: false,
  setIsStatusOpen: (isStatusOpen: boolean) => set({ isStatusOpen }),
  isAddClientOpen: false,
  setIsAddClientOpen: (isAddClientOpen: boolean) => set({ isAddClientOpen }),
}))