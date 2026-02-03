import { useRef } from "react";
import { useMessageStore, type MessageStore } from "./message-store";
import { clamp } from "@/utils/math";




export type ErrorListener = (error: Error) => void

class MessageStoreWindow {
    #messageStore: MessageStore
    #size: number
    #jump: number
    #cursors: Map<number, number> = new Map()
    #emitListeners: Set<() => void> = new Set()
    #errorListeners: Set<ErrorListener> = new Set()


    constructor(messageStore: MessageStore, size: number, jump: number) {
        this.#messageStore = messageStore
        this.#size = size
        this.#jump = jump
    }

    addEmitListener(listener: () => void) {
        this.#emitListeners.add(listener)
        return () => this.removeEmitListener(listener)
    }

    removeEmitListener(listener: () => void) {
        this.#emitListeners.delete(listener)
    }

    #fireEmit() {
        this.#emitListeners.forEach(l => l())
    }

    addErroristener(listener: ErrorListener) {
        this.#errorListeners.add(listener)
        return () => this.removeErrorListener(listener)
    }

    removeErrorListener(listener: ErrorListener) {
        this.#errorListeners.delete(listener)
    }

    #fireError(error: Error) {
        this.#errorListeners.forEach(l => l(error))
    }

    async moveNext(chatroomId: number) {
        let storeEntry = this.#messageStore.getStore().get(chatroomId)
        if (!storeEntry) {
            this.#messageStore.addChatrooms(chatroomId)
            storeEntry = this.#messageStore.getStore().get(chatroomId)!
        }
        const cursor = this.#cursors.get(chatroomId) ?? 0
        const newCursor = cursor + this.#jump

        if (newCursor >= storeEntry.messages.length) {
            await this.#messageStore.fetchNextMessages(chatroomId, newCursor + 1 - storeEntry.messages.length)
        }
        this.#cursors.set(chatroomId, clamp(newCursor, 0, storeEntry.messages.length - this.#size))

        this.#fireEmit()
    }

    async movePrevious(chatroomId: number) {
        let storeEntry = this.#messageStore.getStore().get(chatroomId)
        if (!storeEntry) {
            this.#messageStore.addChatrooms(chatroomId)
            storeEntry = this.#messageStore.getStore().get(chatroomId)!
        }
        const cursor = this.#cursors.get(chatroomId) ?? 0
        const newCursor = cursor - this.#jump

        if (newCursor < 0) {
            await this.#messageStore.fetchPreviousMessages(chatroomId, -newCursor)
        }
        this.#cursors.set(chatroomId, clamp(newCursor, 0, storeEntry.messages.length - this.#size))

        this.#fireEmit()
    }

    getMessages(chatroomId: number) {
        const storeEntry = this.#messageStore.getStore().get(chatroomId)
        if (!storeEntry) {
            this.#fireError(new Error(`MessageStore does not contain chatroom with ID of ${chatroomId}.`))
            return []
        }
        const cursor = this.#cursors.get(chatroomId) ?? 0
        return storeEntry.messages.slice(cursor, cursor + this.#size)
    }
}

export function useMessageStoreWindow(size: number, jump: number) {
    const {messageStore} = useMessageStore()
    const windowRef = useRef(new MessageStoreWindow(messageStore, size, jump))
    return {
        messageStoreWindow: windowRef.current
    }
}