import type { MessageData } from "../messages-service"

export interface IChatroomMessageFeed {
    getMessagesInWindow(): MessageData[]
    addNewMessages(...messages: MessageData[]): void
    fetchPreviousMessages(): Promise<boolean>
    fetchNextMessages(): Promise<boolean>
    clear(): void
    delete(): void
}