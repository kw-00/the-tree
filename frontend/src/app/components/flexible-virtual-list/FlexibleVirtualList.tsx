import { useEffect, useRef, useState, type ReactElement } from "react"



export type FlexibleVirtualListCacheInit<ElementProps> = {
    initialElementProps: ElementProps[]
    elementFactory: (props: ElementProps) => ReactElement
    estimatedElementHeight: number
}

export type FlexibleVirtualListData<ElementProps> = {
    elementProps: ElementProps[]
    heightCache: number[]
}



export function useFlexibleVirtualListCache<ElementProps>(
        {initialElementProps, elementFactory, estimatedElementHeight}: FlexibleVirtualListCacheInit<ElementProps>
    ) {
    const [data, setData] = useState<FlexibleVirtualListData<ElementProps>>({
        elementProps: initialElementProps, 
        heightCache: new Array(initialElementProps.length).fill(estimatedElementHeight)
    })

    const prependElements = (...props: ElementProps[]) => {
        const newData = {
            elementProps: [...props, ...data.elementProps],
            heightCache: [...new Array(props.length).fill(estimatedElementHeight), ...data.heightCache]
        }
        setData(newData)
    }

    const appendElements = (...props: ElementProps[]) => {
        const newData = {
            elementProps: [...data.elementProps, ...props],
            heightCache: [...data.heightCache, ...new Array(props.length).fill(estimatedElementHeight)]
        }
        setData(newData)
    }

    return {
        data,
        prependElements,
        appendElements
    }
}

export function FlexibleVirtualList<ElementProps>(
        {data}: {data: FlexibleVirtualListData<ElementProps>}
    ) {
    const containerRef = useRef<HTMLDivElement | null>(null)


    return (
        <div ref={containerRef}>

        </div>
    )
}