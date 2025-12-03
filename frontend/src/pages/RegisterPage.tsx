import { registerAndLogIn } from "@/services/server/server-service"
import CredentiaPage from "../components/auth/CredentialPage"


export default function LoginPage() {
    return (
        <CredentiaPage submitHandler={registerAndLogIn} submitButtonText="Register" alternativePath="/login" alternativeText="Log in instead"/>
    )
}