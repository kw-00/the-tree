import Panel from "@/components/panel/Panel";
import ChatroomsList from "./ChatroomsList";
import type { PanelVariantProps } from "node_modules/@chakra-ui/react/dist/types/styled-system/generated/recipes.gen";






export default function ChatroomsPanel(props: PanelVariantProps) {
    return (
        <Panel layout="vstack" {...props}>
            <ChatroomsList/>
        </Panel>
    )
}