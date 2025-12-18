import { Heading, type BoxProps } from "@chakra-ui/react"
import MessageInput from "./MessageInput"
import { useChatContext } from "@/features/dashboard/ChatContext"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Panel from "@/components/panel/Panel"
import PanelElement from "@/components/panel/PanelElement"
import Message from "./Message"
import { createMessage, getMessages } from "@/backend-integration/domains/messages/messages-queries"
import { useEffect, useRef, useState } from "react"
import type { MessageData } from "@/backend-integration/domains/messages/messages-service"
import { getChatrooms } from "@/backend-integration/domains/chatrooms/chatrooms-queries"



// TODO - simplify, possibly with custom hook
export default function ChatPanel(props: BoxProps) {
    const selfRef = useRef<HTMLDivElement>(null)

    const {selectedChatroomId: chatroomId} = useChatContext()
    const [isNearBottom, setIsNearBottom] = useState(true)
    const [isAtBottom, setIsAtBottom] = useState(true)

    const [liveMessages, setLiveMessages] = useState<MessageData[]>([])

    // Make queries
    const chatroomsQuery = useQuery(getChatrooms)
    const messageQuery = useInfiniteQuery(getMessages(chatroomId, undefined))
    const sendMessageMutation = useMutation({
        ...createMessage,
        onSuccess: (response) => {
            if (isNearBottom) {
                setLiveMessages(liveMessages.concat(response.messageData!))
            }
        }
    })

    const messageData = [...messageQuery.data?.pages.flatMap(p => p.messagesData!) ?? [], ...liveMessages]

    useEffect(() => {
        if (messageQuery.isError) alert(messageQuery.error)
    }, [messageQuery.status, messageQuery.fetchStatus])

    useEffect(() => {
        if (selfRef.current !== null && isAtBottom) {
            selfRef.current.scrollTop = selfRef.current?.scrollHeight - selfRef.current.clientHeight
        }
    }, [messageQuery.status, chatroomId])

    useEffect(() => {
        if (selfRef.current !== null && !isAtBottom) {
            selfRef.current.scrollTop = selfRef.current?.scrollHeight - selfRef.current.clientHeight
        }
    }, [chatroomId])

    useEffect(() => {
        if (isAtBottom && selfRef.current) {
            selfRef.current.scrollTop = selfRef.current.scrollHeight - selfRef.current.clientHeight
        }
    }, [liveMessages])

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget
        const scrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight

        const nearTop = el.scrollTop <= 100
        const nearBottom = scrollBottom <= 100
        const atBottom = scrollBottom <= 1
        if (nearTop) messageQuery.fetchPreviousPage()
        if (nearBottom) messageQuery.fetchNextPage()
        setIsNearBottom(nearBottom)
        setIsAtBottom(atBottom)
    }

    return (
        <Panel variant="primary" layout="vstack" {...props} overflowY="scroll" onScroll={handleScroll} ref={selfRef}>
            <PanelElement variant="header">
                <Heading size="xl" pb="2">
                    {chatroomsQuery.isSuccess 
                    ?  chatroomsQuery.data.chatroomsData?.find(({id}) => id == chatroomId)?.name ?? "Loading..."
                    : "Select chat or start a new one"}
                </Heading>
            </PanelElement>
            <PanelElement flexGrow={1}>
                {
                    messageData.map(({userId, userLogin, content}) => 
                        <Message userId={userId} userLogin={userLogin} content={content} alignItems="stretch" p="2"/>)
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