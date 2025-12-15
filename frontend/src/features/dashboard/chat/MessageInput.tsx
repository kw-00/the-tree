
import { Button, HStack, Textarea, VStack, type StackProps } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { useState, type FormEvent } from "react"
import { useChatContext } from "../ChatContext"
import { createMessage } from "@/backend-integration/queries/messages-queries"


export default function MessageInput(props: StackProps) {

    const {selectedChatroomId} = useChatContext()

    const [content, setContent] = useState("")

    // Muation for creating a message
    const messageMutation = useMutation(createMessage)

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (selectedChatroomId) {
            messageMutation.mutateAsync({chatroomId: selectedChatroomId, content: content})
            setContent("")
        }
    }

    return (
        <VStack bg="currentBg" alignItems="stretch" {...props}>
            <form onSubmit={handleSubmit}>
                <HStack alignItems="end">
                    <Textarea 
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