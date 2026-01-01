

export function getRem() {
    return Number(getComputedStyle(document.documentElement).fontSize.match(/\d+/)?.at(0))
}