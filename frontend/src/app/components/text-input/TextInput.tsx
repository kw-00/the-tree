import "./TextInput.css"

import { useEffect, useRef, useState } from "react"
import TextEditor from "../_internal/TextEditor"
import { twMerge } from "tailwind-merge"


export type TextInputProps = {
    className?: string
    style?: React.CSSProperties
    onChange?: (text: string) => void
}

/**
 * Make sure to specify max-height through Tailwind or style, so that the TextInput
 * does not grow indefinitely instead of becoming scrollable when content expands.
 */
export default function TextInput({className, style, onChange}: TextInputProps) {
    // Growth logic
    const [scrollTop, setScrollTop] = useState<number | null>(null)
    const selfRef = useRef<HTMLDivElement | null>(null)

    const adjustHeight = () => {
        if (selfRef.current) {
            // Set height
            const self = selfRef.current
            self.style.height = "auto"
            self.style.height = `${self.scrollHeight + 2}px`

            // Set scroll height
            if (scrollTop !== null) {
                self.scrollTop = scrollTop
            }
        }
    }
    useEffect(() => adjustHeight(), [])

    return (
        <TextEditor 
        ref={selfRef}
        onChange={(text) => {
            adjustHeight()
            if (onChange) {
                onChange(text)
            }

        }}
        onScroll={() => {
            if (selfRef.current) {
                setScrollTop(selfRef.current.scrollTop)
            }
        }}
        className={twMerge("TextInput", className)}
        style={{outline: "none", ...style}}
        placeholder="Type something..."
        />
    )
}