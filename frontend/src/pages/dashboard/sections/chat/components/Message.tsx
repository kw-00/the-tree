
interface MessageProps {
    content: string
}

export default function Message({content}: MessageProps) {

    return (
        <p>{content}</p>
    )
}