import { twMerge } from "tailwind-merge"
import { useTheme } from "../theme/theme"



const styling = {
    base: "px-6 py-2 rounded-xs font-bold",
    theme: {
        dark: "hover:brightness-110 active:brightness-115",
        light: "hover:brightness-90 active:brightness-80"
    },
    variant: {
        primary: "bg-(--button-bg)",
        secondary: "bg-(--button-secondary-bg)",
        ghost: "hover:invert-40 hover:saturate-200 active:invert-50",
        warning: "bg-(--button-warning-bg)",
        danger: "bg-(--button-danger-bg)"
    }
}

export type ButtonProps = {
    variant: keyof typeof styling["variant"]
} & React.HTMLAttributes<HTMLButtonElement>

export default function Button({variant, className, ...rest}: ButtonProps) {
    const {theme} = useTheme()
    const classes = twMerge(styling.base, styling.theme[theme], styling.variant[variant], className)


    return (
        <button className={classes} {...rest}/>
    )
}




