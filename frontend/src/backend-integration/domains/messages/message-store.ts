import { useRef } from "react"
import { getNextMessages, getPreviousMessages, type MessageData } from "./messages-service"
import { throwErrorOnRequestFailure } from "../00-common/queries/utility"


export type Room = {
    messages: MessageData[]
    scrollPosition: number | null
    hasPrevious: boolean
    hasNext: boolean
}



export type MessageCacheError = 
    {state: string, data: any} 
    | Error

class ChatroomNotFound {
    state: "CHATROOM_NOT_FOUND" = "CHATROOM_NOT_FOUND"
    data
    constructor(chatroomId: number) {
        this.data = {chatroomId: chatroomId}
    }
}

export type ErrorListener = (state: MessageCacheError) => void
export type MessageListener = (messages: MessageData[], chatroomId: number) => void
export type ResizedListener = (newSize: number, chatroomId: number) => void
export type ChatroomListener = (chatroomId: number) => void

export type Store = {
    data: Map<number, Room>
    errorListeners: Set<ErrorListener>
    emitListeners: Set<() => void>
}

class MessageStore {

    #store: Store = {
        data: new Map(),
        errorListeners: new Set(),
        emitListeners: new Set()
    }

    #dataSnapshot = new Map(this.#store.data)

    // Error Event
    addErrorListener(listener: ErrorListener) {
        this.#store.errorListeners.add(listener)
        return () => this.removeErrorListener(listener)
    }

    removeErrorListener (listener: ErrorListener) {
        this.#store.errorListeners.delete(listener)
    }

    // Message Prepended Event
    #addEmitListener(listener: () => void) {
        this.#store.emitListeners.add(listener)
        return () => this.#removeEmitListener(listener)
    }

    #removeEmitListener(listener: () => void) {
        this.#store.emitListeners.delete(listener)
    }

    #emitChange() {
        this.#dataSnapshot = new Map(this.#store.data)
        this.#store.emitListeners.forEach(l => l())
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
            this.#store.data.delete(id)
        })
    }

    // Prepending messages
    prependMessages(chatroomId: number, ...messages: MessageData[]) {
        console.log("Prepending ", messages.length)
        if (messages.length === 0) return
        let entry = this.#store.data.get(chatroomId)
        if (!entry) {
            this.addChatrooms(chatroomId)
            entry = this.#store.data.get(chatroomId)!
        }
        entry.messages.unshift(...messages)
        this.#emitChange()
    }

    // Appending messages
    appendMessages(chatroomId: number, ...messages: MessageData[]) {
        console.log("Appending ", messages.length)
        if (messages.length === 0) return
        let entry = this.#store.data.get(chatroomId)
        if (!entry) {
            this.addChatrooms(chatroomId)
            entry = this.#store.data.get(chatroomId)!
        }
        entry.messages.push(...messages)
        this.#emitChange()
    }

    resize(chatroomId: number, newSize: number, keep: "new" | "old" = "new") {
        const entry = this.#store.data.get(chatroomId)
        if (!entry) {
            this.#store.errorListeners.forEach(l => l(new ChatroomNotFound(chatroomId)))
            return
        }
        if (entry.messages.length <= newSize) return 

        if (keep === "new") {
            entry.messages.splice(0, entry.messages.length - newSize)
        } else {
            entry.messages.splice(newSize)
        }
        this.#emitChange()
    }


    setScrollPosition (chatroomId: number, newPosition: number) {
        const entry = this.#store.data.get(chatroomId)
        if (!entry) {
            this.#store.errorListeners.forEach(l => l(new ChatroomNotFound(chatroomId)))
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
                this.#store.errorListeners.forEach(l => l(error))
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
                this.#store.errorListeners.forEach(l => l(error))
            } else {
                throw error
            }
        }
    }

    invalidate(chatroomId: number) {
        const entry = this.#store.data.get(chatroomId)
        if (!entry) {
            this.#store.errorListeners.forEach(l => l({state: "CHATROOM_NOT_FOUND", data: {chatroomId: chatroomId}}))
            return
        }
        entry.hasNext = true
    }

    // May be passed as callbacks
    subscribe = (listener: () => void) => {
        return this.#addEmitListener(listener)
    }
    
    getSnapshot = () => {
        return this.#dataSnapshot
    }
}


export function useMessageStore() {
    const storeRef = useRef(new MessageStore())

    return {
        data: storeRef.current.getSnapshot(),
        functions: storeRef.current
    }
}