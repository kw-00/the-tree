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
    const messageWindow = messageStoreChunkifiers.getWindow(chatroomId)!

    const scrollableRef = useRef<HTMLDivElement | null>(null)
    const scrollable = scrollableRef.current

    useLayoutEffect(() => {
        messageStore.addChatroomListener(async (chatroomId) => {
            await messageStore.fetchNextMessages(chatroomId, messageBatchSize)
        })
        messageStore.addChatrooms(chatroomId)
    }, [])
    
    const loadMessageChunk = async (direction: "next" | "previous") => {
        if (!scrollable) return
        if (!messageWindow) return

        if (direction === "previous") {
            console.log("Has previous: ", messageWindow.hasPrevious())
            if (messageWindow.hasPrevious()) {
                messageWindow.movePrevious()
                console.log("Moved up")
                console.log("Source: ", messageWindow.source)
                console.log("Cursor: ", messageWindow.cursor)
                forceUpdate()
    
            } else {
                const newMessagesFetched = await messageStore.fetchPreviousMessages(chatroomId, messageBatchSize)
                if (newMessagesFetched) {
                    messageWindow.movePrevious()
                    console.log("Moved up after loading messages")
                    forceUpdate()
                }
            }

        } else if (direction === "next") {
            // TODO - HasNext not working as expected
            if (messageWindow.hasNext()) {
                messageWindow.moveNext()
                console.log("Moved down")
                forceUpdate()
            }
        }

        // Message store window does not have messagestore messages as source
        console.log("IS??? ", Object.is(messageWindow.source, messageStore.getStore().get(chatroomId)?.messages))
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
    console.log("Messages", messageWindow)
    console.log(messageStore.getStore().get(chatroomId))
    console.log(messages?.length)

    return (
        <div className="v-stack grow basis-5/6">
            <div className="v-stack overflow-y-auto surface-sunken grow contain-size" onScroll={handleScroll} ref={scrollableRef}>
                {messages?.map((message, key) => <div key={key} data-message-id={message.id} className="surface-item">{message.content}</div>) ?? "Chunkifier not initialized"}
            </div>
        </div>
    )
}