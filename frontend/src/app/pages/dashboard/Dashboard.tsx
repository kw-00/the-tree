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
        <div className="h-svh w-svw flex flex-col" data-state={state}>
            {/* Header */}
            <Header/>
            {/* Content */}
            <div className="flex flex-1 justify-between min-h-0">
                <div className="flex flex-1 justify-end min-h-0">
                    {show.friendshipCodesSection.get() && <FriendshipCodesSection className="flex-1"/>}
                    {show.friendsSection.get() && <FriendsSection className="flex-1"/>}
                    {show.chatroomsSection.get() && <ChatroomsSection className="flex-1"/>}
                </div>
                <div className="flex justify-start basis-3/4 flex-col min-h-0">
                    <MessagesSection className="surface-base flex-1"/>
                </div>
            </div>
        </div>
    )
}