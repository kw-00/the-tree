import styles from "./_Input.module.css"
import type { InputHTMLAttributes } from "react"




export default function Input({className, ...rest}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input className={`${styles.Input} ${className ?? ""}`} {...rest}/>
    )
}