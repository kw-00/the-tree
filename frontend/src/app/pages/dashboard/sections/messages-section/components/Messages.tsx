import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useForceUpdate } from "@/app/hooks/ForceUpdate"
import { getScrollState, type ScrollState } from "@/utils/element"
import { useMessageStoreWithChunkifiers } from "@/api/domains/messages/message-store-tools"





const chatroomId = 1
const messageBatchSize = 50




export default function Messages() {
    const forceUpdate = useForceUpdate()

    const {messageStore, messageStoreChunkifiers} = useMessageStoreWithChunkifiers()
    const scrollableRef = useRef<HTMLDivElement | null>(null)
    const prevScrollStateRef = useRef<ScrollState | null>(null)

    const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        e.preventDefault()

        const scrollable = scrollableRef.current
        if (!scrollable) return
        

        const currentScrollState = getScrollState(scrollable)
        const prevScrollState = prevScrollStateRef.current
        const chunkifier = messageStoreChunkifiers.getChunkifier(chatroomId)

        if (prevScrollState && chunkifier) {
            const movedToTop = currentScrollState.isTop && !prevScrollState.isTop
            const mvoedToBottom = currentScrollState.isBottom && !prevScrollState.isBottom
            const movedNearTop = currentScrollState.isNearTop && !prevScrollState.isNearTop
            const movedNearBottom = currentScrollState.isNearBottom && !prevScrollState.isNearBottom 

            if (isTop) {
                chunkifier.move(-1)
                if (chunkifier.firstChunkReached()) {
                    const lengthBeforeFetch = chunkifier.getChunkUnderCursor()?.length

                    messageStore.fetchPreviousMessages(chatroomId, messageBatchSize)
                    const lengthAfterFetch = chunkifier.getChunkUnderCursor()?.length
                    const chunkHasGrown = 
                        lengthBeforeFetch !== undefined 
                        && lengthAfterFetch !== undefined 
                        && lengthAfterFetch - lengthAfterFetch > 0

                    if (!chunkHasGrown) {
                        const newChunkAppeared = chunkifier.move(-1)
                        if (newChunkAppeared) {

                        }
                    }
                }
            } else if (mvoedToBottom) {
                chunkifier.move()
                if (chunkifier.lastChunkReached()) {
                    const lengthBeforeFetch = chunkifier.getChunkUnderCursor()?.length ?? 0

                    messageStore.fetchNextMessages(chatroomId, messageBatchSize)
                    const lengthAfterFetch = chunkifier.getChunkUnderCursor()?.length ?? 0

                    const chunkHasGrown = 
                        lengthBeforeFetch !== undefined 
                        && lengthAfterFetch !== undefined 
                        && lengthBeforeFetch - lengthAfterFetch > 0

                    const chunkHasShrunk = 
                        lengthBeforeFetch !== undefined 
                        && lengthAfterFetch !== undefined 
                        && lengthBeforeFetch - lengthAfterFetch < 0

                    const newChunkAppeared = chunkHasShrunk
                    const messagesWereFetched = chunkHasGrown || chunkHasShrunk

                    if ()

                }
            }
        }
        prevScrollStateRef.current = currentScrollState
    }

    return (
        <div className="v-stack grow basis-5/6">
            <div className="v-stack overflow-y-auto surface-sunken grow contain-size" onScroll={handleScroll} ref={scrollableRef}>
                {messages.map((item, key) => <div key={key} className="surface-item">{item.content}</div>)}
            </div>
        </div>
    )
}