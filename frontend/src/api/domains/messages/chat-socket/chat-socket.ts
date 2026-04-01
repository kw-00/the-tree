import type { MessageData } from "../messages-service"

const ws = new WebSocket("wss://localhost:3000")
ws.addEventListener("message", e => {
    console.log(e.data)
})


export function sendMessage(content: string, roomId: number) {
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
            type: "chat",
            chatroomId: roomId,
            content: content
        }))
    } 

}

export function onMessage(callback: (messageData: MessageData) => any) {
    ws.addEventListener("message", e => {
        const messageData: MessageData = JSON.parse(e.data.toString())
        callback(messageData)
    })
}

export function closews() {
    ws.close()
}

window.addEventListener("beforeunload", () => closews())
window.addEventListener("pagehide", () => closews())