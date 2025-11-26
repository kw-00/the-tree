
import type { User } from "@/types/data-types"
import { Card, chakra, Heading, type CardRootProps } from "@chakra-ui/react"
import clickableRecipe from "@/recipes/Clickable"


interface ChatListElementProps {
    recipient: User
    isSelected: boolean
}
function ChatListElementBase({recipient, isSelected, ...rest}: ChatListElementProps & CardRootProps) {
    return (
        <Card.Root flexDir="row" alignItems="center" userSelect="none" {...rest}>
            <Card.Header py={0} px="5">
                <Heading>
                    {recipient.login}
                </Heading>            
            </Card.Header>
            <Card.Body>
                Click to switch to this conversation.
            </Card.Body>
        </Card.Root>
    )
}

const ChatListElement = chakra(ChatListElementBase, clickableRecipe)
export default ChatListElement
