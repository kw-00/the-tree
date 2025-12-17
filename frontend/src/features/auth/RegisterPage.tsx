import { registerUser } from "@/backend-integration/domains/users/users-queries"
import CredentiaPage from "@/features/auth/CredentialPage"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"


export default function LoginPage() {

    const navigate = useNavigate()
    const {mutateAsync} = useMutation({
        ...registerUser,
        onSuccess: () => navigate("/dashboard"),
        onError: (error) => alert(error)
    })

    const handleSubmit = async (params: {login: string, password: string}) => {
        await mutateAsync(params)
    }


    return (
        <CredentiaPage handleSubmit={handleSubmit} submitButtonText="Register" alternativePath="/login" alternativeText="Log in instead"/>
    )
}