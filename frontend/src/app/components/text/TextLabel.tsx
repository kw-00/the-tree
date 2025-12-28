import { twMerge } from "tailwind-merge";


export default function TextLabel({className, ...rest}: React.HTMLAttributes<HTMLParagraphElement>) {
    const classes = twMerge("label-text", className)
    return <p className={classes} {...rest}/>
}