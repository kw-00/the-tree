import CredentiaPage from "@/features/auth/CredentialPage"
import { registerAndLogin } from "@/services/tanstack-service"


export default function LoginPage() {
    return (
        <CredentiaPage mutationFactory={registerAndLogin} submitButtonText="Register" alternativePath="/login" alternativeText="Log in instead"/>
    )
}