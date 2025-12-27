import { useEffect, useRef } from "react"



export type TextInputProps = {
    maxHeight: number
    minHeight?: number
} & React.HTMLAttributes<HTMLTextAreaElement>

export default function TextInput({maxHeight, minHeight, ...rest}: TextInputProps) {
    // Growth logic
    const selfRef = useRef<HTMLTextAreaElement | null>(null)
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
    useEffect(() => {
        const resizeObserver = new ResizeObserver((_) => {
            adjustHeight()
        })
        resizeObserver.observe(selfRef.current!)
    }, [])

    return (
        <textarea ref={selfRef} onChange={adjustHeight} style={{resize: "none"}} {...rest}>

        </textarea>
    )
}