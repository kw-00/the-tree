

interface MessageProps {
    senderLogin: string
    content: string
}

export default function Message({senderLogin, content}: MessageProps) {

    return (
        <p>{senderLogin + ":\n" + content}</p>
    )
}