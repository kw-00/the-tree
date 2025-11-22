import { useNavigate } from "react-router-dom"
import CredentialForm from "./components/CredentialForm"
import type { APICallResult } from "@/services/services"
import NavigationButton from "@/components/NavigationButton"


interface CredentiaPageProps {
    submitHandler: (login: string, password: string) => Promise<APICallResult<any>>
    submitButtonText: string
    alternativePath: string
    alternativeText: string
}

export default function CredentiaPage({submitHandler, submitButtonText, alternativePath, alternativeText}: CredentiaPageProps) {
    const navigate = useNavigate()

    const handleSubmit = async (login: string, password: string) => {
        const apiCallResult = await submitHandler(login, password)

        const {status} = apiCallResult
        if (status === 200) {
            navigate("/dashboard")
        }
    }

    return (
        <>
            <div className="bg-1 v-container align-items-center">
                <div className="bg-1 v-container width-384 padding-32 align-items-center">
                    <div><h1>Welcome!</h1></div>
                    <CredentialForm callback={handleSubmit} className="v-stack justify-content-center flex-grow-1" submitButtonText={submitButtonText}/>
                    <NavigationButton path={alternativePath} className="clickable-contrasting">{alternativeText}</NavigationButton>
                </div>
            </div>
        </>
    )
}