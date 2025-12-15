import BoxForm, { type BoxFormProps } from "@/components/BoxForm"
import { PasswordInput } from "@/components/ui/password-input"
import { Button, Field, Fieldset, Heading, Input, type FieldsetRootProps } from "@chakra-ui/react"
import { useState, type FormEvent } from "react"


interface CredentialFormProps {
    handleSubmit: (params: {login: string, password: string}) => void
    submitButtonText: string
    boxProps?: BoxFormProps
    fieldsetProps?: FieldsetRootProps
}

export default function CredentialForm({handleSubmit, submitButtonText, boxProps, fieldsetProps}: CredentialFormProps & FieldsetRootProps) {

    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")
    
    const onSubmit = (e: FormEvent) => {
        e.preventDefault()
        handleSubmit({login, password})
    }


    return (
        <BoxForm onSubmit={onSubmit} {...boxProps}>
            <Fieldset.Root {...fieldsetProps}>
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
        </BoxForm>
    )
}