import styles from "./_Button.module.css"


export type ButtonProps = {
    variant: "primary" | "secondary" | "ghost" | "danger" | "warning"
}

export default function AnchorButton({variant, className, ...rest}: ButtonProps & React.HTMLAttributes<HTMLAnchorElement>) {
    return (
        <a data-variant={variant} className={`${styles.Button} ${className ?? ""}`} {...rest}/>
    )
}
