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
                {show.friendshipCodesSection.get() ? <FriendshipCodesSection className="m-1 basis-20"/> : <></>}
                {show.friendsSection.get() ? <FriendsSection className="m-1 basis-20"/> : <></>}
                {show.chatroomsSection.get() ? <ChatroomsSection className="m-1 basis-20"/> : <></>}
                <MessagesSection className="surface-base flex-1 basis-4/6"/>
            </div>
        </div>
    )
}