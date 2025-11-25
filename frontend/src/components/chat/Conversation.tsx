import { Box, Container, IconButton, ScrollArea, VStack, type ContainerProps, type StackProps } from "@chakra-ui/react";
import { LuArrowDown } from "react-icons/lu";
import { useStickToBottom } from "use-stick-to-bottom";
import Message from "./Message";
import type { MessageData } from "@/types/data-types";
import { useEffect, useId, useState } from "react";




interface ConversationProps {
    messages: Omit<MessageData, "senderId">[]
}

export default function Conversation({messages, ...rest}: ConversationProps & StackProps) {
    for (let i = 0; i < 6; i++) {
        messages = messages.concat(messages)
    }



    return (
        <VStack {...rest}>
            {messages !== null ? 
            messages.map(({senderLogin, content}, n) => 
                <Message senderLogin={senderLogin} content={content} alignItems="stretch" p="2"/>
            )
            : <></>}
        </VStack>
    )

}