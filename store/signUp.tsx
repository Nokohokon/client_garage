import { create } from "zustand";

interface SignUpForm {
    name: string;
    email: string;
    password: string;
    loading: boolean;
    setName: (name: string) => void;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    setLoading: (loading: boolean) => void;
}

export const useSignUpForm = create<SignUpForm>((set) => ({
  name: '',
  email: '',
  password: '',
  loading: false,
  setName: (name: string) => set({ name }),
  setEmail: (email: string) => set({ email }),
  setPassword: (password: string) => set({ password }),
  setLoading: (loading: boolean) => set({ loading: !loading})
}))