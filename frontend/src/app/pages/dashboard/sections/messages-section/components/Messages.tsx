import { useEffect, useLayoutEffect, useRef } from "react"
import { useForceUpdate } from "@/app/hooks/ForceUpdate"
import { getScrollState, type ScrollState } from "@/utils/element"
import { useMessageStoreWithChunkifiers } from "@/api/domains/messages/message-store-tools"
import { type MessageData } from "@/api/domains/messages/messages-service"





const chatroomId = 1
const messageBatchSize = 50




export default function Messages() {
    const forceUpdate = useForceUpdate()
    const {messageStore, messageStoreChunkifiers} = useMessageStoreWithChunkifiers()
    const messageWindow = messageStoreChunkifiers.getWindow(chatroomId)

    const scrollableRef = useRef<HTMLDivElement | null>(null)
    const scrollable = scrollableRef.current

    useLayoutEffect(() => {
        messageStore.addChatroomListener(async (chatroomId) => {
            await messageStore.fetchNextMessages(chatroomId, messageBatchSize)
        })
        messageStore.addChatrooms(chatroomId)
    }, [])
    

    const prevTopMessageRef = useRef<MessageData | null>(null)
    const prevTopMessage = prevTopMessageRef.current

    const resetScrollbar = () => {
        if (!scrollable) return
        let heightOnTop = 0
        const messageNodes = scrollable.children
        for (const messageNode of messageNodes) {
            if (Number(messageNode.getAttribute("data-message-id")) === (prevTopMessage?.id ?? -1)) {
                break
            }
            heightOnTop += messageNode.clientHeight
        }
        scrollable.scrollTop += heightOnTop
    }
    
    const loadMessageChunk = async (direction: "next" | "previous") => {
        if (!scrollable) return
        if (!messageWindow) return

        const topMessage = messageWindow.current()[0] ?? null

        if (direction === "previous") {
            if (messageWindow.hasPrevious()) {
                messageWindow.movePrevious()
                resetScrollbar()
    
            } else {
                const newMessagesFetched = await messageStore.fetchPreviousMessages(chatroomId, messageBatchSize)
                if (newMessagesFetched) {
                    messageWindow.movePrevious()
                    resetScrollbar()
                }
            }
            prevTopMessageRef.current = topMessage

        } else if (direction === "next") {
            if (messageWindow.hasNext()) {
                messageWindow.moveNext()
                resetScrollbar()
            }
        }
    }



    
    const prevScrollStateRef = useRef<ScrollState | null>(null)

    const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        e.preventDefault()
        
        if (!scrollable) return

        const currentScrollState = getScrollState(scrollable)
        const prevScrollState = prevScrollStateRef.current

        if (prevScrollState) {
            const movedToTop = currentScrollState.isTop && !prevScrollState.isTop
            console.log("Moved to top: ", movedToTop)
            const movedToBottom = currentScrollState.isBottom && !prevScrollState.isBottom
            console.log("Moved to botton: ", movedToBottom)
            console.log(messageWindow?.current().length)
            console.log(messageWindow?.current().length)

            if (movedToTop) {
                loadMessageChunk("previous")
            } else if (movedToBottom) {
                loadMessageChunk("next")
            }
        }

        prevScrollStateRef.current = currentScrollState
    }

    const messages = messageWindow?.current()
    console.log(messages?.length)

    return (
        <div className="v-stack grow basis-5/6">
            <div className="v-stack overflow-y-auto surface-sunken grow contain-size" onScroll={handleScroll} ref={scrollableRef}>
                {messages?.map((message, key) => <div key={key} data-message-id={message.id} className="surface-item">{message.content}</div>) ?? "Chunkifier not initialized"}
            </div>
        </div>
    )
}