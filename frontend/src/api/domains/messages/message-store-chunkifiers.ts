import { ChunkifierCursor, MergingChunkifier } from "@/utils/chunkifier";
import { type MessageStore } from "./message-store";
import type { MessageData } from "./messages-service";




export class MessageStoreChunkifiers {
    #messageStore: MessageStore
    #chunkifiers: Map<number, ChunkifierCursor<MessageData>> = new Map()

    constructor(messageStore: MessageStore, chunkSize: number) {
        this.#messageStore = messageStore

        this.#messageStore.addChatroomListener((chatroomId, type) => {
            if (type === "added") {
                const chunkifier = new ChunkifierCursor(new MergingChunkifier<MessageData>([], chunkSize), -1)
                this.#chunkifiers.set(chatroomId, chunkifier)

                this.#messageStore.addMessageListener((messages, type) => {
                    if (type === "appended") {
                        chunkifier.appendData(...messages)
                    } else if (type === "prepended") {
                        chunkifier.prependData(...messages)
                    }
                }, chatroomId)
            } else if (type === "removed") {
                this.#chunkifiers.delete(chatroomId)
            }
        })
    }

    getChunkifier(chatroomId: number): ChunkifierCursor<MessageData> | undefined {
        return this.#chunkifiers.get(chatroomId)
    }
}

