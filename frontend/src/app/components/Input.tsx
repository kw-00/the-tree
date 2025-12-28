import { twMerge } from "tailwind-merge"
import type { InputHTMLAttributes } from "react"





const styling = {
    base: `
        my-1 appearance-none rounded-xs bg-(--input-bg) 
        border-1 border-(--input-border) 
        has-focus:ring-2 has-focus:ring-(--input-border)
    `
}

export type InputProps = {
} & InputHTMLAttributes<HTMLInputElement>

export default function Input({className, ...rest}: InputProps) {
    const classes = twMerge(styling.base, className)
    return (
        <div className={classes}><input style={{width: "100%", height: "100%", flexGrow: "1", outline: "none"}} {...rest}/></div>
    )
}