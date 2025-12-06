import { Text, type StackProps } from "@chakra-ui/react"
import ChatroomsListElement from "./ChatroomsListElement"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getConnectedChatrooms, keyFactory } from "@/services/tanstack-service"
import { useChatContext } from "@/features/dashboard/ChatContext"
import Panel from "@/components/panel/Panel"

export default function ChatroomsList(props: StackProps) {

    const {setSelectedChatroomId} = useChatContext()
    const queryClient = useQueryClient()


    const lastFetchDate = new Date(queryClient.getQueryState(keyFactory(getConnectedChatrooms))?.dataUpdatedAt ?? 0) 
    // Query for fetching chatroom list
    const {isLoading, isError, isSuccess, data, error} = useQuery(getConnectedChatrooms({}, {after: lastFetchDate}))

    return (
        <Panel alignItems="stretch" {...props}>
            {isLoading ? <Text>Loading...</Text>
            :
            isError ? <Text>Error: {error.message}</Text>
            :
            isSuccess ? 
            data!.connectedChatrooms!.map((chatroom) => {
                return <ChatroomsListElement chatroom={chatroom} onClick={() => setSelectedChatroomId(chatroom.id)}/>
            })
            :
            <Text>What the Fudge Is Happening?!</Text>
            }
        </Panel>
    )
}