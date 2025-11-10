import { authenticateUser } from "@/services/services"
import CredentialForm from "./components/CredentialForm"


export default function LoginPage() {

    const handleSubmit = async (login: string, password: string) => {
        const apiCallResult = await authenticateUser(login, password)
    
        console.log(apiCallResult.status)
        console.log(apiCallResult.body)
    }

    return (
        <>
            <div>
                <CredentialForm callback={handleSubmit} submitButtonText="Log in"/>
            </div>
        </>
    )
}