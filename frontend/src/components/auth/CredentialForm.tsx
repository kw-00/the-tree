import { PasswordInput } from "@/components/ui/password-input"
import type { authenticateUserOptions } from "@/services/tanstack-service"
import { Button, Field, Fieldset, Heading, Input, type FieldsetRootProps } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import type { FormEvent } from "react"
import { useState } from "react"

interface CredentialFormProps {
    mutationOptions: typeof authenticateUserOptions
    submitButtonText: string
}

export default function CredentialForm({mutationOptions, submitButtonText, ...rest}: CredentialFormProps & FieldsetRootProps) {

    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")
    
    const {isError, mutateAsync} = useMutation(mutationOptions())

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        await mutateAsync({login, password})
    }

    return (
        <form onSubmit={handleSubmit}>
            <Fieldset.Root {...rest} invalid={isError}>
                <Fieldset.Legend><Heading size="sm">Enter your credentials</Heading></Fieldset.Legend>
                <Fieldset.Content>
                    <Field.Root>
                        <Field.Label>Login</Field.Label>
                        <Input name="login" value={login} onChange={e => setLogin(e.target.value)}/>
                    </Field.Root>
                    <Field.Root>
                        <Field.Label>Password</Field.Label>
                        <PasswordInput name="password" value={password} onChange={e => {setPassword(e.target.value)}}/>
                    </Field.Root>
                </Fieldset.Content>
                <Button type="submit">{submitButtonText}</Button>
            </Fieldset.Root>
        </form>
    )


}