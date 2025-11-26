import { Card, Heading, Text, type CardRootProps, type FlexProps } from "@chakra-ui/react"


interface MessageProps {
    senderLogin: string
    content: string
}

export default function Message({senderLogin, content, ...rest}: MessageProps & CardRootProps) {

    // return (
    //     <Flex flexDir="column" justifyContent="space-between"  borderTopWidth="thin" borderBottomWidth="thin"{...rest}>
    //         <Text fontWeight="semibold">{senderLogin}:</Text>
    //         <Text pt="1" ps="1">{content}</Text>
    //     </Flex>
    // )

    return (
        <Card.Root {...rest}>
            <Card.Header>
                <Heading>{senderLogin}</Heading>
            </Card.Header>
            <Card.Body>
                <Text pl="2">{content}</Text>
            </Card.Body>
        </Card.Root>
    )
}