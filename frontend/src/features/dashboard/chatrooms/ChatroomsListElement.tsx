
import { Text, Heading, type BoxProps } from "@chakra-ui/react"
import PanelElement from "@/components/panel/PanelElement"
import type { PanelElementVariantProps } from "node_modules/@chakra-ui/react/dist/types/styled-system/generated/recipes.gen"


type ChatroomListElementProps = {
    chatroom: {id: number, name: string}
} & PanelElementVariantProps & BoxProps
function ChatroomsListElement({chatroom, ...rest}: ChatroomListElementProps) {
    return (
        <PanelElement clickable={true} {...rest}>
            <Heading>{chatroom.name}</Heading>
            <Text>Click to select conversation...</Text>
        </PanelElement>
    )
}

export default ChatroomsListElement
