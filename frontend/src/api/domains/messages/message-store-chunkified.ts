import { Chunkifier } from "@/utils/chunkifier";
import type { MessageStore, Room } from "./message-store";





export class MessageStoreChunkified {
    #messageStore: MessageStore
    #chunkifiers: Map<number, Chunkifier<Room>> = new Map()

    constructor(messageStore: MessageStore, chunkSize: number, initialCursor: number) {
        this.#messageStore = messageStore

        this.#messageStore.addChatroomListener((chatroomId, type) => {
            if (type === "added") {
                this.#chunkifiers.set(chatroomId, new Chunkifier([], chunkSize, initialCursor))
                this.#messageStore.addMessageListener(messages => {

                }, chatroomId)
            }
        })
    }
}