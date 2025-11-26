import { Button, HStack, Textarea, VStack, type StackProps } from "@chakra-ui/react"
import type { FormEvent } from "react"

interface MessageInputProps {
    onSubmit: (message: string) => void
}

export default function MessageInput({onSubmit, ...rest}: MessageInputProps & StackProps) {
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        const form = e.currentTarget as HTMLFormElement
        const data = new FormData(form)
        const message = data.get("message")?.toString()
        if (message) onSubmit(message)
    }

    return (
        <VStack bg="currentBg" alignItems="stretch" {...rest}>
            <form onSubmit={handleSubmit}>
                <HStack alignItems="end">
                    <Textarea name="message" placeholder="Type something..." autoresize={true}/>
                    <Button type="submit" variant="primary">Send</Button>
                </HStack>

            </form>
        </VStack>
    )

}