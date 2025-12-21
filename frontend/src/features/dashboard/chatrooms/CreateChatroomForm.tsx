import { createChatroom } from "@/backend-integration/domains/chatrooms/chatrooms-queries";
import BoxForm, { type BoxFormProps } from "@/components/BoxForm";
import { Button, Field, Fieldset, Input } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";





export type CreateChatroomFormProps = {
    handleSubmit: (name: string) => void
} & BoxFormProps

export default function CreateChatroomForm({handleSubmit, onSubmit, ...rest}: CreateChatroomFormProps) {
    const [name, setName] = useState("")

    const handleSubmitWrapper = async (e: FormEvent) => {
        e.preventDefault()
        handleSubmit(name)
    }
    return (
        <BoxForm {...rest} onSubmit={handleSubmitWrapper}>
            <Fieldset.Root>
                <Fieldset.Legend>
                    Create new chatroom
                </Fieldset.Legend>
                <Fieldset.HelperText>
                    Type in a name and create a new chatroom.
                </Fieldset.HelperText>
                <Fieldset.Content>
                    <Field.Root>
                        <Field.Label>Name</Field.Label>
                        <Input name="Name" value={name} onChange={e => setName(e.target.value)}/>
                    </Field.Root>
                </Fieldset.Content>
            </Fieldset.Root>
            <Button type="submit" variant="primary">Create chatroom</Button>
        </BoxForm>
    )
}