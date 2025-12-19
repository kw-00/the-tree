import { useRef, useState } from "react"
import type { MessageData } from "./messages-service"


export type Room = {
    messages: MessageData[]
    scrollPosition: number
} 


export type ErrorListener = (state: "CHATROOM_NOT_FOUND") => void
export type MessageListener = (messages: MessageData[], chatroomId: number) => void
export type ResizedListener = (newSize: number, chatroomId: number) => void

export type Store = {
    data: Map<number, Room>
    errorListeners: Set<ErrorListener>
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

    return {
        data: store.data, 
        addErrorListener,
        removeErrorListener,
        addPrependedListener, 
        removePrependedListener, 
        addAppendedListener, 
        removeAppendedListener, 
        addMessageListener,
        removeMessageListener,
        addResizedListener,
        removeResizedListener,
        prependMessages, 
        appendMessages,
        resize
    }
}