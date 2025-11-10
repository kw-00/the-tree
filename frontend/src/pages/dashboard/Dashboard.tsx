import { ChatProvider } from "./contexts/ChatContext"
import Chat from "./sections/chat/Chat"
import ChatList from "./sections/chat-list/ChatList"
import { useState } from "react"

export default function Dashboard() {

    const [connectedUserIds, setConnectedUserIds] = useState([])
    return (
        <ChatProvider>
            <ChatList connectedUserIds={connectedUserIds}/>
            <Chat />
        </ChatProvider>
    )
}