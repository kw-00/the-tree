import { useEffect, useLayoutEffect, useRef } from "react"
import { useForceUpdate } from "@/app/hooks/ForceUpdate"
import { getScrollState, type ScrollState } from "@/utils/element"
import BTree from "sorted-btree"
import { useMessageFeed } from "@/api/domains/messages/message-feed/message-feed"
import type { MessageData } from "@/api/domains/messages/messages-service"





const chatroomId = 1


function useMessageWindow(scrollableRef: React.RefObject<HTMLDivElement | null>) {
    const forceUpdate = useForceUpdate()
    const scrollable = scrollableRef.current

    const feed = useMessageFeed(chatroomId)

    useEffect(() => {
        feed.fetchPreviousMessages()
    }, [])

    {    
        const prevMessageWindowRef = useRef<MessageData[] | null>(null)
        const prevMessageWindow = prevMessageWindowRef.current
        const messageHeightMapRef = useRef(new BTree<number, number>())
        const messageHeightMap = messageHeightMapRef.current

        function handleWindowJump() {
            console.log("handleWindowJump()")
            console.log("Top: ", feed.getMessagesInWindow()[0]?.id)
            console.log("Bottom: ", feed.getMessagesInWindow()[feed.getMessagesInWindow().length - 1]?.id)
            console.log("Window: ", feed.getMessagesInWindow())
            console.log("Source: ", feed.getAllMessages())
            const currentMessageWindow = feed.getMessagesInWindow()
            updateMessageHeightMap()
            if (prevMessageWindow) {
                resetScrollBar(prevMessageWindow, currentMessageWindow)
            }

            prevMessageWindowRef.current = currentMessageWindow


            function updateMessageHeightMap() {
                if (!scrollable) return

                for (let i = 0; i < scrollable.children.length; i++) {
                    const child = scrollable.children.item(i)
                    if (child && child instanceof HTMLElement) {
                        const messageElement = child
                        const messageId = Number(child.getAttribute("data-message-id"))
                        if (!Number.isNaN(messageId)) {
                            messageHeightMap.set(messageId, messageElement.scrollHeight)
                        }
                    }
                }
            }

            function resetScrollBar(prevMessageWindow: MessageData[], currentMessageWindow: MessageData[]) {
                if (!scrollable) return
                if (prevMessageWindow.length === 0) return
                
                const prevTopMessageId = prevMessageWindow[0].id
                const prevBottomMessageId = prevMessageWindow[prevMessageWindow.length - 1].id
                const currentTopMessageId = currentMessageWindow[0].id
                const currentBottomMessageId = currentMessageWindow[currentMessageWindow.length - 1].id

                const movedUp = currentTopMessageId < prevTopMessageId
                const movedDown = currentBottomMessageId > prevBottomMessageId

                if (movedUp) {
                    let heightDifference = 0
                    for (const [id, messageHeight] of messageHeightMap.entries()) {
                        if (id === currentTopMessageId) break
                        heightDifference += messageHeight
                    } 
                    scrollable.scrollTop += heightDifference

                } else if (movedDown) {
                    let heightDifference = 0
                    for (const [id, messageHeight] of messageHeightMap.entriesReversed()) {
                        if (id === currentBottomMessageId) break
                        heightDifference += messageHeight
                    } 
                    scrollable.scrollTop -= heightDifference
                }
            }
        }

        handleWindowJump()
    }

    const moveUp = async () => {
        const anyMessagesFetched = await feed.fetchPreviousMessages()
        if (anyMessagesFetched) {
            forceUpdate()
        }
    }

    const moveDown = async () => {
        const anyMessagesFetched = await feed.fetchNextMessages()
        if (anyMessagesFetched) {
            forceUpdate()
        }
    }

    return {
        messages: feed.getMessagesInWindow(),
        moveUp,
        moveDown,
    }
}

function useMessagesWithScroll(scrollableRef: React.RefObject<HTMLDivElement | null>) {
    const {messages, moveUp, moveDown} = useMessageWindow(scrollableRef)

    const scrollable = scrollableRef.current
    const prevScrollStateRef = useRef<ScrollState | null>(null)
    
    const updatePrevScrollState = () => {
        if (scrollable) {
            prevScrollStateRef.current = getScrollState(scrollable)
        }
    }
    const handleScroll = async () => {
        if (!scrollable) return
        
        const prevScrollState = prevScrollStateRef.current
        const currentScrollState = getScrollState(scrollable)
        
        if (prevScrollState) {
            console.log("Hellol")
            const movedToTop = currentScrollState.isTop && !prevScrollState.isTop
            const movedToBottom = currentScrollState.isBottom && !prevScrollState.isBottom

            if (movedToTop) {
                console.log("Moved to top")
                await moveUp()
            } else if (movedToBottom) {
                console.log("Moved to bottom")
                await moveDown()
            }
        }
        updatePrevScrollState()
    }

    useEffect(() => {
        if (!scrollable) return
        scrollable.addEventListener("scroll", handleScroll)
        return () => scrollable.removeEventListener("scroll", handleScroll)
    }, [scrollable])

    return {
        messages
    }
}


export default function Messages() {
    const scrollableRef = useRef<HTMLDivElement | null>(null)

    const {messages} = useMessagesWithScroll(scrollableRef)


    return (
        <div className="v-stack grow basis-5/6">
            <div className="v-stack overflow-y-auto surface-sunken grow contain-size" ref={scrollableRef}>
                {messages.map((message, key) => <div key={key} data-message-id={message.id} className="surface-item">{message.content}</div>) ?? "Chunkifier not initialized"}
            </div>
        </div>
    )
}