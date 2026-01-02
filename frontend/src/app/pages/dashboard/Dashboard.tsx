import styles from "./_Dashboard.module.css"

import Panel from "@/app/components/panel/Panel";
import FriendsSection from "./sections/friends-section/FriendsSection";
import ChatroomsSection from "./sections/chatrooms-section/ChatroomsSection";
import MessagesSection from "./sections/messages-section/MessagesSection";
import Header from "./sections/header/Header";
import FriendshipCodesSection from "./sections/friendship-codes-section/FriendshipCodesSection";





export default function Dashboard() {
    return (
        <div className={styles["topmost-container"]}>
            {/* Header */}
            <Header/>
            {/* Content */}
            <Panel variant="1" className={styles["content"]}>
                <FriendshipCodesSection className="basis-20"/>
                <FriendsSection className="basis-20"/>
                <ChatroomsSection className="basis-20"/>
                <MessagesSection className="flex-1 basis-4/6"/>
            </Panel>
        </div>
    )
}