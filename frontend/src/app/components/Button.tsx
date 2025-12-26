import { twMerge } from "tailwind-merge"



const styling = {
    base: "px-6 py-2 rounded-md border-4",
    full: `
        bg-(--button-bg) border-(--button-border) 
        hover:brightness-90
        active:brightness-80
    `,
    outline: `
        bg-(--button-bg-25) border-(--button-bg) 
        hover:bg-(--button-bg-50) 
        active:bg-(--button-bg-75)
    `,
    ghost: `
        bg-(--button-bg) opacity-0
        hover:opacity-20
        active:opacity-30
    `        
}

export type ButtonProps = {
    variant: "full" | "outline" | "ghost"
} & React.HTMLAttributes<HTMLButtonElement>

export default function Button({variant, className, ...rest}: ButtonProps) {
    const classes = twMerge(styling["base"], styling[variant], className)


    return (
        <button className={classes} {...rest}/>
    )
}




