import styles from "./_Panel.module.css"

export type PanelProps = {
    variant: "1" | "2" | "3" | "4" | "5"
}

export default function Panel({variant, className, ...rest}: PanelProps & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div data-variant={variant} className={`${styles.Panel} ${className ?? ""}`} {...rest}/>
    )
}






