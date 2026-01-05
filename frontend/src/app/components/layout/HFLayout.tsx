import { getRem } from "@/utils/document-utils"
import React, { useLayoutEffect, useRef } from "react"

export type HeaderFooterLayoutProps = {
    headerGap?: number
    footerGap?: number
} & Omit<React.HTMLAttributes<HTMLDivElement>, "style">

export default function HFLayout({headerGap, footerGap, ...rest}: HeaderFooterLayoutProps) {
    const selfRef = useRef<HTMLDivElement | null>(null)

    const setBoundaries = (el: HTMLElement, targetIs: "header" | "footer") => {
        if (selfRef.current) {
            const self = selfRef.current
            const rect = self.getBoundingClientRect()

            // Anchor the header/footer correctly, so that it is placed
            // correctly within parent rect
            el.style.left = `${rect.left}px`
            el.style.right = `${window.innerWidth - rect.right}px`
            if (targetIs === "header") {
                el.style.top = `${rect.top}px`
            } else {
                el.style.bottom = `${window.innerHeight - rect.bottom}px`
            }
        }
    }

    useLayoutEffect(() => {
        if (selfRef.current) {
            const self = selfRef.current
            
            const header = self.querySelector('[data-slot="header"]') ?? undefined
            const footer = self.querySelector('[data-slot="footer"]') ?? undefined
            const content = self.querySelector('[data-slot="content"]') ?? undefined

            const cleanup: (() => void)[] = []
            if (content instanceof HTMLElement) {
                if (header instanceof HTMLElement) {
                    // Set content padding in order to account for header
                    const observer = new ResizeObserver(() => {
                        content.style.paddingTop = 
                            headerGap ? 
                            `${header.clientHeight + headerGap * getRem()}px`
                            :
                            `${header.clientHeight}px`
                    })
                    observer.observe(header)

                    // Anchor header
                    const parentObserver = new ResizeObserver(() => {
                        setBoundaries(header, "header")
                    })
                    parentObserver.observe(self)


                    cleanup.push(() => {
                        observer.disconnect()
                        parentObserver.disconnect()
                    })
                } 
                if (footer instanceof HTMLElement) {
                    // Set content padding to account for footer
                    const observer = new ResizeObserver(() => {
                        content.style.paddingBottom = 
                            footerGap ? 
                            `${footer.clientHeight + footerGap * getRem()}px`
                            :
                            `${footer.clientHeight}px`
                        })
                    observer.observe(footer)

                    // Anchor footer
                    const parentObserver = new ResizeObserver(() => {
                        setBoundaries(footer, "footer")
                    })
                    parentObserver.observe(self)


                    cleanup.push(() => {
                        observer.disconnect()
                        parentObserver.disconnect()
                    })
                } 
            }
            return () => cleanup.forEach(f => f())
        }
    }, [])

    return (
        <div 
            ref={selfRef} 
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "stretch",
                alignItems: "stretch"
            }}
            {...rest}
        />
    )
}

HFLayout.Header = function Header(props: Omit<React.HTMLAttributes<HTMLDivElement>, "style">) {
    return (
        <div data-slot="header" 
        style={{
            position: "fixed",
        }} 
        {...props}/>
    )
}

HFLayout.Footer = function Footer(props: Omit<React.HTMLAttributes<HTMLDivElement>, "style">) {
    return (
        <div data-slot="footer" 
        style={{
            position: "fixed",
            bottom: 0
        }} 
        {...props}/>
    )
}

HFLayout.Content = function Content(props: Omit<React.HTMLAttributes<HTMLDivElement>, "style">) {
    return (
        <div data-slot="content" 
        style={{
            flexGrow: 1,
            minHeight: 0
        }}
        {...props}/>
    )
}