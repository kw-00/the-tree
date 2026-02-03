import { useForceUpdate } from "@/app/hooks/ForceUpdate"
import { useEffect, useRef, useState, type ReactElement } from "react"



export type FlexibleVirtualListCacheInit<ElementProps> = {
    initialElementProps: ElementProps[]
    estimatedElementHeight: number
    initialScrollTop?: number
}

export class FlexibleVirtualListData<ElementProps> {
    elementProps: ElementProps[]
    heightCache: number[]
    scrollTop: number

    constructor({
            elementProps, 
            heightCache, 
            scrollTop
        }: {
            elementProps: ElementProps[], 
            heightCache: number[], 
            scrollTop?: number
        }) {
        this.elementProps = elementProps
        this.heightCache = heightCache
        this.scrollTop = scrollTop ?? 0
    }

    calculatePosition(index?: number) {
        return this.heightCache.slice(0, index).reduce((prev, next) => prev + next, 0)
    }

    calculateIndex(position: number) {
        let index = 0
        while (index < this.elementProps.length) {
            position -= this.heightCache[index++]
            if (position < 0) {
                break
            }
        }
        return index
    }
}

export function useFlexibleVirtualListCache<ElementProps>(
        {initialElementProps, estimatedElementHeight, initialScrollTop}: FlexibleVirtualListCacheInit<ElementProps>
    ) {

    const [data, setData] = useState<FlexibleVirtualListData<ElementProps>>(new FlexibleVirtualListData({
        elementProps: initialElementProps, 
        heightCache: new Array(initialElementProps.length).fill(estimatedElementHeight),
        scrollTop: initialScrollTop
    }))

    const prependElements = (...props: ElementProps[]) => {
        const newData = new FlexibleVirtualListData({
            elementProps: [...props, ...data.elementProps],
            heightCache: [...new Array(props.length).fill(estimatedElementHeight), ...data.heightCache],
            scrollTop: data.scrollTop
        })
        setData(newData)
    }

    const appendElements = (...props: ElementProps[]) => {
        const newData = new FlexibleVirtualListData({
            elementProps: [...data.elementProps, ...props],
            heightCache: [...data.heightCache, ...new Array(props.length).fill(estimatedElementHeight)],
            scrollTop: data.scrollTop
        })
        setData(newData)
    }

    return {
        data,
        prependElements,
        appendElements
    }
}

export type FlexibleVirtualListProps<ElementProps> = {
    data: FlexibleVirtualListData<ElementProps>
    elementFactory: (props: ElementProps) => ReactElement
}

const elementDataTag = `[data-virtual-list-element="true"]`

export function FlexibleVirtualList<ElementProps>(
        {data, elementFactory}: FlexibleVirtualListProps<ElementProps>
    ) {

    const forceUpdate = useForceUpdate()

    const containerRef = useRef<HTMLDivElement | null>(null)
    const container = containerRef.current

    const firstIndexRef = useRef<number | null>(null)
    const lastIndexRef = useRef<number | null>(null)
    const firstIndex = firstIndexRef.current
    const lastIndex = lastIndexRef.current

    // Update height cache
    if (firstIndex && lastIndex && container) {
        const elementsShown = container.querySelectorAll(elementDataTag)
        for (let i = firstIndex; i < lastIndex; i++) {
            const element = elementsShown[i]
            if (element instanceof HTMLElement) {
                data.heightCache[i] = element.scrollHeight
            }
        }
    }

    // Determine visible elements
    firstIndexRef.current = data.calculateIndex(data.scrollTop)
    lastIndexRef.current = data.calculateIndex(data.scrollTop + (containerRef.current?.clientHeight ?? 0))
    const newFirstIndex = firstIndexRef.current
    const newLastIndex = lastIndexRef.current
    console.log(newFirstIndex)
    console.log(newLastIndex)
    console.log(containerRef.current?.clientHeight)

    const elementProps = data.elementProps.slice(newFirstIndex, newLastIndex)
    // Determine top/bottom padding height
    const heightAbove = data.calculatePosition(newFirstIndex)
    const heightBelow = data.calculatePosition() - data.calculatePosition(newLastIndex)

    if (container) data.scrollTop = container.scrollTop





    return (
        <div ref={containerRef} className="overflow-y-scroll" onScroll={() => forceUpdate()}>
            <div data-virtual-list-element="true" style={{height: `${heightAbove}px`}}></div>
            {elementProps.map(props => elementFactory(props))}
            <div style={{height: `${heightBelow}px`}}></div>
        </div>
    )
}