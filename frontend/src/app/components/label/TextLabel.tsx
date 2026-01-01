import styles from "./_Label.module.css"


export default function TextLabel({className, ...rest}: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={`${styles.Label} ${className ?? ""}`} {...rest}/>
}