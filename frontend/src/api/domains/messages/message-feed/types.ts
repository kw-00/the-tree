import type { MessageData } from "../messages-service"

export interface IMessageFeedSelector {
    getMessageFeed(chatroomId: number): IChatroomMessageFeed
    newMessageFeed(chatroomId: number): void
    removeMessageFeed(chatroomId: number): void
}

export interface IChatroomMessageFeed {
    getMessagesInWindow(): MessageData[]
    addNewMessages(...messages: MessageData[]): void
    fetchPreviousMessages(): Promise<boolean>
    fetchNextMessages(): Promise<boolean>
}