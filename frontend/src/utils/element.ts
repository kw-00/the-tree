

export type ScrollState = {
    scrollTop: number
    scrollHeight: number
    clientHeight: number

    isBottom: boolean
    isNearBottom: boolean
    isNearTop: boolean
}

export function getScrollState(element: HTMLElement) {
    const distanceFromTop = element.scrollTop
    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight

    return {
        scrollTop: element.scrollTop,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
        isBottom: distanceFromBottom === 0,
        isNearBottom: distanceFromBottom < 200,
        isNearTop: distanceFromTop < 200
    } as ScrollState
}