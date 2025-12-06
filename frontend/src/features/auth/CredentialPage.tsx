import CredentialForm from "./CredentialForm"
import { Heading, VStack } from "@chakra-ui/react"
import NavigationButton from "@/components/NavigationButton"
import type { authenticateUser } from "@/services/tanstack-service"


interface CredentiaPageProps {
    mutationFactory: typeof authenticateUser
    submitButtonText: string
    alternativePath: string
    alternativeText: string
}

export default function CredentiaPage({mutationFactory, submitButtonText, alternativePath, alternativeText}: CredentiaPageProps) {
    return (
        <VStack flexGrow={1} justifyContent="space-between">
            <Heading size="5xl" m="3">Welcome</Heading>
            <VStack>
                <CredentialForm mutationFactory={mutationFactory} submitButtonText={submitButtonText} w="md" boxProps={{w: "lg"}}/>
                <NavigationButton path={alternativePath} variant="secondary">{alternativeText}</NavigationButton>
            </VStack>
            <div></div>

        </VStack>
    )
}