import { VStack,Text, type StackProps } from "@chakra-ui/react"
import ChatListElement from "./ChatListElement"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getConnectedChatrooms, keyFactory } from "@/services/tanstack-service"
import { useChatContext } from "@/contexts/ChatContext"

export default function ChatList(props: StackProps) {

    const {setSelectedChatroomId} = useChatContext()
    const queryClient = useQueryClient()

    const lastFetchDate = new Date(queryClient.getQueryState(keyFactory(getConnectedChatrooms))?.dataUpdatedAt ?? 0) 
    const {isLoading, isError, isSuccess, data, error} = useQuery(getConnectedChatrooms({}, {after: lastFetchDate}))

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