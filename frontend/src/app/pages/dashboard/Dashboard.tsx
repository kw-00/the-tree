import styles from "./_Dashboard.module.css"

import FriendsSection from "./sections/friends-section/FriendsSection";
import ChatroomsSection from "./sections/chatrooms-section/ChatroomsSection";
import MessagesSection from "./sections/messages-section/MessagesSection";
import Header from "./sections/header/Header";
import FriendshipCodesSection from "./sections/friendship-codes-section/FriendshipCodesSection";
import { useDashboardState } from "./DashboardState";





export default function Dashboard() {
    const state = useDashboardState((state) => {
        const show = state.layout.show
        return [
            show.friendshipCodesSection,
            show.friendsSection,
            show.chatroomsSection,
            show.usersInChatroom
        ]
    })

    const show = state.layout.show

    return (
        <div className={styles["topmost-container"]} data-state={state}>
            {show.friendshipCodesSection.get()}
            {/* Header */}
            <Header/>
            {/* Content */}
            <div className={styles["content"]}>
                <div className="flex flex-1 justify-end">
                    {show.friendshipCodesSection.get() && <FriendshipCodesSection className="flex-1"/>}
                    {show.friendsSection.get() && <FriendsSection className="flex-1"/>}
                    {show.chatroomsSection.get() && <ChatroomsSection className="flex-1"/>}
                </div>
                <div className="flex justify-start basis-3/4">
                    <MessagesSection className="surface-base flex-1"/>
                </div>
            </div>
        </div>
    )
}