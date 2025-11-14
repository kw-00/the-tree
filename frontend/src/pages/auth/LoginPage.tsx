import { authenticateUser } from "@/services/services"
import CredentialForm from "./components/CredentialForm"
import { useNavigate } from "react-router-dom"


export default function LoginPage() {

    const navigate = useNavigate()

    const handleSubmit = async (login: string, password: string) => {
        const apiCallResult = await authenticateUser(login, password)

        const {status} = apiCallResult
        if (status === 200) {
            navigate("/dashboard")
        }
    }

    return (
        <>
            <div>
                <CredentialForm callback={handleSubmit} submitButtonText="Log in"/>
            </div>
        </>
    )
}