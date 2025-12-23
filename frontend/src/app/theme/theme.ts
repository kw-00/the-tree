import { useEffect, useReducer } from "react"

const themes = ["dark", "light"] as const
export type Theme = typeof themes[number]

const root = document.getElementById("root")
if (!root) throw new Error("Root does not exist.")
const initialDataTheme = root.getAttribute("data-theme")
if (!initialDataTheme || !themes.includes(initialDataTheme as Theme)) {
    throw new Error("Root's data-theme attribute does is not a valid theme.")
}


const themeChangedSubscribers = new Set<() => void>() 
const subscribe = (l: () => void) => {
    themeChangedSubscribers.add(l)
    return () => {themeChangedSubscribers.delete(l)}
}

const setTheme = (theme: Theme) => {
    root.setAttribute("data-theme", theme)
    currentThemeHookReturn = {
        theme: theme,
        setTheme: setTheme
    }
    themeChangedSubscribers.forEach(l => l())
}

let currentThemeHookReturn = {
    theme: initialDataTheme as Theme,
    setTheme: setTheme
}


export const useTheme = () => {
    const [, forceUpdate] = useReducer(x => !x, false)
    useEffect(() => {
        const unsubscribe = subscribe(forceUpdate)
        return unsubscribe
    }, [])
    return currentThemeHookReturn
}