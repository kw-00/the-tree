

import FriendListElement from "./FriendsListElement";
import type { PanelElementProps } from "@/components/panel/PanelElement";
import PanelElement from "@/components/panel/PanelElement";
import { getFriends } from "@/backend-integration/domains/friends/friends-queries";
import { useInfiniteQuery } from "@tanstack/react-query";






export default function FriendList(props: PanelElementProps) {

    const getFriendsQuery = useInfiniteQuery(getFriends(undefined))

    return (
        <PanelElement variant="container" {...props}>
            {
                getFriendsQuery.isLoading ?
                "Loading..."
                :
                getFriendsQuery.isError ?
                "Error: " + getFriendsQuery.error
                :
                getFriendsQuery.isSuccess ?
                getFriendsQuery.data.pages.flatMap(page => page.friendsData).map((friend) => {
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