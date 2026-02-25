import { ListWindow } from "@/utils/list-window/list-window";
import { getPreviousMessages, getNextMessages, type MessageData } from "../messages-service";
import { throwErrorOnRequestFailure } from "../../00-common/queries/utility";
import type { IChatroomMessageFeed as IMessageFeed } from "./types";

const conf = {
    MESSAGE_BATCH_SIZE: 100,
    WINDOW_SIZE: 50,
    WINDOW_STEP: 30
}

class MessageFeed implements IMessageFeed {
    #chatroomId: number
    #messages: MessageData[]
    #window: ListWindow<MessageData>

    #hasPrevious: boolean = true

    constructor(chatroomId: number) {
        this.#chatroomId = chatroomId
        this.#messages = []
        this.#window = new ListWindow(this.#messages, conf.WINDOW_SIZE, conf.WINDOW_STEP, -1)
    }

    getMessagesInWindow() {
        return this.#window.current()
    }

    addNewMessages(...messages: MessageData[]) {
        this.#messages.push(...messages)
    }


    async fetchPreviousMessages() {
        if (!this.#hasPrevious) return false

        if (this.#messages.length === 0) {
            return await this.#fetchInitialMessages()
        }

        if (this.#window.hasPrevious()) {
            this.#window.movePrevious()
            return true
        }

        const firstMessage = this.#messages[0]
        const requestResult = await throwErrorOnRequestFailure(
            async () => await getPreviousMessages({
                before: firstMessage.id, 
                chatroomId: this.#chatroomId, 
                limit: conf.MESSAGE_BATCH_SIZE
            })
        )
        const messagesFetched = requestResult.page?.messagesData!
        this.#messages = [...messagesFetched, ...this.#messages]
        this.#window.movePrevious()
        this.#hasPrevious = requestResult.page?.prevCursor ? true : false
        return messagesFetched.length > 0
    }

    async fetchNextMessages() {
        if (this.#messages.length === 0) {
            return await this.#fetchInitialMessages()
        }

        if (this.#window.hasNext()) {
            this.#window.moveNext()
            return true
        }
        return false
    }

    async #fetchInitialMessages() {
        const requestResult = await throwErrorOnRequestFailure(
            async () => await getPreviousMessages({
                before: null, 
                chatroomId: this.#chatroomId, 
                limit: conf.MESSAGE_BATCH_SIZE
            })
        )
        const messagesFetched = requestResult.page?.messagesData!
        this.#messages = [...messagesFetched]
        this.#hasPrevious = requestResult.page?.nextCursor ? true : false
        return messagesFetched.length > 0
    }

    clear() {
        this.#messages.length = 0
    }

    delete() {
        globalFeedMap.delete(this.#chatroomId)
    }
}

const globalFeedMap: Map<number, MessageFeed> = new Map()


export function useMessageFeed(chatroomId: number) {
    if (!globalFeedMap.has(chatroomId)) {
        globalFeedMap.set(chatroomId, new MessageFeed(chatroomId))
    }
    return globalFeedMap.get(chatroomId)!
}