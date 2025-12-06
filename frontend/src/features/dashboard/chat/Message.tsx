import PanelElement from "@/components/panel/PanelElement"
import { Heading, Text, type BoxProps } from "@chakra-ui/react"


interface MessageProps {
    userId: number
    userLogin: string
    content: string
}

export default function Message({userLogin, content, ...rest}: MessageProps & BoxProps) {
    return (
        <PanelElement {...rest}>
            <Heading>{userLogin}</Heading>
            <Text>{content}</Text>
        </PanelElement>
    )
}