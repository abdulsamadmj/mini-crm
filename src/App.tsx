import { useEffect } from "react";
import { useClientStore } from "./store/clientStore";
import { ModeToggle } from "./components/mode-toggle";

function App() {
  const { theme } = useClientStore();
  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <ModeToggle />
    </div>
  );
}

export default App;
