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

        let fitPending = {status: false}
        const fitContentToGuard = () => {
            if (!fitPending.status) {
                window.requestAnimationFrame(() => {
                    const parentRect = guard.getBoundingClientRect()

                    const top = parentRect.top
                    const left = parentRect.left
                    const bottom = innerHeight - parentRect.bottom
                    const right = innerWidth - parentRect.right

                    content.style.top = `${top}px`
                    content.style.left = `${left}px`
                    content.style.bottom = `${bottom}px`
                    content.style.right = `${right}px`
                    fitPending.status = false
                })
                fitPending.status = true
            }
        }

        // Remove content from document flow
        content.style.position = "fixed"

        // Fit content to guard, making it seem to participate in flow while
        // strictly respecting parent size
        const resizeObserver = new ResizeObserver(fitContentToGuard)
        resizeObserver.observe(guard)
        const muationObserver = new MutationObserver(fitContentToGuard)
        muationObserver.observe(document.documentElement, {childList: true, subtree: true})
        addEventListener("resize", fitContentToGuard)
        return () => {
            resizeObserver.disconnect()
            muationObserver.disconnect()
            removeEventListener("resize", fitContentToGuard)
        }
    }, [])

    return (
        <div ref={guardRef} className="flex flex-1">
            .
            <div ref={contentRef} className={`flex ${orientation === "vertical" ? "flex-col" : ""}`}>
                {children}
            </div>
        </div>
    )
}