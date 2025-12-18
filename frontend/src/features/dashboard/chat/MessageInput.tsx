
import { Button, HStack, Textarea, VStack, type StackProps } from "@chakra-ui/react"
import React, { useState, type FormEvent } from "react"

type MessageInputProps = {
    handleSubmit: (content: string) => void 
} & StackProps

export default function MessageInput(props: MessageInputProps) {
    const [content, setContent] = useState("")

    const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!e.shiftKey && e.code === "Enter") {
            e.currentTarget.form?.requestSubmit()
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        props.handleSubmit(content)
        setContent("")
    }

    return (
        <VStack bg="currentBg" alignItems="stretch" {...props}>
            <form onSubmit={handleSubmit}>
                <HStack alignItems="end">
                    <Textarea 
                        onKeyUp={handleKeyUp}
                        name="message" 
                        value={content}
                        placeholder="Type something..." 
                        autoresize={true} 
                        onChange={e => setContent(e.target.value)}/>
                    <Button type="submit" variant="primary">Send</Button>
                </HStack>

            </form>
        </VStack>
    )

}