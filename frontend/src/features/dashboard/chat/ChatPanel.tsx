import { Heading, type BoxProps } from "@chakra-ui/react"
import MessageInput from "./MessageInput"
import { useChatContext } from "@/features/dashboard/ChatContext"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getConnectedChatrooms, getConversation, createMessage, keyFactory } from "@/services/tanstack-service"
import Panel from "@/components/panel/Panel"
import PanelElement from "@/components/panel/PanelElement"
import Message from "./Message"




export default function ChatPanel(props: BoxProps) {
    const {selectedChatroomId: chatroomId} = useChatContext()

    const queryClient = useQueryClient()

    // Get last update dates for queries with old date as default if undefined
    const chatroomLastUpdate= new Date(queryClient.getQueryState(keyFactory(getConnectedChatrooms))?.dataUpdatedAt ?? 0)
    const conversationLastUpdate = new Date(queryClient.getQueryState(keyFactory(getConnectedChatrooms))?.dataUpdatedAt ?? 0) 

    // Make queries
    const chatroomsQuery = useQuery(getConnectedChatrooms({}, {after: chatroomLastUpdate}))

    const conversationQuery = useQuery(getConversation({
        chatroomId: chatroomId!}, 
        {chatroomId: chatroomId!, after: conversationLastUpdate, nRows: 1000, descending: false},
        {enabled: !!chatroomId}
    ))

    // Muation for creating a message
    const messageMutation = useMutation(createMessage())

    return (
        <Panel variant="primary" layout="vstack" {...props}>
            <PanelElement variant="header">
                <Heading size="xl" pb="2">
                    {chatroomsQuery.isSuccess 
                    ?  chatroomsQuery.data.connectedChatrooms?.find(({id}) => id == chatroomId)?.name ?? "Loading..."
                    : "Select chat or start a new one"}
                </Heading>
            </PanelElement>
            <PanelElement>
                {
                    conversationQuery.isSuccess ?
                    conversationQuery.data.conversation!.map(({userId, userLogin, content}) => 
                        <Message userId={userId} userLogin={userLogin} content={content} alignItems="stretch" p="2"/>)
                    :
                    <></>
                }
            </PanelElement>

            <MessageInput handleSubmit={chatroomId !== null 
                ? async (message) => await messageMutation.mutateAsync({chatroomId: chatroomId, content: message}) 
                : () => {}}
                position="sticky" bottom={0} />
        </Panel>
    )
}