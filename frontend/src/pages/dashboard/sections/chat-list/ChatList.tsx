import { useChatContext } from "../../contexts/ChatContext"
import ChatListElement from "./components/ChatListElement"

interface ChatListProps {
    connectedUserIds: number[]
}

export default function ChatList({connectedUserIds}: ChatListProps) {
    const {currentRecipientId, setCurrentRecipientId} = useChatContext()
    return (
        connectedUserIds.map(id => {
            <ChatListElement 
            recipientId={id} 
            isSelected={currentRecipientId === id ? true : false} 
            onClick={() => setCurrentRecipientId(id)}
            />
        })
    )
}