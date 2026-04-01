import { WebSocket } from "ws"
import type { ChatMessagePayload, ServerMessagePayload } from "../protocol.ts"

type EventHandlers = {
    open: (ws: WebSocket, e: WebSocket.Event) => any
    close: (ws: WebSocket, e: WebSocket.CloseEvent) => any
    error: (ws: WebSocket, e: WebSocket.ErrorEvent) => any
    chat: (ws: WebSocket, e: ChatMessagePayload) => any
    server: (ws: WebSocket, e: ServerMessagePayload) => any
}

export interface IClient {
    authenticate(token: string): void
    sendMessage(data: any, roomId: number): Promise<boolean>

    addEventListener<K extends keyof EventHandlers>(eventKey: K, handler: EventHandlers[K]): () => void
    removeEventListener<K extends keyof EventHandlers>(eventKey: K, handler: EventHandlers[K]): void

    close(): void
}
