import { ChatProvider } from "./contexts/ChatContext"
import Chat from "./sections/chat/Chat"
import ChatList from "./sections/chat-list/ChatList"
import LogoutButton from "./components/LogoutButton"

export default function Dashboard() {
    return (
        <ChatProvider>
            <LogoutButton/>
            <ChatList/>
            <Chat />
        </ChatProvider>
    )
}