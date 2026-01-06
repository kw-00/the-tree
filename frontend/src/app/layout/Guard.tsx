import { useEffect, useRef, type ReactNode } from "react";



type GuardProps = {
    orientation?: "vertical" | "horizontal"
    children?: ReactNode
}

export default function Guard({orientation = "vertical", children}: GuardProps) {
    const guardRef = useRef<HTMLDivElement | null>(null)
    const contentRef = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        if (!guardRef.current) {
            throw new Error("GuardRef is null.")
        }
        if (!contentRef.current) {
            throw new Error("ContentRef is null.")
        }

        const guard = guardRef.current
        const content = contentRef.current

        content.style.position = "fixed"
        const observer = new ResizeObserver(() => {
            const parentRect = guard.getBoundingClientRect()

            const top = parentRect.top
            const left = parentRect.left
            const bottom = innerHeight - parentRect.bottom
            const right = innerWidth - parentRect.right

            content.style.top = `${top}px`
            content.style.left = `${left}px`
            content.style.bottom = `${bottom}px`
            content.style.right = `${right}px`
        })
        observer.observe(guard)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={guardRef} className="flex flex-1 font-normal">
            [placeholder]
            <div ref={contentRef} className={`flex ${orientation === "vertical" ? "flex-col" : ""}`}>
                {children}
            </div>
        </div>
    )
}