import "./Label.css"

import { Label as RadixLabel } from "radix-ui"

export type LabelProps = React.HTMLAttributes<HTMLLabelElement>

export default function Label({className, ...rest}: LabelProps) {
    return (
        <RadixLabel.Root className={`Label ${className}`} {...rest}/>
    )
}