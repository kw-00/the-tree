import { SuperChunkifierCursor, Chunkifier } from "@/utils/chunkifier";
import { type MessageStore } from "./message-store";
import type { MessageData } from "./messages-service";




export class MessageStoreChunkifiers {
    #messageStore: MessageStore
    #chunkifiers: Map<number, SuperChunkifierCursor<MessageData>> = new Map()

    constructor(messageStore: MessageStore, chunkSize: number) {
        this.#messageStore = messageStore

        this.#messageStore.addChatroomListener((chatroomId, type) => {
            if (type === "added") {
                const chunkifierCursor = new SuperChunkifierCursor(new Chunkifier<MessageData>([], chunkSize), -1, 3)
                this.#chunkifiers.set(chatroomId, chunkifierCursor)

                this.#messageStore.addMessageListener((messages, type) => {
                    if (type === "appended") {
                        chunkifierCursor.getChunkifier().appendData(...messages)
                    } else if (type === "prepended") {
                        chunkifierCursor.getChunkifier().prependData(...messages)
                    }
                }, chatroomId)
            } else if (type === "removed") {
                this.#chunkifiers.delete(chatroomId)
            }
        })
    }

    getChunkifierCursor(chatroomId: number): ISuperChu<MessageData> | undefined {
        return this.#chunkifiers.get(chatroomId)
    }
}

