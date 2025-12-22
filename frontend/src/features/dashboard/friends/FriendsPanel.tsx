import type { PanelProps } from "@/components/panel/Panel";
import FriendsList from "./FriendsList";
import Panel from "@/components/panel/Panel";
import AddFriendForm from "./AddFriendForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFriend } from "@/backend-integration/domains/friends/friends-queries";
import { useEffect } from "react";






export default function FriendsPanel(props: PanelProps) {
    const queryClient = useQueryClient()
    const addFriendMutation = useMutation(addFriend)
    useEffect(() => {
        if (addFriendMutation.isSuccess) {
            queryClient.invalidateQueries({
                queryKey: ["friends"]
            })
        }
    })
    return (
        <Panel {...props}>
            <FriendsList/>
            <AddFriendForm handleSubmit={async (login, code) => addFriendMutation.mutateAsync({userToBefriendLogin: login, friendshipCode: code})}/>
        </Panel>

    )
}