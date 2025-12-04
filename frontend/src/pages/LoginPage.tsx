import {authenticateUserOptions} from "@/services/tanstack-service"
import CredentiaPage from "../components/auth/CredentialPage"


export default function LoginPage() {
    return (
        <CredentiaPage mutationOptions={authenticateUserOptions} submitButtonText="Log in" alternativePath="/register" alternativeText="Register instead"/>
    )
}