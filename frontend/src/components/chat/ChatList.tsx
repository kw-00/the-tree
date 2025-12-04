import { VStack,Text, type StackProps } from "@chakra-ui/react"
import ChatListElement from "./ChatListElement"
import { useQuery } from "@tanstack/react-query"
import { getConnectedChatroomsOptions } from "@/services/tanstack-service"
import { useEffect, useState } from "react"
import { useChatContext } from "@/contexts/ChatContext"

export default function ChatList(props: StackProps) {
    const {setSelectedChatroomId} = useChatContext()
    const [after, setAfter] = useState<Date | undefined>(undefined)
    const {isLoading, isError, isSuccess, data, error} = useQuery(getConnectedChatroomsOptions({after}))

    useEffect(() => {
        if (isSuccess) {
            setAfter(new Date())
        }
    }, [isSuccess])

    return (
        <VStack alignItems="stretch" {...props}>
            {isLoading ? <Text>Loading...</Text>
            :
            isError ? <Text>Error: {error.message}</Text>
            :
            isSuccess ? 
            data!.connectedChatrooms!.map((chatroom) => {
                return <ChatListElement chatroom={chatroom} onClick={() => setSelectedChatroomId(chatroom.id)}/>
            })
            :
            <Text>What the Fudge Is Happening?!</Text>
            }
        </VStack>
    )
}