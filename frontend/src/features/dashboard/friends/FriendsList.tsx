import { getFriends } from "@/services/tanstack-service";
import { useQuery } from "@tanstack/react-query";
import FriendListElement from "./FriendsListElement";
import type { PanelElementProps } from "@/components/panel/PanelElement";
import PanelElement from "@/components/panel/PanelElement";






export default function FriendList(props: PanelElementProps) {

    const getFriendsQuery = useQuery(getFriends({}, {}))

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
                getFriendsQuery.data.friends!.map((friend) => {
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