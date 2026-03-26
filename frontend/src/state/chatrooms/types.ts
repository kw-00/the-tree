import type { MessageData } from "@/api/domains/messages/messages-service"

export interface IChatroomMessageFeed {
    getMessagesInWindow(): MessageData[]
    moveOlder(): Promise<boolean>
    moveNewer(): Promise<boolean>
}

export interface IMessageRepository {
    messages(): MessageData[]
    loadOlderMessages(): void
    refresh(): void
}