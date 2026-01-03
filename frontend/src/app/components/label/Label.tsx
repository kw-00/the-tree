import styles from "./_Label.module.css"

import { Label as RadixLabel } from "radix-ui"

export default function Label(props: React.HTMLAttributes<HTMLLabelElement>) {
    return (
        <RadixLabel.Root {...props}/>
    )
}