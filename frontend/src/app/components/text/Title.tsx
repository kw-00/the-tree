import { twMerge } from "tailwind-merge";




export default function Title({className, ...rest}: React.HTMLAttributes<HTMLParagraphElement>) {
    const classes = twMerge("title", className)
    return <p className={classes} {...rest}/>
}