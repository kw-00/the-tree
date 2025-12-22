import type { FriendshipCodeData } from "@/backend-integration/domains/friends/friends-service"
import type { PanelElementProps } from "@/components/panel/PanelElement"
import PanelElement from "@/components/panel/PanelElement"




type FriendshipCodeListElementProps = {
    friendshipCode: FriendshipCodeData
} & PanelElementProps


export default function FriendshipCodeListElement({friendshipCode, ...rest}: FriendshipCodeListElementProps) {
    return (
        <PanelElement {...rest}>
            {friendshipCode.code}
        </PanelElement>
    )
}