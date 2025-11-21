import { useChatContext } from "../../contexts/ChatContext"
import ChatListElement from "./components/ChatListElement"

export default function ChatList() {
    const {currentRecipient, setCurrentRecipient, connectedUsers} = useChatContext()
    return (
        <div>
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