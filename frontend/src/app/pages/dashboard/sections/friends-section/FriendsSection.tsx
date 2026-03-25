
import { useState } from "react";
import { useFriendsQuery, useInvalidateFriendsQuery } from "@/api/domains/friends/friends-queries";
import { addFriend, removeFriend, type FriendData }  from "@/api/domains/friends/friends-service"


function FriendListItem({id, login}: FriendData) {
    const invalidate = useInvalidateFriendsQuery()

    const handleRemoveClicked = async () => {
        const requestResult = await removeFriend({friendId: id})
        if (requestResult.status === "SUCCESS") {
            await invalidate()
        }
    }

    return (
        <div className="h-stack items-center surface-item">
            <div className="grow">
                {login}
            </div>
            <button className="button-danger" onClick={handleRemoveClicked}>
                Remove
            </button>
        </div>
    )
}

export default function FriendsSection({className, ...rest}: React.HTMLAttributes<HTMLDivElement>) {
    const friendsQuery = useFriendsQuery()
    const invalidate = useInvalidateFriendsQuery()

    const [userToBefriendLogin, setUserToBefriendLogin] = useState("")
    const [friendshipCode, setFriendshipCode] = useState("")

    const handleAddFriendSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const requestResult = await addFriend({friendshipCode, userToBefriendLogin})
        if (requestResult.status === "SUCCESS") {
            await invalidate()
        }
    }

    return (
        <div className={`v-stack ${className ?? ""}`} {...rest}>
            <div className="v-stack surface-elevated gap-sm">
                {/* Search Bar */}
                <form onSubmit={handleAddFriendSubmit} className="v-stack gap-sm">
                    <input className="input grow" placeholder="Enter friend login..." 
                        value={userToBefriendLogin} onChange={e => setUserToBefriendLogin(e.target.value)}/>
                    <input className="input grow" placeholder="Enter friendship code" 
                        value={friendshipCode} onChange={e => setFriendshipCode(e.target.value)}/>
                    <button className="button-primary" type="submit">Add friend</button>
                </form>
            </div>
            {/* Friends */}
            <div className="v-stack overflow-y-auto surface-sunken grow contain-size">
                {
                    friendsQuery.isSuccess 
                        ?
                        friendsQuery.data.friends.sort((f1, f2) => f1.login.localeCompare(f2.login)).map((f, n) => <FriendListItem key={n} {...f}/>)
                        :
                        friendsQuery.isError
                            ?
                            friendsQuery.error.name
                            :
                            friendsQuery.status
                    
                }
            </div>
        </div>
    )

}