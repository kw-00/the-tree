

export function getRem() {
    return Number(getComputedStyle(document.documentElement).fontSize.match(/\d+/)?.at(0))
}

/**
 * Converts values to px. 
 * Only works for:
 * - px
 * - rem
 * - vh
 * - vw
 * 
 * 
 * For others, returns undefined.
 */
export function toPxValue(value: string): number | undefined {
    const valueNoUnit = Number(value.match(/\d+/)?.at(0))
    if (isNaN(valueNoUnit)) return
    if (value.endsWith("px")) return valueNoUnit
    if (value.endsWith("rem")) {
        const rem = getComputedStyle(document.documentElement).fontSize
        return valueNoUnit * Number(rem.match(/\d+/)?.at(0))
    }
    if (value.endsWith("vw")) {
        const vw = innerWidth / 100
        return valueNoUnit * vw
    }
    if (value.endsWith("vh")) {
        const vh = innerHeight / 100
        return valueNoUnit * vh
    }
    return undefined
}
