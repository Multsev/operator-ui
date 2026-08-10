import { useEffect, useState } from "react";
import { ApplicationShell } from "./ApplicationShell";
import { NetworkStoreProvider } from "./network/NetworkStore";
import { frameworkPersistence } from "../framework";

type Theme = "light" | "dark";

export function App() {
  const [theme, setTheme] = useState<Theme>(() =>
    frameworkPersistence.get<Theme>(
      "theme",
      "light",
      (value): value is Theme => value === "light" || value === "dark",
    ),
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    frameworkPersistence.set("theme", theme);
  }, [theme]);
  useEffect(() => {
    const requested = Number(
      new URLSearchParams(location.search).get("scale") || 1,
    );
    const scale = [1, 1.25, 1.5, 2].includes(requested) ? requested : 1;
    document.documentElement.style.setProperty("--ou-ui-scale", String(scale));
  }, []);
  return (
    <NetworkStoreProvider>
      <ApplicationShell
        theme={theme}
        onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
      />
    </NetworkStoreProvider>
  );
}
