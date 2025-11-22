import { authenticateUser, registerAndLogIn } from "@/services/services"
import CredentiaPage from "./CredentialPage"


export default function LoginPage() {
    return (
        <CredentiaPage submitHandler={registerAndLogIn} submitButtonText="Register" alternativePath="/login" alternativeText="Log in instead"/>
    )
}