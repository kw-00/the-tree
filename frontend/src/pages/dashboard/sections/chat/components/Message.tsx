import { ChatProvider, useChatContext } from "@/pages/dashboard/contexts/ChatContext"

interface MessageProps {
    senderId: number
    content: string
}

export default function Message({senderId, content}: MessageProps) {
    const {getLogin} = useChatContext()

    return (
        <p>{getLogin(senderId) + ":\n" + content}</p>
    )
}