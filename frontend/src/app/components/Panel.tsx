import { useTheme } from "../theme/theme"
import { twMerge } from "tailwind-merge"




const styling = {
    1: "bg-(--bg-1) m-0",
    2: "bg-(--bg-2) m-2",
    3: "bg-(--bg-3) m-3",
    padding: {
        sm: "p-2",
        md: "p-4",
        lg: "p-6"
    }
}


export type PanelProps = {
    variant: "1" | "2" | "3",
    padding?: "sm" | "md" | "lg"
} & React.HTMLAttributes<HTMLDivElement>

export default function Panel({variant, className, padding, ...rest}: PanelProps) {

    const classes = twMerge("", styling[variant], styling.padding[padding ?? "sm"], className)
    return (
        <div className={classes} {...rest}/>
    )
}






