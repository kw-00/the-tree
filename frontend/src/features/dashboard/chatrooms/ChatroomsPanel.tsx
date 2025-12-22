import Panel, { type PanelProps } from "@/components/panel/Panel";
import ChatroomsList from "./ChatroomsList";
import CreateChatroomForm from "./CreateChatroomForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createChatroom } from "@/backend-integration/domains/chatrooms/chatrooms-queries";






export default function ChatroomsPanel(props: PanelProps ) {
    const queryClient = useQueryClient()
    const createChatroomMutation = useMutation(createChatroom)
    return (
        <Panel layout="vstack" {...props}>
            <ChatroomsList/>
            <CreateChatroomForm handleSubmit={async (name) => {
                await createChatroomMutation.mutateAsync({chatroomName: name})
                queryClient.invalidateQueries({queryKey: ["chatrooms"], exact: true})
            }}/>
        </Panel>
    )
}