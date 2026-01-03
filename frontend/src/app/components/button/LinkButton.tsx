import styles from "./_Button.module.css"

import { Link, type LinkProps } from "react-router-dom"



export type ButtonProps = {
    variant: "primary" | "secondary" | "ghost" | "boundless" | "danger" | "warning"
}

export default function LinkButton({variant, className, ...rest}: ButtonProps & LinkProps) {
    return (
        <Link data-variant={variant} className={`${styles.Button} ${className ?? ""}`} {...rest}/>
    )
}