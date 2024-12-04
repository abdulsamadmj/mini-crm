import { create } from "zustand";

interface ClientState {
  theme: "light" | "dark" | "system";
  switchTheme: (param: "light" | "dark" | "system") => void;
}

export const useClientStore = create<ClientState>((set) => ({
  theme: "system", // Default mode is system
  switchTheme: (theme) => set({ theme }), // Update the theme
}));
