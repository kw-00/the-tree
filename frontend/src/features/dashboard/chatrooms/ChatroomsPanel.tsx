import Panel, { type PanelProps } from "@/components/panel/Panel";
import CreateChatroomForm from "./CreateChatroomForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createChatroom, useChatroomQuery } from "@/backend-integration/domains/chatrooms/chatrooms-queries";
import { Collapsible, Text } from "@chakra-ui/react";
import ChatroomsListElement from "./ChatroomsListElement";
import { useChatContext } from "../ChatContext";






export default function ChatroomsPanel(props: PanelProps ) {
    const queryClient = useQueryClient()
    const createChatroomMutation = useMutation(createChatroom)
    const {setSelectedChatroomId} = useChatContext()

    // Query for fetching chatroom list
    const {isLoading, isError, isSuccess, data, error} = useChatroomQuery()

    return (
        <Panel variant="primary" layout="vstack" alignItems="stretch" {...props} overflowY="scroll" h="100vh" p={0}>
            <Collapsible.Root position="sticky" top={0}>
                <Collapsible.Trigger>
                    Trigger
                </Collapsible.Trigger>
                <Collapsible.Content>
                    <Panel variant="secondary">
                        <CreateChatroomForm 
                            handleSubmit={async (name) => {
                                await createChatroomMutation.mutateAsync({chatroomName: name})
                                queryClient.invalidateQueries({queryKey: ["chatrooms"], exact: true})
                        }}/>
                    </Panel>
                </Collapsible.Content>
            </Collapsible.Root>

            {isLoading ? <Text>Loading...</Text>
            :
            isError ? <Text>Error: {error.message}</Text>
            :
            isSuccess ? 
            data.chatroomsData?.map((chatroom, n) => {
                return <ChatroomsListElement key={n} chatroom={chatroom} onClick={() => setSelectedChatroomId(chatroom.id)}/>
            })
            :
            <Text>What the Fudge Is Happening?!</Text>
            }
        </Panel>
    )
}