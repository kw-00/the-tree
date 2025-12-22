import type { PanelProps } from "@/components/panel/Panel";
import FriendsList from "./FriendshipCodeList";
import Panel from "@/components/panel/Panel";
import CreateFriendshipCodeForm from "./CreateFriendshipCodeForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFriendshipCode } from "@/backend-integration/domains/friends/friends-queries";
import { useEffect } from "react";






export default function FriendshipCodePanel(props: PanelProps) {
    const queryClient = useQueryClient()
    const addFriendMutation = useMutation(createFriendshipCode)
    useEffect(() => {
        if (addFriendMutation.isSuccess) {
            queryClient.invalidateQueries({
                queryKey: ["friendshipCodes"]
            })
        }
    })
    return (
        <Panel {...props}>
            <FriendsList/>
            <CreateFriendshipCodeForm handleSubmit={async (code, expiresAt) => addFriendMutation.mutateAsync({code, expiresAt})}/>
        </Panel>

    )
}