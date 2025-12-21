import { Heading, type BoxProps } from "@chakra-ui/react"
import MessageInput from "./MessageInput"
import { useChatContext } from "@/features/dashboard/ChatContext"
import { useMutation, useQuery } from "@tanstack/react-query"
import Panel from "@/components/panel/Panel"
import PanelElement from "@/components/panel/PanelElement"
import Message from "./Message"
import { createMessage } from "@/backend-integration/domains/messages/messages-queries"
import { useEffect, useLayoutEffect, useReducer, useRef } from "react"
import { getChatrooms } from "@/backend-integration/domains/chatrooms/chatrooms-queries"
import { useMessageStore } from "@/backend-integration/domains/messages/message-store"



// TODO - simplify, possibly with custom hook
export default function ChatPanel(props: BoxProps) {
    const fetchLimit = 20

    const computedRem = useRef(parseFloat(getComputedStyle(document.documentElement).fontSize))
    const selfRef = useRef<HTMLDivElement>(null)
    
    const [forced, forceUpdate] = useReducer(x => x + 1, 0)
    const oldHeight = useRef<number | null>(null)
    const captureHeight = () => oldHeight.current = selfRef.current?.scrollHeight ?? null
    
    const {selectedChatroomId: chatroomId} = useChatContext()
    const chatIdRef = useRef(chatroomId)
    useEffect(() => {chatIdRef.current = chatroomId}, [chatroomId])

    const messageStore = useMessageStore()
    
    const chatroomsQuery = useQuery(getChatrooms)
    const sendMessageMutation = useMutation({
        ...createMessage,
        onSuccess: (response) => {
            if (chatroomId) {
                messageStore.functions.appendMessages(chatroomId, response.messageData!)
            }
        }
    })

    
    // Fetch messages when scroll is near top or bottom
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget

        const nearTop = el.scrollTop <= 5 * computedRem.current
        if (nearTop && chatroomId) {
            messageStore.functions.fetchPreviousMessages(chatroomId, fetchLimit)
        }
    }
    
    
    // Reset scroll to bottom when switching between chatrooms
    useEffect(() => {
        if (chatIdRef.current) {
            messageStore.functions.fetchNextMessages(chatIdRef.current, fetchLimit)
        }

        if (selfRef.current && chatIdRef.current) {
                selfRef.current.scrollTop = 
                messageStore.data.get(chatIdRef.current)?.scrollPosition 
                ?? selfRef.current.scrollHeight - selfRef.current.clientHeight
        }
    }, [chatroomId])
    
    
    // Set scroll back to bottom after message arrival if we are at bottom
    useEffect(() => {
        messageStore.functions.addErrorListener((error) => {
            if (error instanceof Error) {
                
            } else {
                
            }
        })
        messageStore.functions.subscribe(() => {
            
            
            
            
            if (selfRef.current) {
                captureHeight()
                forceUpdate()
            }
        })
    }, [])

    useEffect(() => {
        
    }, [forced])
    // Keep view in place when new messages arrive and update is forced by query subscriber
    useLayoutEffect(() => {
        
        if (selfRef.current && oldHeight.current) {
            const delta = selfRef.current.scrollHeight - oldHeight.current
            selfRef.current.scrollTop += delta
            oldHeight.current = null
        }
    }, [forced])


    

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
                    chatroomId ?
                    messageStore.data.get(chatroomId)?.messages.map(({userId, userLogin, content}, n) => 
                        <Message key={n} userId={userId} userLogin={userLogin} content={content} alignItems="stretch" p="2"/>)
                    : "What in frick"
                }
            </PanelElement>
            {
                chatroomId !== null ?
                <MessageInput position="sticky" bottom={0} handleSubmit={async (content) => {
                    captureHeight()
                    await sendMessageMutation.mutateAsync({chatroomId: chatroomId, content: content})
                }}/>
                :
                <></>
            }
        </Panel>
    )
}