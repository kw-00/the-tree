import { type IChunkifier } from "../types/chunkifiers"
import type { IChunkifierCursor, ISuperChunkifierCursor } from "../types/cursors-i"


export class ChunkifierCursor<T> implements IChunkifierCursor<T> {
    #chunkifier: IChunkifier<T>
    #cursor: number

    constructor(chunkifier: IChunkifier<T>, initialCursor: number) {
        this.#chunkifier = chunkifier
        this.#cursor = initialCursor
    }

    // Implementing IChunkifierWrapper
    getChunkifier(): IChunkifier<T> {
        return this.#chunkifier
    }

    // Implementing IChunkifierCursor
    move(steps?: number): boolean {
        this.#moveCursorIntoBounds()
        steps = steps ?? 1
        if (this.#cursor < 0) {
            steps = -steps
        }

        const oldCursor = this.#cursor
        this.#cursor += steps
        this.#moveCursorIntoBounds()

        return !(this.#cursor === oldCursor)
    }
    
    setCursor(value: number): boolean {
        this.#moveCursorIntoBounds()
        const oldCursor = this.#cursor
        this.#cursor = value
        this.#moveCursorIntoBounds()

        return  !(this.#cursor === oldCursor)
    }

    anchorStart(): void {
        this.#moveCursorIntoBounds()
        if (this.#cursor < 0) {
            this.#cursor += this.#chunkifier.chunkCount()
        }
    }

    anchorEnd(): void {
        this.#moveCursorIntoBounds()
        if (this.#cursor >= 0) {
            this.#cursor -= this.#chunkifier.chunkCount()
        }
    }

    getChunkUnderCursor(): T[] | undefined {
        this.#moveCursorIntoBounds()
        return this.#chunkifier.getChunkByOffset(this.#cursor)
    }

    noChunks() {
        return this.#chunkifier.chunkCount() === 0
    }

    lastChunkReached() {
        if (this.noChunks()) return true
        this.#moveCursorIntoBounds()
        if (this.#cursor === -1 || this.#cursor === this.#chunkifier.chunkCount() - 1) {
            return true
        }
        return false
    }

    firstChunkReached() {
        if (this.noChunks()) return true
        this.#moveCursorIntoBounds()
        if (this.#cursor === 0 || this.#cursor === -this.#chunkifier.chunkCount()) {
            return true
        }
        return false
    }


    #moveCursorIntoBounds(): void {
        if (this.#cursor === -1 || this.#cursor === 0) {
            return
        }

        const lowerBound = -this.#chunkifier.chunkCount() 
        const upperBound = this.#chunkifier.chunkCount() - 1

        if (this.#cursor < lowerBound) {
            this.#cursor = lowerBound
        } else if (this.#cursor > upperBound) {
            this.#cursor = upperBound
        }
    }
}

export class SuperChunkifierCursor<T> implements ISuperChunkifierCursor<T> {
    #chunkifier: IChunkifier<T>
    #superChunkSize: number
    #cursor: number


    
    constructor(chunkifier: IChunkifier<T>, initialCursor: number, superChunkSize: number) {
        this.#chunkifier = chunkifier
        this.#cursor = initialCursor
        this.#superChunkSize = superChunkSize
    }

    // Implementing IChunkifierWrapper
    getChunkifier(): IChunkifier<T> {
        return this.#chunkifier
    }
    
    // Implementing IChunkifierCursor
    move(steps?: number): boolean {
        this.#moveCursonIntoBounds()
        steps = steps ?? 1
        if (this.#cursor < 0) {
            steps = -steps
        }

        const oldCursor = this.#cursor
        this.#cursor += steps
        this.#moveCursonIntoBounds()

        return !(this.#cursor === oldCursor)
    }

    setCursor(value: number): boolean {
        this.#moveCursonIntoBounds()
        const oldCursor = this.#cursor
        this.#cursor = value
        this.#moveCursonIntoBounds()

        return !(this.#cursor === oldCursor)
    }

    anchorStart(): void {
        this.#moveCursonIntoBounds()
        if (this.#cursor < 0) {
            this.#cursor += this.#superChunkCount()
        }
    }

    anchorEnd(): void {
        this.#moveCursonIntoBounds()
        if (this.#cursor >= 0) {
            this.#cursor -= this.#superChunkCount() 
        }
    }

    getChunkUnderCursor(): T[][] | undefined {
        this.#moveCursonIntoBounds()
        if (this.noChunks()) return undefined
        const result: T[][] = []
        if (this.#cursor >= 0) {
            for (let i = 0; i < this.#superChunkSize && i < this.getChunkifier().chunkCount(); i++) {
                // Constrains on the cursor and i allow us the assertion below
                result.push(this.getChunkifier().getChunk(this.#cursor + i)!)
            }
        } else {
            for (let i = 0; i < this.#superChunkSize && i < this.getChunkifier().chunkCount(); i++) {
                const offset = -1 - i
                // Constrains on the cursor and i allow us the assertion below
                result.push(this.getChunkifier().getChunkByOffset(offset)!)
            }
        }
        return result
    }

    noChunks(): boolean {
        return this.getChunkifier().chunkCount() === 0
    }

    lastChunkReached(): boolean {
        this.#moveCursonIntoBounds()
        if (this.getChunkifier().chunkCount() <= this.#superChunkSize) {
            return true
        }

        if (this.#cursor >= 0) {
            return this.#cursor === this.#superChunkCount() - 1
        } else {
            return this.#cursor === -this.#superChunkSize
        }
    }

    firstChunkReached(): boolean {
        this.#moveCursonIntoBounds()
        if (this.getChunkifier().chunkCount() <= this.#superChunkSize) {
            return true
        }

        if (this.#cursor >= 0) {
            return this.#cursor === 0
        } else {
            return this.#cursor === -this.#superChunkCount()
        }
    }

    #superChunkCount(): number {
        return Math.max(this.getChunkifier().chunkCount() - this.#superChunkSize + 1, 0)
    }

    #moveCursonIntoBounds() {
        if (this.#cursor === 0 || this.#cursor === -1) return

        const lowerBound = -this.#superChunkCount()
        const upperBound = this.#superChunkCount() - 1

        if (this.#cursor < lowerBound) {
            this.#cursor = lowerBound
        } else if (this.#cursor > upperBound) {
            this.#cursor = upperBound
        }
    }
}

