import { useRef } from "react"
import { getScrollState, type ScrollState } from "@/utils/element"
import { useMessageStoreWithChunkifiers } from "@/api/domains/messages/message-store-tools"
import { type MessageData } from "@/api/domains/messages/messages-service"





const chatroomId = 1
const messageBatchSize = 50




export default function Messages() {
    const {messageStore, messageStoreChunkifiers} = useMessageStoreWithChunkifiers()
    const chunkifier = messageStoreChunkifiers.getCursor(chatroomId)

    const scrollableRef = useRef<HTMLDivElement | null>(null)
    const scrollable = scrollableRef.current

    

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
        if (!chunkifier) return

        const topMessage = chunkifier.getChunkUnderCursor()?.[0]?.[0] ?? null

        if (direction === "previous") {
            if (!chunkifier.firstChunkReached()) {
                chunkifier.move(-1)
                resetScrollbar()
    
            } else {
                const currentChunkMessageCount = () => chunkifier.getChunkUnderCursor()?.reduce((prev, next) => prev + next.length, 0) ?? 0
                const oldChunkSize = currentChunkMessageCount()
                
                await messageStore.fetchPreviousMessages(chatroomId, messageBatchSize)
                const newChunkSize = currentChunkMessageCount()
                const chunkGrew = newChunkSize - oldChunkSize > 0
                
                if (chunkGrew) {
                    resetScrollbar()
                } else if (!chunkifier.firstChunkReached()) {
                    chunkifier.move(-1)
                    resetScrollbar()
                }
            }
            prevTopMessageRef.current = topMessage

        } else if (direction === "next") {
            if (!chunkifier.lastChunkReached()) {
                chunkifier.move()
                resetScrollbar()
            }
        }
    }



    
    const prevScrollStateRef = useRef<ScrollState | null>(null)
    const prevScrollState = prevScrollStateRef.current

    const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        e.preventDefault()
        
        if (!scrollable) return
        if (!prevScrollState) return

        const currentScrollState = getScrollState(scrollable)
        const movedToTop = currentScrollState.isTop && !prevScrollState.isTop
        const movedToBottom = currentScrollState.isBottom && !prevScrollState.isBottom

        if (movedToTop) {
            loadMessageChunk("previous")
        } else if (movedToBottom) {
            loadMessageChunk("next")
        }

        prevScrollStateRef.current = currentScrollState
    }

    const messages = chunkifier?.getChunkUnderCursor()?.reduce((val, c) => [...val, ...c])

    return (
        <div className="v-stack grow basis-5/6">
            <div className="v-stack overflow-y-auto surface-sunken grow contain-size" onScroll={handleScroll} ref={scrollableRef}>
                {messages?.map((message, key) => <div key={key} data-message-id={message.id} className="surface-item">{message.content}</div>) ?? "Chunkifier not initialized"}
            </div>
        </div>
    )
}