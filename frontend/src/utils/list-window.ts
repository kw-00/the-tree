



export class ListWindow<T> {
    source: T[]
    size: number
    offset: number
    cursor: number

    constructor(source: T[], size: number, offset: number, cursor: number) {
        this.source = source
        this.size = size
        this.offset = offset
        this.cursor = cursor
    }

    current() {
        if (this.cursor >= 0) {
            return this.source.slice(this.cursor, this.cursor + this.size)
        } else {
            return this.source.slice(this.cursor, this.cursor - this.size)
        }
    }

    moveNext() {
        const prevCursor = this.cursor
        this.cursor += this.size
        if (prevCursor < 0 && this.cursor >= 0) {
            this.cursor = -1
        }
        this.#moveCursorWithinBounds()
    }

    movePrevious() {
        const prevCursor = this.cursor
        this.cursor -= this.size
        if (prevCursor >= 0 && this.cursor < 0) {
            this.cursor = 0
        }
        this.#moveCursorWithinBounds()
    }

    anchorStart() {
        this.#moveCursorWithinBounds()
        if (this.cursor < 0) {
            if (this.source.length === 0) {
                this.cursor = 0
            } else {
                this.cursor = this.source.length - this.cursor
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

    #moveCursorWithinBounds() {
        if (this.source.length === 0) {
            if (this.cursor >= 0) {
                this.cursor = 0
            } else {
                this.cursor = -1
            }
        } else {
            if (this.cursor >= 0) {
                const end = this.source.length - this.size
                if (this.cursor > end) {
                    this.cursor = end
                }
            } else {
                const start = this.cursor - this.source.length + this.size
                if (this.cursor < start) {
                    this.cursor = start
                }
            }
        }
    }
}