import styles from "./_Dashboard.module.css"

import FriendsSection from "./sections/friends-section/FriendsSection";
import ChatroomsSection from "./sections/chatrooms-section/ChatroomsSection";
import MessagesSection from "./sections/messages-section/MessagesSection";
import Header from "./sections/header/Header";
import { useUIOptionsState } from "@/app/UIOptionsState";
import UserHeader from "../00-reused-sections/UserHeader";





export default function Dashboard() {
    const state = useUIOptionsState((state) => {
        const show = state.layout.show
        return [
            show.friendsSection,
            show.chatroomsSection,
            show.usersInChatroom
        ]
    })
    const show = state.layout.show

    return (
        <div className="v-stack h-svh w-svw">
            <UserHeader/>
            {/* Header */}
            <Header className={styles["collapse"]}/>
            {/* Content */}
            <div className="h-stack grow justify-between p-4">
                <div className={`h-stack grow justify-end ${styles["collapse"]}`}>
                    {show.friendsSection.get() && <FriendsSection className="grow basis-0"/>}
                    {show.chatroomsSection.get() && <ChatroomsSection className="grow basis-0"/>}
                </div>
                <div className="v-stack justify-start basis-2/3 surface-base">
                    <MessagesSection className="contrast-110 grow"/>
                </div>
            </div>
        </div>
    )
}