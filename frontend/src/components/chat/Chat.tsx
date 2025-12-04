import { type StackProps, VStack, Heading } from "@chakra-ui/react"
import Conversation from "./Conversation"
import MessageInput from "./MessageInput"
import { useChatContext } from "@/contexts/ChatContext"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createMessageOptions, getConnectedChatroomsOptions, getConversationOptions } from "@/services/tanstack-service"
import { useEffect, useState } from "react"



export default function Chat(props: StackProps) {
    const {selectedChatroomId} = useChatContext()
    const [name, setName] = useState<string | null>(null)
    const [after, setAfter] = useState<Date | undefined>(undefined)

    const getConnectedChatrooms = useQuery({...getConnectedChatroomsOptions({})})
    const getConversation = useQuery({
        ...getConversationOptions({
            chatroomId: selectedChatroomId!,
            after: after,
            nRows: 1000,
            descending: false
        }), enabled: !!selectedChatroomId
    })

    const createMessage = useMutation(createMessageOptions())

    useEffect(() => {
        if (getConnectedChatrooms.status === "pending") {
            setName(null)
        }
        if (getConnectedChatrooms.status === "success") {
            const data = getConnectedChatrooms.data
            const name = data.connectedChatrooms!.find(chat => chat.id = selectedChatroomId ?? -1)?.name
            setName(name ?? null)
            setAfter(new Date())
        }
    }, [getConnectedChatrooms.status])



    return (
        <VStack alignItems="stretch" {...props}>
            <Heading size="xl" pb="2">{selectedChatroomId ?  name : "Select chat or start a new one"}</Heading>
            <Conversation messages={getConversation.data?.conversation ? getConversation.data.conversation : []} />

            <MessageInput handleSubmit={selectedChatroomId !== null ? async (message) => await createMessage.mutateAsync({chatroomId: selectedChatroomId!, content: message}) : () => {}}
                position="sticky" bottom={0} />
        </VStack>
    )
}