import { type StackProps, VStack, Heading } from "@chakra-ui/react"
import ChatMessages from "./ChatMessages"
import MessageInput from "./MessageInput"
import { useChatContext } from "@/features/dashboard/ChatContext"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getConnectedChatrooms, getConversation, createMessage, keyFactory } from "@/services/tanstack-service"




export default function ChatPanel(props: StackProps) {
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
        <VStack alignItems="stretch" {...props}>
            <Heading size="xl" pb="2">
                {chatroomsQuery.isSuccess 
                ?  chatroomsQuery.data.connectedChatrooms?.find(({id}) => id == chatroomId)?.name ?? "Loading..."
                : "Select chat or start a new one"}
            </Heading>
            <ChatMessages messages={conversationQuery.data?.conversation ?? []} />

            <MessageInput handleSubmit={chatroomId !== null 
                ? async (message) => await messageMutation.mutateAsync({chatroomId: chatroomId, content: message}) 
                : () => {}}
                position="sticky" bottom={0} />
        </VStack>
    )
}