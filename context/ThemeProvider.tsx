"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

type ThemeMode = "light" | "dark" | "system"

type ThemeContextValue = {
  mode: ThemeMode
  resolvedTheme: "light" | "dark"
  setMode: (mode: ThemeMode) => void
}

const THEME_KEY = "sallify-theme"

const ThemeContext = createContext<ThemeContextValue | null>(null)

function resolveSystemTheme() {
  if (typeof window === "undefined") return "light" as const
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function applyThemeClass(theme: "light" | "dark") {
  const html = document.documentElement
  html.classList.remove("light", "dark")
  html.classList.add(theme)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  const applyMode = useCallback((nextMode: ThemeMode) => {
    const nextResolved = nextMode === "system" ? resolveSystemTheme() : nextMode
    setModeState(nextMode)
    setResolvedTheme(nextResolved)
    applyThemeClass(nextResolved)
    window.localStorage.setItem(THEME_KEY, nextMode)
  }, [])

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY) as ThemeMode | null
    const initialMode: ThemeMode =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system"

    const frame = requestAnimationFrame(() => applyMode(initialMode))

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const saved = window.localStorage.getItem(THEME_KEY) as ThemeMode | null
      if ((saved || "system") === "system") {
        applyMode("system")
      }
    }

    mediaQuery.addEventListener("change", onChange)
    return () => {
      cancelAnimationFrame(frame)
      mediaQuery.removeEventListener("change", onChange)
    }
  }, [applyMode])

  const setMode = useCallback(
    (nextMode: ThemeMode) => {
      applyMode(nextMode)
    },
    [applyMode]
  )

  const value = useMemo(
    () => ({ mode, resolvedTheme, setMode }),
    [mode, resolvedTheme, setMode]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
