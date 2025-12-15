import { Heading, type BoxProps } from "@chakra-ui/react"
import MessageInput from "./MessageInput"
import { useChatContext } from "@/features/dashboard/ChatContext"
import { useInfiniteQuery } from "@tanstack/react-query"
import Panel from "@/components/panel/Panel"
import PanelElement from "@/components/panel/PanelElement"
import Message from "./Message"
import { getConnectedChatrooms } from "@/backend-integration/queries/chatrooms-queries"
import { getMessages } from "@/backend-integration/queries/messages-queries"




export default function ChatPanel(props: BoxProps) {
    const {selectedChatroomId: chatroomId} = useChatContext()


    // Make queries
    const chatroomsQuery = useInfiniteQuery(getConnectedChatrooms)

    const conversationQuery = useInfiniteQuery(getMessages(chatroomId))

    return (
        <Panel variant="primary" layout="vstack" {...props}>
            <PanelElement variant="header">
                <Heading size="xl" pb="2">
                    {chatroomsQuery.isSuccess 
                    ?  chatroomsQuery.data.pages.flat().find(({id}) => id == chatroomId)?.name ?? "Loading..."
                    : "Select chat or start a new one"}
                </Heading>
            </PanelElement>
            <PanelElement flexGrow={1}>
                {
                    conversationQuery.isSuccess ?
                    conversationQuery.data.pages.flat().map(({userId, userLogin, content}) => 
                        <Message userId={userId} userLogin={userLogin} content={content} alignItems="stretch" p="2"/>)
                    :
                    <></>
                }
            </PanelElement>

            <MessageInput position="sticky" bottom={0} />
        </Panel>
    )
}