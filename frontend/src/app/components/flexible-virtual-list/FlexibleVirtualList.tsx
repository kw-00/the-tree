import { useEffect, useRef, useState, type ReactElement } from "react"



export type FlexibleVirtualListCacheInit<ElementProps> = {
    initialElementProps: ElementProps[]
    estimatedElementHeight: number
}

export type FlexibleVirtualListData<ElementProps> = {
    elementProps: ElementProps[]
    heightCache: number[]
}



export function useFlexibleVirtualListCache<ElementProps>(
        {initialElementProps, estimatedElementHeight}: FlexibleVirtualListCacheInit<ElementProps>
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

    const calculatePosition = (index: number) => {
        return data.heightCache.slice(0, index).reduce((prev, next) => prev + next, 0)
    }

    const calculateIndex = (position: number) => {
        let index = 0
        while (true) {
            position -= data.heightCache[index]
            if (position < 0) {
                return index
            }
        }
    }

    return {
        data,
        prependElements,
        appendElements,
        calculatePosition,
        calculateIndex
    }
}

export type FlexibleVirtualListProps<ElementProps> = {
    data: FlexibleVirtualListData<ElementProps>
    elementFactory: (props: ElementProps) => ReactElement
}

export function FlexibleVirtualList<ElementProps>(
        {data, elementFactory}: FlexibleVirtualListProps<ElementProps>
    ) {
    const containerRef = useRef<HTMLDivElement | null>(null)


    return (
        <div ref={containerRef}>

        </div>
    )
}