
import { SuperChunkifierCursor } from "@/utils/chunkifiers/implementation/cursors";
import { type MessageStore } from "./message-store";
import type { MessageData } from "./messages-service";
import { Chunkifier } from "@/utils/chunkifiers/implementation/chunkifiers";
import type { ISuperChunkifierCursor } from "@/utils/chunkifiers/types/cursors";




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

    getCursor(chatroomId: number): ISuperChunkifierCursor<MessageData> | undefined {
        return this.#chunkifiers.get(chatroomId)
    }
}

