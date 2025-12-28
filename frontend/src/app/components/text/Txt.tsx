import type { HTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"





export type TxtProps = {
    i?: boolean
    b?: boolean
    u?: boolean
    h?: boolean
} & HTMLAttributes<HTMLSpanElement>

export default function Txt({i, b, u, h, className, ...rest}: TxtProps) {

    const styling = `
        ${i ? "italic" : ""}
        ${b ? "bold-text" : ""}
        ${u ? "underline" : ""}
        ${h ? "highlighted-text" : ""}
    `

    return (
        <span className={twMerge(styling, className)} {...rest} />
    )
}