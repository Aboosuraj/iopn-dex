"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "dark" | "light";

type ThemeContextType = {
  theme: Theme;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("iopn-theme");

    if (savedTheme === "light") {
      setTheme("light");
    } else {
      setTheme("dark");
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    root.classList.remove("dark", "light");
    root.classList.add(theme);

    localStorage.setItem("iopn-theme", theme);
  }, [theme, mounted]);

  const setDarkMode = (value: boolean) => {
    setTheme(value ? "dark" : "light");
  };

  const toggleDarkMode = () => {
    setTheme((current) =>
      current === "dark" ? "light" : "dark"
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        darkMode: theme === "dark",
        setDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}