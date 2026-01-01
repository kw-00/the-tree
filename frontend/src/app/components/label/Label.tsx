import styles from "./_Label.module.css"

import { Label as RadixLabel } from "radix-ui"

export default function Label({className, ...rest}: React.HTMLAttributes<HTMLLabelElement>) {
    return (
        <RadixLabel.Root className={`${styles.Label} ${className ?? ""}`} {...rest}/>
    )
}