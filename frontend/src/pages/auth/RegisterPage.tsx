import { useNavigate } from "react-router-dom"
import CredentialForm from "./components/CredentialForm"
import { registerAndLogIn } from "@/services/services"
import NavigationButton from "@/components/NavigationButton"

export default function RegisterPage() {
    const navigate = useNavigate()

    const handleSubmit = async (login: string, password: string) => {
        const apiCallResult = await registerAndLogIn(login, password)

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
            <div>
                <NavigationButton path="/login" title="Log in instead"/>
            </div>
        </>
    )
}
