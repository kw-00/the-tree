import "./Input.css"
import type { InputHTMLAttributes } from "react"






export type InputProps = {
} & InputHTMLAttributes<HTMLInputElement>

export default function Input({className, ...rest}: InputProps) {
    return (
        <input className={`Input ${className}`} {...rest}/>
    )
}