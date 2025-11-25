import Form from "@/components/Form"
import { PasswordInput } from "@/components/ui/password-input"
import { Button, Field, Fieldset, Heading, Input, type FieldsetRootProps } from "@chakra-ui/react"
import { useState } from "react"
import type { FormEvent } from "react"
import type { FormProps } from "react-router-dom"

type CredentialFormHandler = (login: string, password: string) => void

interface CredentialFormProps {
    callback: CredentialFormHandler
    submitButtonText: string

    className?: string
}

export default function CredentialForm({callback, submitButtonText, ...rest}: CredentialFormProps & FieldsetRootProps) {

    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        callback(login, password)
        console.log("Hello,", login)
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Fieldset.Root {...rest}>
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
        </Form>
    )


}