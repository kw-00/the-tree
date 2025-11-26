import type { MessageData } from "@/types/data-types";
import { VStack, type StackProps } from "@chakra-ui/react";
import Message from "./Message";




interface ConversationProps {
    messages: Omit<MessageData, "senderId">[]
}

export default function Conversation({messages, ...rest}: ConversationProps & StackProps) {
    for (let i = 0; i < 6; i++) {
        messages = messages.concat(messages)
    }



    return (
        <VStack alignItems="stretch" {...rest}>
            {messages !== null ? 
            messages.map(({senderLogin, content}, n) => 
                <Message senderLogin={senderLogin} content={content} alignItems="stretch" p="2"/>
            )
            : <></>}
        </VStack>
    )

}