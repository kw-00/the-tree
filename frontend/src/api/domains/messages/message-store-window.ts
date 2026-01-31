import { useRef } from "react";
import { useMessageStore, type MessageStore, type Room } from "./message-store";




export type ErrorListener = (error: Error) => void

class MessageStoreWindow {
    #messageStore: MessageStore
    #messageStoreSnapshot: ReadonlyMap<number, Readonly<Room>>
    #size: number
    #jump: number
    #cursors: Map<number, number> = new Map()
    #emitListeners: Set<() => void> = new Set()
    #errorListeners: Set<ErrorListener> = new Set()


    constructor(messageStore: MessageStore, size: number, jump: number) {
        this.#messageStore = messageStore
        this.#messageStoreSnapshot = messageStore.getSnapshot()
        this.#size = size
        this.#jump = jump

        this.#messageStore.subscribeGlobal(() => this.#messageStoreSnapshot = messageStore.getSnapshot())
    }

    addEmitListener(listener: () => void) {
        this.#emitListeners.add(listener)
    }

    removeEmitListener(listener: () => void) {
        this.#emitListeners.delete(listener)
    }

    #fireEmit() {
        this.#emitListeners.forEach(l => l())
    }

    addErroristener(listener: ErrorListener) {
        this.#errorListeners.add(listener)
    }

    removeErrorListener(listener: ErrorListener) {
        this.#errorListeners.delete(listener)
    }

    #fireError(error: Error) {
        this.#errorListeners.forEach(l => l(error))
    }

    moveNext(chatroomId: number) {
        const storeEntry = this.#messageStoreSnapshot.get(chatroomId)
        if (!storeEntry) {
            this.#fireError(new Error(`MessageStore does not contain chatroom with ID of ${chatroomId}.`))
            return
        }
        const cursor = this.#cursors.get(chatroomId) ?? 0
        const newCursor = cursor + this.#jump

        if (newCursor >= storeEntry.messages.length) {
            this.#messageStore.fetchNextMessages(chatroomId, newCursor + 1 - storeEntry.messages.length)
        }
        this.#cursors.set(chatroomId, Math.min(newCursor, storeEntry.messages.length - this.#size))

        this.#fireEmit()
    }

    movePrevious(chatroomId: number) {
        const storeEntry = this.#messageStoreSnapshot.get(chatroomId)
        if (!storeEntry) {
            this.#fireError(new Error(`MessageStore does not contain chatroom with ID of ${chatroomId}.`))
            return
        }
        const cursor = this.#cursors.get(chatroomId) ?? 0
        const newCursor = cursor - this.#jump

        if (newCursor < 0) {
            this.#messageStore.fetchPreviousMessages(chatroomId, -newCursor)
        }
        this.#cursors.set(chatroomId, Math.max(newCursor, 0))

        this.#fireEmit()
    }

    getMessages(chatroomId: number) {
        const storeEntry = this.#messageStoreSnapshot.get(chatroomId)
        if (!storeEntry) {
            this.#fireError(new Error(`MessageStore does not contain chatroom with ID of ${chatroomId}.`))
            return
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