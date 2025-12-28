import { useEffect, useRef, useState } from "react"
import TextEditor from "./_internal/TextEditor"
import { twMerge } from "tailwind-merge"
import { useTheme } from "../theme/theme"

const styling = {
    base: `
        my-1 appearance-none rounded-xs max-h-full min-h-1 overflow-y-auto bg-(--input-bg)
        border-1 border-(--input-border) focus:ring-2 focus:ring-(--input-border)
    `
}

export type TextInputProps = {
    className?: string
    style?: React.CSSProperties
    onChange?: (text: string) => void
}

export default function TextInput({className, style, onChange}: TextInputProps) {
    const classes = twMerge(styling.base, className)
    // Growth logic
    const [scrollTop, setScrollTop] = useState<number | null>(null)
    const selfRef = useRef<HTMLDivElement | null>(null)
    const adjustHeight = () => {
        if (selfRef.current) {
            // Set height
            const self = selfRef.current
            self.style.height = "auto"
            const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
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
        className={classes}
        style={{outline: "none", ...style}}
        placeholder="Type something..."
        />
    )
}