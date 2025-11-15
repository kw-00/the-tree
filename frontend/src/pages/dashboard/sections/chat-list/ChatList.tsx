import { useChatContext } from "../../contexts/ChatContext"
import ChatListElement from "./components/ChatListElement"

export default function ChatList() {
    const {currentRecipientId, setCurrentRecipientId, connectedUsers} = useChatContext()
    return (
        <div>
            {connectedUsers.map(({id, login}) => 
                    <ChatListElement 
                        recipientId={id}
                        recipientLogin={login}
                        isSelected={currentRecipientId === id ? true : false} 
                        onClick={() => setCurrentRecipientId(id)}
                    />
                )
            }
        </div>
    )
}