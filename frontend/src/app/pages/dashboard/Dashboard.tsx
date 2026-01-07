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
        <div className="h-svh w-svw flex flex-col">
            {/* Header */}
            <Header className={styles["collapse"]}/>
            {/* Content */}
            <div className="h-stack grow justify-between p-4">
                <div className={`h-stack grow justify-end ${styles["collapse"]}`}>
                    {show.friendshipCodesSection.get() && <FriendshipCodesSection className="grow"/>}
                    {show.friendsSection.get() && <FriendsSection className="grow"/>}
                    {show.chatroomsSection.get() && <ChatroomsSection className="grow"/>}
                </div>
                <div className="v-stack justify-start basis-3/4">
                    <MessagesSection className="surface-base grow"/>
                </div>
            </div>
        </div>
    )
}