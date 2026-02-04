import { getNextMessages, getPreviousMessages, type MessageData } from "./messages-service"
import { throwErrorOnRequestFailure } from "../00-common/queries/utility"


export type Room = {
    messages: MessageData[]
    hasPrevious: boolean
    hasNext: boolean
}

class ChatroomNotFoundError extends Error {
    constructor(chatroomId: number) {
        super(`Chatroom with ID of ${chatroomId} not found.`)
    }
}

export type MessageListener = (messages: MessageData[], type: "appended" | "prepended") => void
export type ChatroomListener = (chatroomId: number, type: "added" | "removed") => void
export type ResizingListener = () => void

export type Store = Map<number, Room>

export type ReadonlyStore = ReadonlyMap<number, Readonly<Room>>

export class MessageStore {

    #store: Store = new Map()

    #chatroomListeners: Set<ChatroomListener> =  new Set()
    #messageListeners: Map<number, Set<MessageListener>> = new Map()
    #resizingListeners: Map<number, Set<ResizingListener>> = new Map()


    // Chatroom Event
    addChatroomListener(listener: ChatroomListener) {
        this.#chatroomListeners.add(listener)
        return () => this.removeChatroomListener(listener)
    }

    removeChatroomListener(listener: ChatroomListener) {
        this.#chatroomListeners.delete(listener)
    }

    #fireChatroomAdded(chatroomId: number) {
        this.#chatroomListeners.forEach(l => l(chatroomId, "added"))
    }

    #fireChatroomRemoved(chatroomId: number) {
        this.#chatroomListeners.forEach(l => l(chatroomId, "removed"))
    }

    // Message Event
    addMessageListener(listener: MessageListener, chatroomId: number) {
        const listenerSet = this.#messageListeners.get(chatroomId)
        if (!listenerSet) throw new Error(`Message with ID of ${chatroomId} is not featured in MessageStore.`) 
        
        listenerSet.add(listener)
        return () => this.removeMessageListener(listener, chatroomId)
    }

    removeMessageListener(listener: MessageListener, chatroomId: number) {
        this.#messageListeners.get(chatroomId)?.delete(listener)
    }

    #fireMessagesAppended(chatroomId: number, messages: MessageData[]) {
        this.#messageListeners.get(chatroomId)?.forEach(l => l(messages, "appended"))
    }

    #fireMessagesPrepended(chatroomId: number, messages: MessageData[]) {
        this.#messageListeners.get(chatroomId)?.forEach(l => l(messages, "prepended"))
    }

    // Resizing Event
    addResizingListener(listener: ResizingListener, chatroomId: number) {
        const listenerSet = this.#resizingListeners.get(chatroomId)
        if (!listenerSet) throw new Error(`Resizing with ID of ${chatroomId} is not featured in MessageStore.`) 
        
        listenerSet.add(listener)
        return () => this.removeResizingListener(listener, chatroomId)
    }

    removeResizingListener(listener: ResizingListener, chatroomId: number) {
        this.#resizingListeners.get(chatroomId)?.delete(listener)
    }

    #fireResized(chatroomId: number) {
        this.#resizingListeners.get(chatroomId)?.forEach(l => l())
    }


    getStore(): ReadonlyStore {
        return this.#store
    }

    // Adding chatrooms
    addChatrooms(...chatroomIds: number[]) {
        chatroomIds.forEach(id => {
            if (this.#store.get(id)) return
            this.#store.set(id, {messages: [], hasPrevious: true, hasNext: true})
            this.#fireChatroomAdded(id)
        })
    }

    // Removing chatrooms
    removeChatrooms(...chatroomIds: number[]) {
        chatroomIds.forEach(id => {
            this.#store.delete(id)
            this.#messageListeners.delete(id)
            this.#resizingListeners.delete(id)
            this.#fireChatroomRemoved(id)
        })
    }
    
    // Appending messages
    appendMessages(chatroomId: number, ...messages: MessageData[]) {
        if (messages.length === 0) return
        let entry = this.#store.get(chatroomId)
        if (!entry) {
            this.addChatrooms(chatroomId)
            entry = this.#store.get(chatroomId)!
        }
        entry.messages = [...entry.messages, ...messages]
        this.#fireMessagesAppended(chatroomId, messages)
    }

    // Prepending messages
    prependMessages(chatroomId: number, ...messages: MessageData[]) {
        if (messages.length === 0) return
        let entry = this.#store.get(chatroomId)
        if (!entry) {
            this.addChatrooms(chatroomId)
            entry = this.#store.get(chatroomId)!
        }
        entry.messages = [...messages, ...entry.messages]
        this.#fireMessagesPrepended(chatroomId, messages)
    }

    resize(chatroomId: number, newSize: number, keep: "new" | "old" = "new") {
        const entry = this.#store.get(chatroomId)
        if (!entry) {
            throw new ChatroomNotFoundError(chatroomId)
        }
        if (entry.messages.length <= newSize) return 

        if (keep === "new") {
            entry.messages.splice(0, entry.messages.length - newSize)
        } else {
            entry.messages.splice(newSize)
        }
        entry.messages = [...entry.messages]
        this.#fireResized(chatroomId)
    }

    // Fetching messages
    async fetchPreviousMessages(chatroomId: number, limit: number) {
        this.addChatrooms(chatroomId)
        const entry = this.#store.get(chatroomId)!
        if (!entry.hasPrevious) {
            return
        }
        const firstMessageId = entry.messages[0]?.id ?? null
        const result = await throwErrorOnRequestFailure(() => getPreviousMessages({chatroomId: chatroomId, before: firstMessageId, limit}))
        entry.hasPrevious = result.page?.prevCursor ? true : false
        this.prependMessages(chatroomId, ...result.page!.messagesData)
    }

    async fetchNextMessages(chatroomId: number, limit: number) {
        this.addChatrooms(chatroomId)
        const entry = this.#store.get(chatroomId)!
        if (!entry.hasNext) {
            return
        }
        const lastMessageId = entry.messages.at(-1)?.id ?? null
        if (!lastMessageId) {
            await this.fetchPreviousMessages(chatroomId, limit)
            return
        }
        const result = await throwErrorOnRequestFailure(() => getNextMessages({chatroomId: chatroomId, after: lastMessageId, limit}))
        entry.hasNext = result.page?.nextCursor ? true : false
        this.appendMessages(chatroomId, ...result.page!.messagesData)

    }

    invalidate(chatroomId: number) {
        const entry = this.#store.get(chatroomId)
        if (entry) entry.hasNext = true
    }
}
