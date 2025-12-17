import { Text, type StackProps } from "@chakra-ui/react"
import ChatroomsListElement from "./ChatroomsListElement"
import { useQuery } from "@tanstack/react-query"
import { useChatContext } from "@/features/dashboard/ChatContext"
import Panel from "@/components/panel/Panel"
import { getChatrooms } from "@/backend-integration/domains/chatrooms/chatrooms-queries"

export default function ChatroomsList(props: StackProps) {

    const {setSelectedChatroomId} = useChatContext()

    // Query for fetching chatroom list
    const {isLoading, isError, isSuccess, data, error} = useQuery(getChatrooms)

    return (
        <Panel alignItems="stretch" {...props}>
            {isLoading ? <Text>Loading...</Text>
            :
            isError ? <Text>Error: {error.message}</Text>
            :
            isSuccess ? 
            data.chatroomsData?.map((chatroom) => {
                return <ChatroomsListElement chatroom={chatroom} onClick={() => setSelectedChatroomId(chatroom.id)}/>
            })
            :
            <Text>What the Fudge Is Happening?!</Text>
            }
        </Panel>
    )
}