import { twMerge } from "tailwind-merge";


export type HeadingProps = {
    variant: "1" | "2" | "3"
} & React.HTMLAttributes<HTMLParagraphElement>

export default function Heading({variant, className, ...rest}: HeadingProps) {
    const labelStyle = `heading-${variant}`
    const classes = twMerge(labelStyle, className)
    return <p className={classes} {...rest}/>
}