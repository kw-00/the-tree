import styles from "./_Button.module.css"


export type ButtonProps = {
    variant: "primary" | "secondary" | "ghost" | "danger" | "warning"
}

export default function Button({variant, className, ...rest}: ButtonProps & React.HTMLAttributes<HTMLButtonElement>) {
    return (
        <button data-variant={variant} className={`${styles.Button} ${className ?? ""}`} {...rest}/>
    )
}




