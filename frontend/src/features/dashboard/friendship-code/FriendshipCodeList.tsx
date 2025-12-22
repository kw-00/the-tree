

import FriendshipCodeListElement from "./FriendshipCodeListElement";
import type { PanelElementProps } from "@/components/panel/PanelElement";
import PanelElement from "@/components/panel/PanelElement";
import { useFriendshipCodesQuery } from "@/backend-integration/domains/friends/friends-queries";






export default function FriendshipCodeList(props: PanelElementProps) {
    const query = useFriendshipCodesQuery()

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
                query.data.friendshipCodesData!.map((code) => {
                    return (
                        <FriendshipCodeListElement friendshipCode={code}/>
                    )
                })
                :
                "What the frick?"
                
            }
        </PanelElement>

    )
}