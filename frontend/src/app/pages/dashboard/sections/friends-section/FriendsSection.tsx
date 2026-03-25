
import { useState } from "react";
import { useFriendsQuery } from "@/api/domains/friends/friends-queries";
import { addFriend }  from "@/api/domains/friends/friends-service"
import { useMutation } from "@tanstack/react-query";


export default function FriendsSection({className, ...rest}: React.HTMLAttributes<HTMLDivElement>) {
    const friendsQuery = useFriendsQuery()

    const handleAddFriendSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    }

    return (
        <div className={`v-stack ${className ?? ""}`} {...rest}>
            <div className="v-stack surface-elevated gap-xs">
                <span className="heading-3">Friends</span>
                {/* Search Bar */}
                <form onSubmit={e => e.preventDefault()} className="flex">
                    <input className="input grow"></input>
                </form>
            </div>
            {/* Friends */}
            <div className="v-stack overflow-y-auto surface-sunken grow contain-size">
                {
                    friendsQuery.isSuccess 
                        ?
                        friendsQuery.data.friends.map((f, n) => <div key={n} className="surface-item">{f.login}</div>)
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