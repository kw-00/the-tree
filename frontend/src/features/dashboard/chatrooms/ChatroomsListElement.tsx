
import { Card, chakra, Heading, type CardRootProps } from "@chakra-ui/react"
import clickableRecipe from "@/recipes/Clickable"


interface ChatroomListElementProps {
    chatroom: {id: number, name: string}
}
function ChatroomsListElementBase({chatroom, ...rest}: ChatroomListElementProps & CardRootProps) {
    return (
        <Card.Root flexDir="row" alignItems="center" userSelect="none" {...rest}>
            <Card.Header py={0} px="5">
                <Heading>
                    {chatroom.name}
                </Heading>            
            </Card.Header>
            <Card.Body>
                Click to switch to this conversation.
            </Card.Body>
        </Card.Root>
    )
}

const ChatroomsListElement = chakra(ChatroomsListElementBase, clickableRecipe)
export default ChatroomsListElement
