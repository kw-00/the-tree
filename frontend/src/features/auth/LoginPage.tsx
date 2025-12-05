import {authenticateUser} from "@/services/tanstack-service"
import CredentiaPage from "@/features/auth/CredentialPage"


export default function LoginPage() {
    return (
        <CredentiaPage mutationFactory={authenticateUser} submitButtonText="Log in" alternativePath="/register" alternativeText="Register instead"/>
    )
}