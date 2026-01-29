import type { MessageStore, Room } from "./message-store";
import { clamp } from "@/utils/math"




export type ErrorListener = (error: Error) => void

class MessageStoreWindow {
    #messageStore: MessageStore
    #messageStoreSnapshot: ReadonlyMap<number, Readonly<Room>>
    #size: number
    #jump: number
    #cursors: Map<number, number> = new Map()
    #errorListeners: Set<(error: Error) => void> = new Set()


    constructor(messageStore: MessageStore, size: number, jump: number) {
        this.#messageStore = messageStore
        this.#messageStoreSnapshot = messageStore.getSnapshot()
        this.#size = size
        this.#jump = jump

        this.#messageStore.subscribeGlobal(() => this.#messageStoreSnapshot = messageStore.getSnapshot())
    }

    addErrorListener(listener: ErrorListener) {
        this.#errorListeners.add(listener)
    }

    removeErrorListener(listener: ErrorListener) {
        this.#errorListeners.delete(listener)
    }

    #fireError(error: Error) {
        this.#errorListeners.forEach(l => l(error))
    }

    #movePrevious(chatroomId: number) {
        const storeEntry = this.#messageStoreSnapshot.get(chatroomId)
        if (!storeEntry) {
            this.#fireError(new Error(`MessageStore does not contain chatroom with ID of ${chatroomId}.`))
            return
        }
        const cursor = this.#cursors.get(chatroomId) ?? 0
        this.#cursors.set(chatroomId, Math.min(cursor + this.#jump, storeEntry.messages.length - this.#size))
    }

    #moveNext(chatroomId: number) {
        const storeEntry = this.#messageStoreSnapshot.get(chatroomId)
        if (!storeEntry) {
            this.#fireError(new Error(`MessageStore does not contain chatroom with ID of ${chatroomId}.`))
            return
        }
        const cursor = this.#cursors.get(chatroomId) ?? 0
        this.#cursors.set(chatroomId, Math.max(cursor - this.#jump, 0))
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