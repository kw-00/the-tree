import CredentialForm from "./CredentialForm"
import { Heading, VStack } from "@chakra-ui/react"
import NavigationButton from "@/components/NavigationButton"


interface CredentiaPageProps {
    handleSubmit: (params: {login: string, password: string}) => void
    submitButtonText: string
    alternativePath: string
    alternativeText: string
}

export default function CredentiaPage({handleSubmit, submitButtonText, alternativePath, alternativeText}: CredentiaPageProps) {
    return (
        <VStack flexGrow={1} justifyContent="space-between">
            <Heading size="5xl" m="3">Welcome</Heading>
            <VStack>
                <CredentialForm handleSubmit={handleSubmit} submitButtonText={submitButtonText} w="md" boxProps={{w: "lg"}}/>
                <NavigationButton path={alternativePath} variant="secondary">{alternativeText}</NavigationButton>
            </VStack>
            <div></div>

        </VStack>
    )
}