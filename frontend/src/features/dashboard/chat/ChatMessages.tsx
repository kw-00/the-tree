import { VStack, type StackProps } from "@chakra-ui/react";
import Message from "./Message";




interface ChatMessagesProps {
    messages: {userId: number, userLogin: string, content: string }[]
}

export default function ChatMessages({messages, ...rest}: ChatMessagesProps & StackProps) {

    return (
        <VStack alignItems="stretch" {...rest}>
            {messages !== null ? 
            messages.map(({userId, userLogin, content}) => 
                <Message userId={userId} userLogin={userLogin} content={content} alignItems="stretch" p="2"/>
            )
            : <></>}
        </VStack>
    )

}