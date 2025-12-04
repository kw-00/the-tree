import { VStack, type StackProps } from "@chakra-ui/react";
import Message from "./Message";




interface ConversationProps {
    messages: {userLogin: string, content: string }[]
}

export default function Conversation({messages, ...rest}: ConversationProps & StackProps) {

    return (
        <VStack alignItems="stretch" {...rest}>
            {messages !== null ? 
            messages.map(({userLogin, content}) => 
                <Message userLogin={userLogin} content={content} alignItems="stretch" p="2"/>
            )
            : <></>}
        </VStack>
    )

}