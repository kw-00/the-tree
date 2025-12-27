import { twMerge } from "tailwind-merge"
import { useTheme } from "../theme/theme"
import type { InputHTMLAttributes } from "react"





const styling = {
    base: "my-1 appearance-none rounded-xs",
    theme: {
        dark: "border-1 border-white/30 has-focus:ring-2 has-focus:ring-white/30",
        light: "border-1 border-black/30 has-focus:ring-2 has-focus:ring-black/30"
    }
}

export type InputProps = {
} & InputHTMLAttributes<HTMLInputElement>

export default function Input({className, ...rest}: InputProps) {
    const {theme} = useTheme()
    const classes = twMerge(styling.base, styling.theme[theme], className)
    return (
        <div className={classes}><input style={{width: "100%", height: "100%", flexGrow: "1", outline: "none"}} {...rest}/></div>
    )
}