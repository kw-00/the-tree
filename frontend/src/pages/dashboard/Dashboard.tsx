import { ChatProvider } from "./contexts/ChatContext"
import Chat from "./sections/chat/Chat"
import ChatList from "./sections/chat-list/ChatList"
import LogoutButton from "./components/LogoutButton"

export default function Dashboard() {
    return (
        <ChatProvider>
            <div className="bg-1 v-container">
                <div className="h-stack justify-content-center height-auto 
                    padding-vertical-8 bg-3 width-full 
                    border-style-solid border-bottom-width-1 border-opacity-50">
                    <LogoutButton/>
                </div>
                <div className="bg-1 h-container">
                    <ChatList className="v-stack bg-2 width-448 padding-horizontal-64 padding-vertical-16 align-self-flex-start" />
                    <Chat className="v-stack padding-horizontal-64 padding-vertical-16"/>
                    <div></div>
                </div>
                <div></div>
            </div>
        </ChatProvider>
    )
}