
import { type MessageStore } from "./message-store";
import type { MessageData } from "./messages-service";
import { ListWindow } from "@/utils/list-window/list-window";


const windowSize = 50
const windowOffset = 20


export class MessageStoreWindows {
    #messageStore: MessageStore
    #windows: Map<number, ListWindow<MessageData>> = new Map()

    constructor(messageStore: MessageStore) {
        this.#messageStore = messageStore

        this.#messageStore.addChatroomListener((chatroomId, type) => {
            if (type === "added") {
                const messageWindow = new ListWindow(messageStore.getStore().get(chatroomId)!.messages, windowSize, windowOffset, -1)
                this.#windows.set(chatroomId, messageWindow)
            } else if (type === "removed") {
                this.#windows.delete(chatroomId)
            }
        })
    }

    getWindow(chatroomId: number): ListWindow<MessageData> | undefined {
        return this.#windows.get(chatroomId)
    }
}

