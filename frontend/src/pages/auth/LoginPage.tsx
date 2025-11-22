import { authenticateUser } from "@/services/services"
import CredentiaPage from "./CredentialPage"


export default function LoginPage() {
    return (
        <CredentiaPage submitHandler={authenticateUser} submitButtonText="Log in" alternativePath="/register" alternativeText="Register instead"/>
    )
}