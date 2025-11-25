import { useNavigate } from "react-router-dom"
import CredentialForm from "./components/CredentialForm"
import type { APICallResult } from "@/services/services"
import { chakra, Heading, VStack } from "@chakra-ui/react"
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
        <VStack flexGrow={1} justifyContent="space-between">
            <Heading size="5xl" m="3">Welcome</Heading>
            <VStack>
                <CredentialForm callback={handleSubmit} submitButtonText={submitButtonText} w="md"/>
                <NavigationButton path={alternativePath} variant="secondary">{alternativeText}</NavigationButton>
            </VStack>
            <div></div>

        </VStack>
    )
}