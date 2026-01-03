import { useRef } from "react"
import { getNextMessages, getPreviousMessages, type MessageData } from "./messages-service"
import { throwErrorOnRequestFailure } from "../00-common/queries/utility"


export type Room = {
    messages: MessageData[]
    scrollPosition: number | null
    hasPrevious: boolean
    hasNext: boolean
}

class ChatroomNotFoundError extends Error {
    constructor(chatroomId: number) {
        super(`Chatroom with ID of ${chatroomId} not found.`)
    }
}

export type ErrorListener = (state: Error) => void
export type MessageListener = (messages: MessageData[], chatroomId: number) => void
export type ResizedListener = (newSize: number, chatroomId: number) => void
export type ChatroomListener = (chatroomId: number) => void

export type Store = {
    data: Map<number, Room>

}

class MessageStore {

    #store: Store = {
        data: new Map(),
    }

    #dataSnapshot = new Map(this.#store.data)

    #errorListeners: Set<ErrorListener> =  new Set()
    #chatroomEmitListeners: Map<number, Set<() => void>> =  new Map()
    #globalEmitListeners: Set<() => void> = new Set()

    // Error Event
    addErrorListener(listener: ErrorListener) {
        this.#errorListeners.add(listener)
        return () => this.removeErrorListener(listener)
    }

    removeErrorListener (listener: ErrorListener) {
        this.#errorListeners.delete(listener)
    }

    // Data Mutated Event
    #addChatroomEmitListener(listener: () => void, chatroomId: number) {
        this.#chatroomEmitListeners.get(chatroomId)?.add(listener)
        return () => this.#removeChatroomEmitListener(listener, chatroomId)
    }

    #removeChatroomEmitListener(listener: () => void, chatroomId: number) {
        this.#chatroomEmitListeners.get(chatroomId)?.delete(listener)
    }

    // Message Prepended Event
    #addGlobalEmitListener(listener: () => void) {
        this.#globalEmitListeners.add(listener)
        return () => this.#removeGlobalEmitListener(listener)
    }

    #removeGlobalEmitListener(listener: () => void) {
        this.#globalEmitListeners.delete(listener)
    }

    #error(error: Error) {
        this.#errorListeners.forEach(l => l(error))
    }

    #emitChange(chatroomId: number) {
        const entry = this.#store.data.get(chatroomId)
        if (!entry) {
            this.#errorListeners.forEach(l => l(new Error("Emitting change for non-existent chatroom.")))
            return 
        }
        this.#store.data.set(chatroomId, Object.assign({}, entry))
        this.#dataSnapshot = new Map(this.#store.data)
        this.#chatroomEmitListeners.get(chatroomId)?.forEach(l => l())
        this.#globalEmitListeners.forEach(l => l())
    }


    // Adding chatrooms
    addChatrooms (...chatroomIds: number[]) {
        chatroomIds.forEach(id => {
            if (this.#store.data.get(id)) return
            this.#store.data.set(id, {messages: [], scrollPosition: null, hasPrevious: true, hasNext: true})
        })
    }

        // Adding chatrooms
    removeChatrooms(...chatroomIds: number[]) {
        chatroomIds.forEach(id => {
            this.#emitChange(id)
            this.#store.data.delete(id)
            this.#chatroomEmitListeners.delete(id)
        })
    }

    // Prepending messages
    prependMessages(chatroomId: number, ...messages: MessageData[]) {
        if (messages.length === 0) return
        let entry = this.#store.data.get(chatroomId)
        if (!entry) {
            this.addChatrooms(chatroomId)
            entry = this.#store.data.get(chatroomId)!
        }
        entry.messages = [...messages, ...entry.messages]
        this.#emitChange(chatroomId)
    }

    // Appending messages
    appendMessages(chatroomId: number, ...messages: MessageData[]) {
        if (messages.length === 0) return
        let entry = this.#store.data.get(chatroomId)
        if (!entry) {
            this.addChatrooms(chatroomId)
            entry = this.#store.data.get(chatroomId)!
        }
        entry.messages = [...entry.messages, ...messages]
        this.#emitChange(chatroomId)
    }

    resize(chatroomId: number, newSize: number, keep: "new" | "old" = "new") {
        const entry = this.#store.data.get(chatroomId)
        if (!entry) {
            this.#error(new ChatroomNotFoundError(chatroomId))
            return
        }
        if (entry.messages.length <= newSize) return 

        if (keep === "new") {
            entry.messages.splice(0, entry.messages.length - newSize)
        } else {
            entry.messages.splice(newSize)
        }
        entry.messages = [...entry.messages]
        this.#emitChange(chatroomId)
    }


    setScrollPosition (chatroomId: number, newPosition: number) {
        const entry = this.#store.data.get(chatroomId)
        if (!entry) {
            this.#error(new ChatroomNotFoundError(chatroomId))
            return
        }
        entry.scrollPosition = newPosition
    }

    // Fetching messages
    async fetchPreviousMessages(chatroomId: number, limit: number) {
        this.addChatrooms(chatroomId)
        const entry = this.#store.data.get(chatroomId)!
        if (!entry.hasPrevious) {
            return
        }
        const firstMessageId = entry.messages[0]?.id ?? null
        try {
            const result = await throwErrorOnRequestFailure(() => getPreviousMessages({chatroomId: chatroomId, before: firstMessageId, limit}))
            entry.hasPrevious = result.page?.prevCursor ? true : false
            this.prependMessages(chatroomId, ...result.page!.messagesData)
        } catch (error) {
            if (error instanceof Error) {
                this.#error(error)
            } else {
                throw error
            }
        }

    }

    async fetchNextMessages(chatroomId: number, limit: number) {
        this.addChatrooms(chatroomId)
        const entry = this.#store.data.get(chatroomId)!
        if (!entry.hasNext) {
            return
        }
        const lastMessageId = entry.messages.at(-1)?.id ?? null
        if (!lastMessageId) {
            await this.fetchPreviousMessages(chatroomId, limit)
            return
        }
        try {
            const result = await throwErrorOnRequestFailure(() => getNextMessages({chatroomId: chatroomId, after: lastMessageId, limit}))
            entry.hasNext = result.page?.nextCursor ? true : false
            this.appendMessages(chatroomId, ...result.page!.messagesData)
        } catch (error) {
            if (error instanceof Error) {
                this.#error(error)
            } else {
                throw error
            }
        }
    }

    invalidate(chatroomId: number) {
        const entry = this.#store.data.get(chatroomId)
        if (!entry) {
            this.#error(new ChatroomNotFoundError(chatroomId))
            return
        }
        entry.hasNext = true
    }

    // May be passed as callbacks
    subscribeChatroom = (listener: () => void, chatroomId: number) => {
        return this.#addChatroomEmitListener(listener, chatroomId)
    }

    subscribeGlobal = (listener: () => void) => {
        return this.#addGlobalEmitListener(listener)
    }

    getSnapshot = () => {
        return this.#dataSnapshot as ReadonlyMap<number, Readonly<Room>>
    }
}

const globalStore = new MessageStore()

export function useMessageStore() {
    const storeRef = useRef(globalStore)

    return {
        data: storeRef.current.getSnapshot(),
        functions: storeRef.current
    }
}