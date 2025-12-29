import "./Button.css"


export type ButtonProps = {
    variant: "primary" | "secondary" | "ghost" | "danger" | "warning"
} & React.HTMLAttributes<HTMLButtonElement>

export default function Button({className, ...rest}: ButtonProps) {


    return (
        <button className={`Button ${className}`} {...rest}/>
    )
}




