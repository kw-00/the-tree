import { useRef } from "react"
import { getPreviousMessages, type GetMessagesResponse, type MessageData } from "./messages-service"
import { ServerServiceError, throwErrorOnRequestFailure } from "../00-common/queries/utility"


export type Room = {
    messages: MessageData[]
    scrollPosition: number | null
} 

export type MessageCacheError = "CHATROOM_NOT_FOUND" | "CHATROOM_ALREADY_ADDED" | Error
export type ErrorListener = (state: MessageCacheError) => void
export type MessageListener = (messages: MessageData[], chatroomId: number) => void
export type ResizedListener = (newSize: number, chatroomId: number) => void
export type ChatroomListener = (chatroomId: number) => void

export type Store = {
    data: Map<number, Room>
    errorListeners: Set<ErrorListener>
    chatroomAddedListeners: Set<ChatroomListener>,
    chatroomRemovedListeners: Set<ChatroomListener>,
    prependedListeners: Set<MessageListener>
    appendedListeners: Set<MessageListener>
    resizedListeners: Set<ResizedListener>
}

export function useMessageCache() {

    const storeRef = useRef<Store | null>(null)
    if (!storeRef.current) {
        storeRef.current = {
            data: new Map(),
            errorListeners: new Set(),
            chatroomAddedListeners: new Set(),
            chatroomRemovedListeners: new Set(),
            prependedListeners: new Set(),
            appendedListeners: new Set(),
            resizedListeners: new Set()
        }
    }
    const store = storeRef.current

    // Error Event
    const addErrorListener = (listener: ErrorListener) => {
        store.errorListeners.add(listener)
        return () => removeErrorListener(listener)
    }

    const removeErrorListener = (listener: ErrorListener) => {
        store.errorListeners.delete(listener)
    }

    const addChatroomAddedListener = (listener: ChatroomListener) => {
        store.chatroomAddedListeners.add(listener)
        return () => removeChatroomAddedListener(listener)
    }

    const removeChatroomAddedListener = (listener: ChatroomListener) => {
        store.chatroomAddedListeners.delete(listener)
    }

    const addChatroomRemovedListener = (listener: ChatroomListener) => {
        store.chatroomRemovedListeners.add(listener)
        return () => removeChatroomAddedListener(listener)
    }

    const removeChatroomRemovedListener = (listener: ChatroomListener) => {
        store.chatroomRemovedListeners.delete(listener)
    }

    // Message Prepended Event
    const addPrependedListener = (listener: MessageListener) => {
        store.prependedListeners.add(listener)
        return () => removePrependedListener(listener)
    }

    const removePrependedListener = (listener: MessageListener) => {
        store.prependedListeners.delete(listener)
    }

    // Message Appended Event
    const addAppendedListener = (listener: MessageListener) => {
        store.appendedListeners.add(listener)
        return () => removeAppendedListener(listener)
    }

    const removeAppendedListener = (listener: MessageListener) => {
        store.appendedListeners.delete(listener)
    }

    // Message Event
    const addMessageListener = (listener: MessageListener) => {
        addPrependedListener(listener)
        addAppendedListener(listener)
        return () => removeMessageListener(listener)
    }

    const removeMessageListener = (listener: MessageListener) => {
        removePrependedListener(listener)
        removeAppendedListener(listener)
    }

    // Resized Event
    const addResizedListener = (listener: ResizedListener) => {
        store.resizedListeners.add(listener)
        return () => removeResizedListener(listener)
    }

    const removeResizedListener = (listener: ResizedListener) => {
        store.resizedListeners.delete(listener)
    }

    // Adding chatrooms
    const addChatroom = (chatroomId: number) => {
        const entry = store.data.get(chatroomId)
        if (entry) {
            store.errorListeners.forEach(l => l("CHATROOM_ALREADY_ADDED"))
            return
        }
        store.data.set(chatroomId, {scrollPosition: null, messages: []})
        store.chatroomAddedListeners.forEach(l => l(chatroomId))
    }

    // Removing chatrooms
    const removeChatroom = (chatroomId: number) => {
        if (!store.data.delete(chatroomId)) {
            store.errorListeners.forEach(l => l("CHATROOM_NOT_FOUND"))
        }
    }

    // Prepending messages
    const prependMessages = (chatroomId: number, ...messages: MessageData[]) => {
        const entry = store.data.get(chatroomId)
        if (!entry) {
            store.errorListeners.forEach(l => l("CHATROOM_NOT_FOUND"))
            return
        }
        entry.messages.unshift(...messages)
        store.prependedListeners.forEach(l => l(messages, chatroomId))
    }

    // Appending messages
    const appendMessages = (chatroomId: number, ...messages: MessageData[]) => {
        const entry = store.data.get(chatroomId)
        if (!entry) {
            store.errorListeners.forEach(l => l("CHATROOM_NOT_FOUND"))
            return
        }
        entry.messages.push(...messages)
        store.appendedListeners.forEach(l => l(messages, chatroomId))
    }

    const resize = (chatroomId: number, newSize: number) => {
        const entry = store.data.get(chatroomId)
        if (!entry) {
            store.errorListeners.forEach(l => l("CHATROOM_NOT_FOUND"))
            return
        }
        if (entry.messages.length <= newSize) return 
        entry.messages = entry.messages.slice(-newSize)
        store.resizedListeners.forEach(l => l(newSize, chatroomId))
    }

    // Fetching messages
    async function fetchMessages(chatroomId: number, limit: number) {
        const entry = store.data.get(chatroomId)
        if (!entry) {
            store.errorListeners.forEach(l => l("CHATROOM_NOT_FOUND"))
            return
        }

        const firstMessageId = entry.messages[0]?.id ?? null
        try {
            const result = await throwErrorOnRequestFailure(() => getPreviousMessages({chatroomId: chatroomId, before: firstMessageId, limit}))
            prependMessages(chatroomId, ...result.page!.messagesData)
        } catch (error) {
            if (error instanceof Error) {
                store.errorListeners.forEach(l => l(error))
            } else {
                throw error
            }
        }

    }

    return {
        data: store.data, 
        addErrorListener,
        removeErrorListener,
        addChatroomAddedListener,
        addChatroomRemovedListener,
        addPrependedListener, 
        removePrependedListener, 
        addAppendedListener, 
        removeAppendedListener, 
        addMessageListener,
        removeMessageListener,
        addResizedListener,
        removeResizedListener,
        addChatroom,
        removeChatroom,
        prependMessages, 
        appendMessages,
        resize,
        fetchMessages
    }
}