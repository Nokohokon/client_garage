
import { create } from "zustand";

type Choice = "signIn" | "signUp";

interface ChoiceSwitcher {
    choice: Choice;
    setChoice: (choice: Choice) => void;
}

export const useSwitcher = create<ChoiceSwitcher>((set) => ({
  choice: "signIn",
  setChoice: (choice: Choice) => set({ choice }),

}))