import "./TextLabel.css"


export default function TextLabel({className, ...rest}: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={`TextLabel ${className}`} {...rest}/>
}