import CredentiaPage from "@/features/auth/CredentialPage"
import { logIn } from "@/backend-integration/queries/auth-queries"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"


export default function LoginPage() {
    
    const {isSuccess, mutateAsync} = useMutation(logIn)

    const handleSubmit = async (params: {login: string, password: string}) => {
        await mutateAsync(params)
    }

    const navigate = useNavigate()

    useEffect(() => {
        if (isSuccess) {
            navigate("/dashboard")
        }
    }, [isSuccess])

    return (
        <CredentiaPage handleSubmit={handleSubmit} submitButtonText="Log in" alternativePath="/register" alternativeText="Register instead"/>
    )
}