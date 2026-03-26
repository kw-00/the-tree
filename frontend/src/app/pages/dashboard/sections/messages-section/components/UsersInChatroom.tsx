import type { FriendData } from "@/api/domains/friends/friends-service"






export default function UsersInChatroom() {
    const friends: FriendData[] = []
    return (
        <div className="v-stack grow">
            <div className="surface-elevated">
                <h3 className="heading-3">Chatroom members</h3>
            </div>
            <div className="v-stack overflow-y-auto surface-sunken grow contain-size">
                {friends.map((f, n) => <div key={n} className="surface-item">{f.login}</div>)}
            </div>
        </div>
    )
}