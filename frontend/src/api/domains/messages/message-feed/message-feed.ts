import { ListWindow } from "@/utils/list-window/list-window";
import { getPreviousMessages, getNextMessages, type MessageData } from "../messages-service";
import { throwErrorOnRequestFailure } from "../../00-common/queries/utility";
import type { IChatroomMessageFeed } from "./types";

const conf = {
    MESSAGE_BATCH_SIZE: 100
}

class ChatroomMessageFeed implements IChatroomMessageFeed {
    #chatroomId: number
    #messages: MessageData[]
    #window: ListWindow<MessageData>

    #hasPrevious: boolean = true

    constructor(chatroomId: number, windowSize: number, windowStep: number) {
        this.#chatroomId = chatroomId
        this.#messages = []
        this.#window = new ListWindow(this.#messages, windowSize, windowStep, -1)
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
}