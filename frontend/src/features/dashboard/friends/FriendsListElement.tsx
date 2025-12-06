import type { PanelElementProps } from "@/components/panel/PanelElement"
import PanelElement from "@/components/panel/PanelElement"




type FriendListElementProps = {
    user: {id: number, login: string}
} & PanelElementProps


export default function FriendListElement({user, ...rest}: FriendListElementProps) {
    return (
        <PanelElement {...rest}>
            {user.login}
        </PanelElement>
    )
}