

import FriendListElement from "./FriendsListElement";
import type { PanelElementProps } from "@/components/panel/PanelElement";
import PanelElement from "@/components/panel/PanelElement";
import { useFriendsQuery } from "@/backend-integration/domains/friends/friends-queries";






export default function FriendList(props: PanelElementProps) {
    const query = useFriendsQuery()

    return (
        <PanelElement variant="container" {...props}>
            {
                query.isLoading ?
                "Loading..."
                :
                query.isError ?
                "Error: " + query.error
                :
                query.isSuccess ?
                query.data.friends!.map((friend) => {
                    return (
                        <FriendListElement user={friend}/>
                    )
                })
                :
                "What the frick?"
                
            }
        </PanelElement>

    )
}