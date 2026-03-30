import type WebSocket from "ws";
import { WebSocketServer } from "ws";
import { createServer, IncomingMessage } from "http";
import cookie from "@fastify/cookie"
import { tryParsePayload, type ChatMessagePayload } from "../protocol.js";
import http from "http"
import * as authService from "@/domains/auth/auth-service.js";
import * as chatroomsService from "@/domains/chatrooms/chatrooms-service.js"
import validation from "@/domains/00-common/route/validation.js";
import type Stream from "stream";


class Room {
    _users = new Set<number>()

    getUsers(): Set<number> {
        return this._users
    }

    add(userId: number): void {
        this._users.add(userId)
    }

    remove(userId: number): void {
        this._users.delete(userId)
    }
    
}

class ClientRegistry {
    _connections = new Map<number, WebSocket>()
    _rooms = new Map<number, Room>()
    _userIdToRoomIds = new Map<number, Set<number>>()

    getConnection(userId: number) {
        return this._connections.get(userId)
    }

    getConnections(roomId: number) {
        const userIds = this._rooms.get(roomId)?.getUsers()
        if (userIds === undefined) return undefined
        const connections: WebSocket[] = []
        userIds.forEach(id => {
            const connection = this._connections.get(id)!
            connections.push(connection)
        })
        return connections
    }



    register(userId: number, ws: WebSocket, roomIds: number[]) {
        const currentConnection = this._connections.get(userId)
        const connectionAlreadyExistsForUser = currentConnection !== undefined

        if (connectionAlreadyExistsForUser) {
            this.terminate(userId)
        }

        this._connections.set(userId, ws)
        this._userIdToRoomIds.set(userId, new Set(roomIds))
        roomIds.forEach(roomId => {
            const roomNotInRegistry = this._rooms.get(roomId) === undefined
            if (roomNotInRegistry) {
                const room = new Room()
                room.add(userId)
                this._rooms.set(roomId, room)
            }
        })

    }

    terminate(userId: number) {
        const ws = this._connections.get(userId)
        if (ws !== undefined) {
            this._connections.delete(userId)
            ws.terminate()
        }
        const userRooms = this._userIdToRoomIds.get(userId)
        if (userRooms !== undefined) {
            this._userIdToRoomIds.delete(userId)
            userRooms.forEach(roomId => {
                const room = this._rooms.get(roomId)
                if (room !== undefined) {
                    room.remove(userId)
                    if (room.getUsers().size === 0) {
                        this._rooms.delete(roomId)
                    }
                }
            })
        }
    }

    addToRoom(userId: number, roomId: number) {
        const userNotInRegistry = this._connections.get(userId) === undefined
        if (userNotInRegistry) return

        let room = this._rooms.get(roomId)
        if (room === undefined) {
            room = new Room()
            this._rooms.set(roomId, room)
        }
        room.add(userId)

        const roomIds = this._userIdToRoomIds.get(userId)
        if (roomIds === undefined) {
            throw new Error(`User with ID of ${userId} is not in _userIdToRoomIds, even though they exist in registry.`)
        }
        roomIds.add(roomId)
    }

    removeFromRoom(userId: number, roomId: number) {
        const userNotInRegistry = this._connections.get(userId) === undefined
        if (userNotInRegistry) return

        const room = this._rooms.get(roomId)
        const roomNotInRegistry = room === undefined
        if (roomNotInRegistry) return 

        room.remove(userId)

        const roomIds = this._userIdToRoomIds.get(userId)
        if (roomIds === undefined) {
            throw new Error(`User with ID of ${userId} is not in _userIdToRoomIds, even though they exist in registry.`)
        }
        roomIds.delete(roomId)
    }

    broadcast(message: ChatMessagePayload, roomId: number) {
        this.getConnections(roomId)?.forEach(ws => ws.send(JSON.stringify(message)))
    }
}

const globalRegistry = new ClientRegistry()

async function attachWSServer(server: http.Server) {
    const wss = new WebSocketServer({noServer: true})

    server.on("upgrade", (req, socket, head) => {
        try {
            if (req.headers.cookie !== undefined) {
                const cookies = cookie.parse(req.headers.cookie)
                const accessToken = validation.auth.accessToken.parse(cookies.accessToken)
                const verificationResult = authService.verifyAccessToken(accessToken)

                if (verificationResult.status != "SUCCESS") {
                    _passResponseAndDestroySocket(socket, verificationResult)
                    return
                }

                const userId = verificationResult.userId!
                wss.handleUpgrade(req, socket, head, async (client, request) => {
                    const getChatroomsResult = await chatroomsService.getChatrooms({userId, after: null})
                    if (getChatroomsResult.status !== "SUCCESS") {
                        client.send("An error occurred when loading chatrooms.")
                        client.terminate()
                        return
                    }
                    globalRegistry.register(userId, client, getChatroomsResult.chatroomsData!.map(cd => cd.id))
                })
            }
        } catch (e) {
            _passResponseAndDestroySocket(socket, {
                "status": "UNEXPECTED_ERROR",
                "message": "An error occurred."
            })
        }

    })

    wss.on("connection", (ws, req) => {
        ws.on("message", data => {
            let parsed = tryParsePayload("chatMessage", data)
            if (parsed === undefined) {
                ws.send(JSON.stringify({
                    type: "server",
                    code: "invalid_message"
                }))
                return
            }
            const roomId = parsed.roomId
            globalRegistry.broadcast(parsed, roomId)
        })
    })

}

function _passResponseAndDestroySocket(socket: Stream.Duplex, response: any) {
    socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n")
    socket.write("\r\n")
    socket.write(JSON.stringify(response))
    socket.destroy()
}
