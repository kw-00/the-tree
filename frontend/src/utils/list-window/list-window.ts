



export class ListWindow<T> {
    source: T[]
    size: number
    step: number
    cursor: number

    constructor(source: T[], size: number, step: number, cursor: number) {
        this.source = source
        this.size = size
        this.step = step
        this.cursor = cursor
    }

    current() {
        this.#moveCursorWithinBounds()
        let cursor = this.cursor
        if (cursor < 0) cursor = this.source.length + cursor
        return this.source.slice(cursor, cursor + this.size)
    }

    hasNext() { 
        this.#moveCursorWithinBounds()
        let end
        if (this.cursor >= 0) {
            end = this.#positiveCursorEnd()
        } else {
            end = this.#negativeCursorEnd()
        }
        return this.cursor < end
    }

    hasPrevious() {
        this.#moveCursorWithinBounds()
        let start
        if (this.cursor >= 0) {
            start = this.#positiveCursorStart()
        } else {
            start = this.#negativeCursorStart()
        }
        return this.cursor > start
    }

    moveNext() {
        this.#moveCursorWithinBounds()
        const prevCursor = this.cursor
        this.cursor += this.step
        if (prevCursor < 0 && this.cursor >= 0) {
            this.cursor = this.#negativeCursorEnd()
        }
        this.#moveCursorWithinBounds()
    }

    movePrevious() {
        this.#moveCursorWithinBounds()
        const prevCursor = this.cursor
        this.cursor -= this.step
        if (prevCursor >= 0 && this.cursor < 0) {
            this.cursor = this.#positiveCursorStart()
        }
        this.#moveCursorWithinBounds()
    }

    anchorStart() {
        this.#moveCursorWithinBounds()
        if (this.cursor < 0) {
            if (this.source.length === 0) {
                this.cursor = 0
            } else {
                this.cursor = this.source.length + this.cursor
            }
        }
    }

    anchorEnd() {
        this.#moveCursorWithinBounds()
        if (this.cursor >= 0) {
            if (this.source.length === 0) {
                this.cursor = -1
            } else {
                this.cursor = this.cursor - this.source.length
            }
        }
    }

    #positiveCursorEnd() {
        return Math.max(this.size, this.source.length) - this.size
    }

    #positiveCursorStart() {
        return 0
    }

    #negativeCursorEnd() {
        return -this.size
    }

    #negativeCursorStart() {
        return -this.source.length
    }

    #moveCursorWithinBounds() {
        if (this.cursor >= 0) {
            const end = this.#positiveCursorEnd()
            if (this.cursor > end) {
                this.cursor = end
            }
        } else {
            const end = this.#negativeCursorEnd()
            if (this.cursor > end) {
                this.cursor = end
                return
            }
            const start = this.#negativeCursorStart()
            if (this.cursor < start) {
                this.cursor = start
                return
            }
        }
    }
}