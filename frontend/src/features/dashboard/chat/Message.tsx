import { Card, Heading, Text, type CardRootProps } from "@chakra-ui/react"


interface MessageProps {
    userId: number
    userLogin: string
    content: string
}

export default function Message({userLogin, content, ...rest}: MessageProps & CardRootProps) {
    return (
        <Card.Root {...rest}>
            <Card.Header>
                <Heading>{userLogin}</Heading>
            </Card.Header>
            <Card.Body>
                <Text pl="2">{content}</Text>
            </Card.Body>
        </Card.Root>
    )
}