import Panel, { type PanelProps } from "@/components/panel/Panel";
import ChatroomsList from "./ChatroomsList";
import CreateChatroomForm from "./CreateChatroomForm";






export default function ChatroomsPanel(props: PanelProps ) {
    return (
        <Panel layout="vstack" {...props}>
            <ChatroomsList/>
            <CreateChatroomForm/>
        </Panel>
    )
}