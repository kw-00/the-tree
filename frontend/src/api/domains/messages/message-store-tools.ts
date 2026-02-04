import { useRef } from "react"
import { MessageStore } from "./message-store"
import { MessageStoreChunkifiers } from "./message-store-chunkifiers"

const globalStore = new MessageStore()

const globalMessageStoreChunkifiers = new MessageStoreChunkifiers(globalStore, 100)

export function useMessageStoreWithChunkifiers() {
    const messageStoreRef = useRef(globalStore)
    const chunkifiersRef = useRef(globalMessageStoreChunkifiers)

    return {
        messageStore: messageStoreRef.current,
        messageStoreChunkifiers: chunkifiersRef.current
    }
}