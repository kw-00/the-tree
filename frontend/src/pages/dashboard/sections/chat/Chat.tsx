import { createMessage } from "@/services/services"
import { useChatContext } from "../../../../contexts/ChatContext"
import MessageInput from "./components/MessageInput"
import { Heading, VStack, Wrap, type StackProps } from "@chakra-ui/react"
import Conversation from "./components/Conversation"


export default function Chat(props: StackProps) {
    const {currentRecipient, conversation} = useChatContext()

    return (
        <VStack alignItems="stretch" {...props}>
            <Heading size="xl" pb="2">{currentRecipient !== null ? currentRecipient.login : "Select chat or start a new one"}</Heading>
            <Conversation messages={conversation ? conversation : []} alignItems="stretch"/>

            <MessageInput onSubmit={currentRecipient !== null ? async (message) => await createMessage(currentRecipient.id, message as any) : () => {}}
                position="sticky" bottom={0}/>
        </VStack>
    )
}