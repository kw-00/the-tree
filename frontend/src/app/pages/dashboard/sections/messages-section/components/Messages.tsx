import { useMessageStoreWindow } from "@/api/domains/messages/message-store-window"
import { useEffect, useLayoutEffect, useRef } from "react"
import { useForceUpdate } from "@/app/hooks/ForceUpdate"
import { getScrollState, type ScrollState } from "@/utils/element"




const chatroomId = 1



export default function Messages() {
    const forceUpdate = useForceUpdate()

    const {messageStoreWindow} = useMessageStoreWindow(50)
    const scrollableRef = useRef<HTMLDivElement | null>(null)
    const scrollStateBufferRef = useRef<ScrollState | null>(null)

    useEffect(() => {
        const unsub = messageStoreWindow.addEmitListener(() => {
            forceUpdate()
        })
        console.log("Hello")
        messageStoreWindow.moveNext(chatroomId)
        return () => unsub()
    }, [])


    const messages = messageStoreWindow.getMessages(chatroomId)

    const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        e.preventDefault()
        const scrollable = scrollableRef.current
        const prevScrollState = scrollStateBufferRef.current
        if (scrollable) {
            const currentScrollState = getScrollState(scrollable)
            if (prevScrollState) {
                if (currentScrollState.isNearTop && !prevScrollState.isNearTop) {
                    await messageStoreWindow.movePrevious(chatroomId)
                } else if (currentScrollState.isNearBottom && !prevScrollState.isNearBottom) {
                    await messageStoreWindow.moveNext(chatroomId)

                }
            }
            scrollStateBufferRef.current = currentScrollState
        }
    }

    return (
        <div className="v-stack grow basis-5/6">
            <div className="v-stack overflow-y-auto surface-sunken grow contain-size" onScroll={handleScroll} ref={scrollableRef}>
                {messages.map((item, key) => <div key={key} className="surface-item">{item.content}</div>)}
            </div>
        </div>
    )
}