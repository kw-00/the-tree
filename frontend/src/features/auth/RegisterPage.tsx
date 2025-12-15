import { registerUser } from "@/backend-integration/queries/users-queries"
import CredentiaPage from "@/features/auth/CredentialPage"
import { useMutation } from "@tanstack/react-query"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"


export default function LoginPage() {

    const {isError, error, isSuccess, mutateAsync} = useMutation(registerUser)

    const handleSubmit = async (params: {login: string, password: string}) => {
        await mutateAsync(params)
    }

    const navigate = useNavigate()

    useEffect(() => {
        if (isError) {
            alert(error)
        }
        if (isSuccess) {
            navigate("/dashboard")
        }
    }, [isSuccess])

    return (
        <CredentiaPage handleSubmit={handleSubmit} submitButtonText="Register" alternativePath="/login" alternativeText="Log in instead"/>
    )
}