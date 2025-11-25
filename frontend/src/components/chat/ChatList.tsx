import { useChatContext } from "../../contexts/ChatContext"
import ChatListElement from "./ChatListElement"

export default function ChatList({className}: {className?: string}) {
    const {currentRecipient, setCurrentRecipient, connectedUsers} = useChatContext()
    return (
        <div className={className}>
            {connectedUsers.map((recipient, n) => 
                    <ChatListElement 
                        key={n}
                        recipient={recipient}
                        isSelected={currentRecipient?.id === recipient.id ? true : false} 
                        onClick={() => setCurrentRecipient(recipient)}
                    />
                )
            }
        </div>
    )
}