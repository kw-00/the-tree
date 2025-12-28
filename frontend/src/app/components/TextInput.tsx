import { useEffect, useRef, useState } from "react"
import TextEditor from "./_internal/TextEditor"
import { twMerge } from "tailwind-merge"
import { useTheme } from "../theme/theme"

const styling = {
    base: "my-1 appearance-none rounded-xs h-full overflow-y-auto bg-(--input-bg)",
    theme: {
        dark: "border-1 border-white/30 focus:ring-2 focus:ring-white/30",
        light: "border-1 border-black/30 focus:ring-2 focus:ring-black/30"
    }
}

export type TextInputProps = {
    maxHeight: number
    minHeight?: number
    className?: string
    style?: React.CSSProperties
    onChange?: (text: string) => void
}

export default function TextInput({maxHeight, minHeight, className, style, onChange}: TextInputProps) {
    const {theme} = useTheme()
    const classes = twMerge(styling.base, styling.theme[theme], className)
    // Growth logic
    const [scrollTop, setScrollTop] = useState<number | null>(null)
    const selfRef = useRef<HTMLDivElement | null>(null)
    const adjustHeight = () => {
        if (selfRef.current) {
            // Set height
            const self = selfRef.current
            self.style.height = "auto"
            const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
            self.style.height = `${Math.max(
                Math.min(self.scrollHeight + 2, maxHeight * rem),
                (minHeight ?? 1) * rem
            )}px`

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