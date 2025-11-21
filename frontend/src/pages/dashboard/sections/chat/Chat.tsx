import { createMessage } from "@/services/services"
import { useChatContext } from "../../contexts/ChatContext"
import Message from "./components/Message"
import MessageInput from "./components/MessageInput"


export default function Chat({className}: {className?: string}) {
    const {currentRecipient, conversation} = useChatContext()

    return (
        <div className={className}>
            <div>
                <b>{currentRecipient !== null ? currentRecipient.login : "Select chat or start a new one"}</b>
            </div>
            <div>
                {conversation !== null ? 
                    conversation.map(({senderLogin, content}, n) => 
                        <Message key={n} senderLogin={senderLogin} content={content}/>
                    )
                    : <></>

                }
            </div>
            <MessageInput onSubmit={currentRecipient !== null ? async (message) => await createMessage(currentRecipient.id, message) : () => {}}
                className="width-full"/>
        </div>
    )
}