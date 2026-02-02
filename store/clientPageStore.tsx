import { create } from "zustand";
import { Client, ClientStatus, ClientType } from "@/lib/types";

interface ClientCounts {
  total: number;
  active: number;
  lead: number;
  inactive: number;
  archived: number;
}

interface ClientPageState {
  // =====================
  // Data
  // =====================
  clients: Client[];
  counts: ClientCounts;

  // =====================
  // UI State
  // =====================
  isLoading: boolean;
  error: string | null;

  // =====================
  // Filters / Query
  // =====================
  search: string;
  status: ClientStatus | "ALL";
  type: ClientType | "ALL";

  // =====================
  // Pagination
  // =====================
  page: number;
  pageSize: number;
  total: number;

  // =====================
  // Actions
  // =====================
  setClients: (clients: Client[]) => void;
  setCounts: (counts: ClientCounts) => void;
  setSearch: (search: string) => void;
  setStatus: (status: ClientPageState["status"]) => void;
  setType: (type: ClientPageState["type"]) => void;
  setPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetFilters: () => void;
  setTotal: (total: number) => void;
}

export const useClientPageStore = create<ClientPageState>((set) => ({
  // =====================
  // Initial Data
  // =====================
  clients: [],
  counts: {
    total: 0,
    active: 0,
    lead: 0,
    inactive: 0,
    archived: 0,
  },

  // =====================
  // Initial UI State
  // =====================
  isLoading: false,
  error: null,

  // =====================
  // Initial Filters
  // =====================
  search: "",
  status: "ALL",
  type: "ALL",

  // =====================
  // Initial Pagination
  // =====================
  page: 1,
  pageSize: 10,
  total: 0,
  setTotal: (total) => set({ total }),

  // =====================
  // Actions
  // =====================
  setClients: (clients) => set({ clients }),
  setCounts: (counts) => set({ counts }),

  setSearch: (search) =>
    set({
      search,
      page: 1, // Reset pagination on filter change
    }),

  setStatus: (status) =>
    set({
      status,
      page: 1,
    }),

  setType: (type) =>
    set({
      type,
      page: 1,
    }),

  setPage: (page) => set({ page }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  resetFilters: () =>
    set({
      search: "",
      status: "ALL",
      type: "ALL",
      page: 1,
    }),
}));
