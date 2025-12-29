import "./Button.css"


export type ButtonProps = {
    variant: "primary" | "secondary" | "ghost" | "danger" | "warning"
} & React.HTMLAttributes<HTMLButtonElement>

export default function Button({variant, className, ...rest}: ButtonProps) {
    return (
        <button data-variant={variant} className={`Button ${className}`} {...rest}/>
    )
}




