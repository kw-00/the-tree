import type { FormEvent } from "react"

interface MessageInputProps {
    onSubmit: (message: string) => void
}

export default function MessageInput({onSubmit}: MessageInputProps) {
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        const form = e.currentTarget as HTMLFormElement
        const data = new FormData(form)
        const message = data.get("message")?.toString()
        if (message) onSubmit(message)
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                <input type="text" name="message" placeholder="Type something..."></input>
            </label>
            <button type="submit">Send</button>
        </form>
    )
}