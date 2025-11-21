import type { FormEvent } from "react"

interface MessageInputProps {
    onSubmit: (message: string) => void
    className?: string
}

export default function MessageInput({onSubmit, className}: MessageInputProps) {
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        const form = e.currentTarget as HTMLFormElement
        const data = new FormData(form)
        const message = data.get("message")?.toString()
        if (message) onSubmit(message)
    }

    return (
        <div className={className}>
            <form onSubmit={handleSubmit} className="h-container width-full">
                <label className="width-full">
                    <textarea name="message" placeholder="Type something..." className="width-full" />
                </label>
                <div className="height-full width-8"/>
                <button type="submit" className="clickable clickable-border">Send</button>
            </form>
        </div>
    )

}