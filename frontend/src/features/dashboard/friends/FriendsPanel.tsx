import type { PanelProps } from "@/components/panel/Panel";
import FriendsList from "./FriendsList";
import Panel from "@/components/panel/Panel";






export default function FriendsPanel(props: PanelProps) {
    return (
        <Panel {...props}>
            <FriendsList/>
        </Panel>

    )
}