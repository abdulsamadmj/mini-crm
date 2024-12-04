import { Client } from "@/api/clients";
import { create } from "zustand";

interface ClientState {
  theme: "light" | "dark" | "system";
  switchTheme: (param: "light" | "dark" | "system") => void;
  clientDialog: {
    open: boolean;
    client: Client | null;
  };
  setClientDialog: (client: { open: boolean; client: Client | null }) => void;
}

export const useClientStore = create<ClientState>((set) => ({
  theme: "system", // Default mode is system
  switchTheme: (theme) => set({ theme }), // Update the theme
  clientDialog: {
    open: false,
    client: null,
  },
  setClientDialog: (clientDialog) => set({ clientDialog }),
}));
