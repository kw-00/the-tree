import { logOutUser } from "@/services/services"
import { useNavigate } from "react-router-dom"

export default function LogoutButton() {

    const navigate = useNavigate()

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const apiCallResult = await logOutUser()
        if (apiCallResult.status === 200) {
            navigate("/")
        }
    }

    return (
        <button onClick={handleClick}>
            Log out
        </button>
    )
}