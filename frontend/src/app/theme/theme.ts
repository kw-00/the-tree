import { useEffect, useReducer } from "react"

const baseStyleElement = document.createElement("link")
baseStyleElement.setAttribute("href", new URL("./base.css", import.meta.url).href)
baseStyleElement.setAttribute("rel", "stylesheet")
document.head.appendChild(baseStyleElement)

const themes = ["dark", "light"] as const
export type Theme = typeof themes[number]

const themeChangedSubscribers = new Set<() => void>() 
const subscribe = (l: () => void) => {
    themeChangedSubscribers.add(l)
    return () => {themeChangedSubscribers.delete(l)}
}

let currentTheme: Theme = "dark"
const setTheme = (theme: Theme) => {
    replaceThemeLink(theme)
    currentTheme = theme
    themeChangedSubscribers.forEach(l => l())
}

setTheme(currentTheme)


export const useTheme = () => {
    const [, forceUpdate] = useReducer(x => !x, false)
    useEffect(() => {
        const unsubscribe = subscribe(forceUpdate)
        return unsubscribe
    }, [])
    return {
        theme: currentTheme,
        setTheme
    }
}


function replaceThemeLink(theme: Theme) {
    document.getElementById("theme-link")?.remove()

    const href = new URL(`./themes/${theme}.css`, import.meta.url).href
    const themeLink = document.createElement("link")
    themeLink.setAttribute("id", "theme-link")
    themeLink.setAttribute("href", href)
    themeLink.setAttribute("rel", "stylesheet")
    console.log("Done")
    document.head.appendChild(themeLink)
}