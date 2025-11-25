import { Button, type ButtonProps } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"


interface NavigationButtonProps{
    path: string
}

export default function NavigationButton({path, children, ...rest}: NavigationButtonProps & ButtonProps) {

    const navigate = useNavigate()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        navigate(path)
    }

    return (
        <Button onClick={handleClick} {...rest}>{children}</Button>
    )
}