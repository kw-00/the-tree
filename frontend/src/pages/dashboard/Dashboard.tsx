import { ChatProvider } from "./contexts/ChatContext"
import Chat from "./sections/chat/Chat"
import ChatList from "./sections/chat-list/ChatList"
import { useState } from "react"
import LogoutButton from "./components/LogoutButton"

export default function Dashboard() {

    const [connectedUserIds, setConnectedUserIds] = useState([])
    return (
        <ChatProvider>
            <LogoutButton/>
            <ChatList connectedUserIds={connectedUserIds}/>
            <Chat />
        </ChatProvider>
    )
}