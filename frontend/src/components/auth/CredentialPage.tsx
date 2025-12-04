import CredentialForm from "./CredentialForm"
import { Heading, VStack } from "@chakra-ui/react"
import NavigationButton from "@/components/NavigationButton"
import { mutationOptions } from "@tanstack/react-query"
import type { authenticateUserOptions } from "@/services/tanstack-service"


interface CredentiaPageProps {
    mutationOptions: typeof authenticateUserOptions
    submitButtonText: string
    alternativePath: string
    alternativeText: string
}

export default function CredentiaPage({mutationOptions, submitButtonText, alternativePath, alternativeText}: CredentiaPageProps) {


    return (
        <VStack flexGrow={1} justifyContent="space-between">
            <Heading size="5xl" m="3">Welcome</Heading>
            <VStack>
                <CredentialForm mutationOptions={mutationOptions} submitButtonText={submitButtonText} w="md"/>
                <NavigationButton path={alternativePath} variant="secondary">{alternativeText}</NavigationButton>
            </VStack>
            <div></div>

        </VStack>
    )
}