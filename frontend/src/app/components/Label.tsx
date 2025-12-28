import { twMerge } from "tailwind-merge"
import { useTheme } from "../theme/theme"


const styling = {
    base: "label-text",
}

export type LabelProps = React.HTMLAttributes<HTMLLabelElement>

export default function Label({className, ...rest}: LabelProps) {
    const classes = twMerge(styling.base, className)
    return (
        <label className={classes} {...rest}/>
    )
}