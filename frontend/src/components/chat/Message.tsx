import { Flex, Text, type FlexProps } from "@chakra-ui/react"


interface MessageProps {
    senderLogin: string
    content: string
}

export default function Message({senderLogin, content, ...rest}: MessageProps & FlexProps) {

    return (
        <Flex flexDir="column" justifyContent="space-between"  borderTopWidth="thin" borderBottomWidth="thin"{...rest}>
            <Text fontWeight="semibold">{senderLogin}:</Text>
            <Text pt="1" ps="1">{content}</Text>
        </Flex>
    )
}