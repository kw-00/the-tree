import { useEffect, useRef } from "react"
import TextEditor from "./_internal/TextEditor"



export type TextInputProps = {
    maxHeight: number
    minHeight?: number
    className: string
    style: React.CSSProperties
}

export default function TextInput({maxHeight, minHeight, className, style}: TextInputProps) {
    // Growth logic
    const selfRef = useRef<HTMLDivElement | null>(null)
    const adjustHeight = () => {
        if (selfRef.current) {
            const self = selfRef.current
            self.style.height = "auto"
            const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
            self.style.height = `${Math.max(
                Math.min(self.scrollHeight + 2, maxHeight * rem),
                (minHeight ?? 1) * rem
            )}px`
        }
    }
    useEffect(() => adjustHeight(), [])

    return (
        <TextEditor 
        ref={selfRef}
        onChange={(_) => {
            adjustHeight()
        }}
        className="h-full overflow-y-scroll"
        placeholder="Type something..."
        />
    )
}