import CredentiaPage from "../components/auth/CredentialPage"
import { registerAndLoginOptions } from "@/services/tanstack-service"


export default function LoginPage() {
    return (
        <CredentiaPage mutationOptions={registerAndLoginOptions} submitButtonText="Register" alternativePath="/login" alternativeText="Log in instead"/>
    )
}