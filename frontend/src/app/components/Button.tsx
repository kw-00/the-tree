import { twMerge } from "tailwind-merge"



const styling = {
    base: `
        px-6 py-2 rounded-xs button-text
        hover:brightness-(--hover-brightness) 
        active:brightness-(--active-brightness)
    `,
    variant: {
        primary: "bg-(--button-bg)",
        secondary: "bg-(--button-secondary-bg)",
        ghost: "hover:invert-40 active:invert-50",
        warning: "bg-(--button-warning-bg)",
        danger: "bg-(--button-danger-bg)"
    }
}

export type ButtonProps = {
    variant: keyof typeof styling["variant"]
} & React.HTMLAttributes<HTMLButtonElement>

export default function Button({variant, className, ...rest}: ButtonProps) {
    const classes = twMerge(styling.base, styling.variant[variant], className)


    return (
        <button className={classes} {...rest}/>
    )
}




