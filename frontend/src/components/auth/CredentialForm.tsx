import { PasswordInput } from "@/components/ui/password-input"
import type { authenticateUser } from "@/services/tanstack-service"
import { Button, Field, Fieldset, Heading, Input, type FieldsetRootProps } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

interface CredentialFormProps {
    mutationFactory: typeof authenticateUser
    submitButtonText: string
}

export default function CredentialForm({mutationFactory, submitButtonText, ...rest}: CredentialFormProps & FieldsetRootProps) {

    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")
    
    const {isError, isSuccess, status, mutateAsync} = useMutation(mutationFactory())

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        await mutateAsync({login, password})
    }

    
    const navigate = useNavigate()
    useEffect(() => {
        if (isSuccess) {
            navigate("/dashboard")
        }
    }, [status])

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