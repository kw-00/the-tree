import { useNavigate } from "react-router-dom"
import CredentialForm from "./components/CredentialForm"
import { registerUser } from "@/services/services"

export default function RegisterPage() {
    const navigate = useNavigate()

    const handleSubmit = async (login: string, password: string) => {
        const apiCallResult = await registerUser(login, password)

        const {status} = apiCallResult
        if (status === 200) {
            navigate("/dashboard")
        }
    }

    return (
        <>
            <div>
                <CredentialForm callback={handleSubmit} submitButtonText="Register user"/>
            </div>
        </>
    )
}
