import { useNavigate } from "react-router-dom"


interface NavigationButtonProps {
    title: string
    path: string
}

export default function NavigationButton({title, path}: NavigationButtonProps) {

    const navigate = useNavigate()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        navigate(path)
    }

    return (
        <button onClick={handleClick}>{title}</button>
    )
}