import CredentiaPage from "@/features/auth/CredentialPage"
import { logIn } from "@/backend-integration/queries/auth-queries"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"


export default function LoginPage() {
    const navigate = useNavigate()

    const {mutateAsync} = useMutation({
        ...logIn,
        onError: (error) => alert(error),
        onSuccess: () => navigate("/dashboard")
    })

    const handleSubmit = async (params: {login: string, password: string}) => {
        await mutateAsync(params)
    }


    return (
        <CredentiaPage handleSubmit={handleSubmit} submitButtonText="Log in" alternativePath="/register" alternativeText="Register instead"/>
    )
}