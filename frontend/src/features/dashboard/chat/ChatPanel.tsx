import { Heading, type BoxProps } from "@chakra-ui/react"
import MessageInput from "./MessageInput"
import { useChatContext } from "@/features/dashboard/ChatContext"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Panel from "@/components/panel/Panel"
import PanelElement from "@/components/panel/PanelElement"
import Message from "./Message"
import { getConnectedChatrooms } from "@/backend-integration/queries/chatrooms-queries"
import { createMessage, getMessages } from "@/backend-integration/queries/messages-queries"
import { useEffect, useState } from "react"
import type { MessageData } from "@/backend-integration/backend-service/messages-service"




export default function ChatPanel(props: BoxProps) {
    const {selectedChatroomId: chatroomId} = useChatContext()
    const [isAtBottom, setIsAtBottom] = useState(false)

    // Make queries
    const queryClient = useQueryClient()
    const chatroomsQuery = useInfiniteQuery(getConnectedChatrooms)
    const messageQuery = useInfiniteQuery(getMessages(chatroomId))
    const sendMessageMutation = useMutation({
        ...createMessage,
        onSuccess: (response) => {
            if (isAtBottom) {
                queryClient.setQueryData(["chatrooms", chatroomId, "messages"],
                    (oldData: {pages: MessageData[][], pageParams: {date: Date, direction: "before" | "after"}[]}) => {
                        if (oldData.pages.length === 0) return oldData
                        const newPages = oldData.pages
                        newPages[0].push(response.messageData!)
                        const newPageParams = oldData.pageParams
                        newPageParams[0] = {date: response.messageData?.createdAt!, direction: "before"}
                        return {
                            pages: newPages,
                            pageParams: newPageParams
                        }
                    }
                )
            }
        }
    })

    useEffect(() => {
        if (messageQuery.isError) alert(messageQuery.error)
    }, [messageQuery.status, messageQuery.fetchStatus])

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget
        const isTop = el.scrollTop <= 100
        const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 100
        if (isTop) messageQuery.fetchPreviousPage()
        if (isBottom) messageQuery.fetchNextPage()

        setIsAtBottom(isBottom)
    }

    return (
        <Panel variant="primary" layout="vstack" {...props} overflowY="scroll" onScroll={handleScroll}>
            <PanelElement variant="header">
                <Heading size="xl" pb="2">
                    {chatroomsQuery.isSuccess 
                    ?  chatroomsQuery.data.pages.flat().find(({id}) => id == chatroomId)?.name ?? "Loading..."
                    : "Select chat or start a new one"}
                </Heading>
            </PanelElement>
            <PanelElement flexGrow={1}>
                {
                    messageQuery.isSuccess ?
                    messageQuery.data.pages.flatMap(p => p.messages).map(({userId, userLogin, content}) => 
                        <Message userId={userId} userLogin={userLogin} content={content} alignItems="stretch" p="2"/>)
                    :
                    <></>
                }
            </PanelElement>
            {
                chatroomId !== null ?
                <MessageInput position="sticky" bottom={0} handleSubmit={async (content) => {
                    await sendMessageMutation.mutateAsync({chatroomId: chatroomId, content: content})
                }}/>
                :
                <></>
            }
        </Panel>
    )
}