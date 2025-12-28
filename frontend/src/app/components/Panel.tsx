import { useTheme } from "../theme/theme"
import { twMerge } from "tailwind-merge"




const styling = {
    base: "border-1 border-(--border)", 
    variant: {
        "1": "bg-(--bg-1) m-0",
        "2": "bg-(--bg-2) m-2",
        "3": "bg-(--bg-3) m-3",
        "4": "bg-(--bg-4) m-2",
        "5": "bg-(--bg-5) m-1",
    },
    padding: {
        sm: "p-2",
        md: "p-4",
        lg: "p-6"
    }
}


export type PanelProps = {
    variant: keyof typeof styling["variant"]
    padding?: "sm" | "md" | "lg"
} & React.HTMLAttributes<HTMLDivElement>

export default function Panel({variant, className, padding, ...rest}: PanelProps) {
    const classes = twMerge(styling.base, styling.variant[variant], styling.padding[padding ?? "sm"], className)
    return (
        <div className={classes} {...rest}/>
    )
}






