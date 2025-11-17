import { createMessage } from "@/services/services"
import { useChatContext } from "../../contexts/ChatContext"
import Message from "./components/Message"
import MessageInput from "./components/MessageInput"


export default function Chat() {
    const {currentRecipientId, conversation, getLogin} = useChatContext()

    return (
        <>
            <div>
                <b>{getLogin(currentRecipientId)}</b>
            </div>
            <div>
                {conversation.map(({senderId, content}, n) => 
                        <Message key={n} senderId={senderId} content={content}/>
                    )
                }
            </div>
            <div>
                <MessageInput onSubmit={((message) => createMessage(currentRecipientId, message))}/>
            </div>
        </>
    )
}