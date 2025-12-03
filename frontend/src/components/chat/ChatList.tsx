import { VStack, type StackProps } from "@chakra-ui/react"
import { useChatContext } from "../../contexts/ChatContext"
import ChatListElement from "./ChatListElement"

export default function ChatList(props: StackProps) {
    const {selectedChatroom: currentRecipient, setSelectedChatroom: setCurrentRecipient, connectedChatrooms: connectedUsers} = useChatContext()
    return (
        <VStack alignItems="stretch" {...props}>
            {connectedUsers.map((recipient, n) => 
                    <ChatListElement
                        key={n}
                        recipient={recipient}
                        isSelected={currentRecipient?.id === recipient.id ? true : false} 
                        onClick={() => setCurrentRecipient(recipient)}
                    />
                )
            }
        </VStack>
    )
}