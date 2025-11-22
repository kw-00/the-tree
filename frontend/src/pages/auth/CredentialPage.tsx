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
            <div className="bg-1 v-cont jst-sb al-i-c pad-h-4xl pad-v-2xl">
                <div className="v-cont al-s-st">
                    <div className="bw-b-m bs-solid tx-c al-s-st"><h1>Welcome!</h1></div>
                    <div className="fl-bs-xs"></div>
                </div>

                <div className="v-cont jst-sb al-i-st w-xl">
                    <CredentialForm callback={handleSubmit} className="v-cont jst-ct al-i-st" submitButtonText={submitButtonText}/>
                </div>
                <NavigationButton path={alternativePath} className="clickable-contrasting">{alternativeText}</NavigationButton>
            </div>
        </>
    )
}