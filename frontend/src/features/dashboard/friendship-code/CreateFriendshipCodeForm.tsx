
import BoxForm, { type BoxFormProps } from "@/components/BoxForm";
import { Button, Field, Fieldset, Input } from "@chakra-ui/react";
import { useState, type FormEvent } from "react";





export type CreateFriendshipCodeFormProps = {
    handleSubmit: (code: string, expiresAt: Date | null) => void
} & BoxFormProps

export default function CreateFriendshipCodeForm({handleSubmit, onSubmit, ...rest}: CreateFriendshipCodeFormProps) {
    const [code, setCode] = useState("")
    const [expiresAtString, setExpiresAtString] = useState("")

    const handleSubmitWrapper = async (e: FormEvent) => {
        e.preventDefault()
        handleSubmit(code, expiresAtString ? new Date(expiresAtString) : null)
    }
    return (
        <BoxForm {...rest} onSubmit={handleSubmitWrapper}>
            <Fieldset.Root>
                <Fieldset.Legend>
                    Add a friend
                </Fieldset.Legend>
                <Fieldset.HelperText>
                    Enter a user's login and a friendship code they issued to add them as friends.
                </Fieldset.HelperText>
                <Fieldset.Content>
                    <Field.Root>
                        <Field.Label>Code</Field.Label>
                        <Input name="code" required value={code} onChange={e => setCode(e.target.value)}/>
                        <Field.Label>Expires At</Field.Label>
                        <Input name="expiresAt" type="datetime-local" value={expiresAtString} onChange={e => setExpiresAtString(e.target.value)}/>
                    </Field.Root>
                </Fieldset.Content>
            </Fieldset.Root>
            <Button type="submit" variant="primary">Create chatroom</Button>
        </BoxForm>
    )
}