import { createContext, useContext, useEffect, useState } from "react";

type ThemeValue = "light" | "dark"

interface ThemeContextValue {
    theme: ThemeValue
    setTheme: (theme: ThemeValue) => void
}


const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({children}: {children: React.ReactNode}) {
    const [theme, setTheme] = useState<ThemeValue>("dark")
    const value: ThemeContextValue = {theme, setTheme}

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
    }, [theme])

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useThemeContext() {
    const context = useContext(ThemeContext)
    if (context === null) {
        throw new Error("Function useThemeContext() must be used within a ThemeProvider.")
    }
    return context
}