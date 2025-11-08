import CredentialForm from "../components/CredentialForm"
import { registerUser } from "@/services/services"

export default function LoginPage() {

    const handleSubmit = async (login: string, password: string) => {
        const apiCallResult = await registerUser(login, password)

        const {status} = apiCallResult
        if (status === 200) {
            console.log("success")
        } else if (status === 400) {
            console.log("conflict")
        } else if (status === 500) {
            console.log("bad request")
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
