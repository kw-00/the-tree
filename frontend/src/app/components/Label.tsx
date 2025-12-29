import { twMerge } from "tailwind-merge"
import { Label as RadixLabel } from "radix-ui"


const styling = {
    base: "label-text",
}

export type LabelProps = React.HTMLAttributes<HTMLLabelElement>

export default function Label({className, ...rest}: LabelProps) {
    const classes = twMerge(styling.base, className)
    return (
        <RadixLabel.Root className={classes} {...rest}/>
    )
}