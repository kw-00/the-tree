import styles from "./_Dashboard.module.css"

import Panel from "@/app/components/panel/Panel";
import FriendsSection from "./sections/friends-section/FriendsSection";
import ChatroomsSection from "./sections/chatrooms-section/ChatroomsSection";
import MessagesSection from "./sections/messages-section/MessagesSection";
import Header from "./sections/header/Header";





export default function Dashboard() {
    return (
        <div className={styles["topmost-container"]}>
            {/* Header */}
            <Header/>
            {/* Content */}
            <Panel variant="1" className={styles["content"]}>
                <FriendsSection className="flex-1 basis-1/6"/>
                <ChatroomsSection className="flex-1 basis-1/6"/>
                <MessagesSection className="flex-1 basis-4/6"/>
            </Panel>
        </div>
    )
}