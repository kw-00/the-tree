import { useRef } from "react"
import { MessageStore } from "./message-store"
import { MessageStoreWindows } from "./message-store-windows"

const globalStore = new MessageStore()

const globalMessageStoreChunkifiers = new MessageStoreWindows(globalStore)

export function useMessageStoreWithChunkifiers() {
    const messageStoreRef = useRef(globalStore)
    const chunkifiersRef = useRef(globalMessageStoreChunkifiers)

    return {
        messageStore: messageStoreRef.current,
        messageStoreChunkifiers: chunkifiersRef.current
    }
}