import { useNavigate } from "react-router-dom"


interface NavigationButtonProps {
    path: string
    className?: string
    children?: React.ReactNode
}

export default function NavigationButton({path, className, children}: NavigationButtonProps) {

    const navigate = useNavigate()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        navigate(path)
    }

    return (
        <button onClick={handleClick} className={className}>{children}</button>
    )
}