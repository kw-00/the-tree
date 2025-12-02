import { logOut } from "@/services/services"
import { Button, type ButtonProps } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

export default function LogoutButton(props: ButtonProps) {

    const navigate = useNavigate()

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const apiCallResult = await logOut()
        if (apiCallResult.status === 200) {
            navigate("/")
        }
    }

    return (
        <Button onClick={handleClick} {...props}>
            Log out
        </Button>
    )
}