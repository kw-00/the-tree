
export interface IChunkifier<T> {
    /**
     * Returns the number of chunks.
     */
    chunkCount(): number

    /**
     * Returns the maximum size of each chunk configured for the Chunkifier.
     */
    chunkSize(): number

    /**
     * Returns the size of the data in all chunks, total.
     */
    totalSize(): number

    /**
     * Returns data from all chunks as a list.
     */
    getData(): T[]

    /**
     * Appends data to the chunkifier, creating new chunks when needed.
     */
    appendData(...data: T[]): void

    /**
     * Prepends data to the chunkifier, creating new chunks when needed.
     */
    prependData(...data: T[]): void

    /**
     * Removes a given number of trailing data points from the chunkifier, reorganizing chunks as needed.
     */
    popData(count: number): void


    /**
     * Removes a given number of leading data points form the chunkifier, reorganizing chunks as needed.
     */
    shiftData(count: number): void

    /**
     * Removes the last chunk.
     */
    pop(): void

    /**
     * Removes the first chunk.
     */
    shift(): void

    /**
     * Returns the chunk at a given index. Negative numbers are treated as
     * reverse indexation.
     */
    getChunkByOffset(offset: number): T[] | undefined

    /**
     * Returns a chunk at a given index.
     */
    getChunk(index: number): T[] | undefined  
}

export class Chunkifier<T> implements IChunkifier<T> {
    _chunks: T[][]
    #chunkSize: number

    constructor(data: T[], chunkSize: number) {
        this.#chunkSize = chunkSize
        this._chunks = this.#chunkify(data)
    }

    chunkCount(): number {
        return this._chunks.length
    }

    chunkSize(): number {
        return this.#chunkSize
    }

    totalSize(): number {
        let size = 0
        for (let i = 0; i < this.chunkCount(); i++) {
            size += this.getChunk(i)!.length
        }
        return size
    }

    getData(): T[] {
        const data = []
        for (let i = 0; i < this.chunkCount(); i++) {
            data.push(...this.getChunk(i)!)
        }
        return data
    }

    appendData(...data: T[]): void {
        const lastChunk = this.getChunkByOffset(-1)
        if (lastChunk) {
            const remainingSpaceInChunk = this.#chunkSize - lastChunk.length
            lastChunk.push(...data.splice(0, remainingSpaceInChunk))
        }
        this._chunks.push(...this.#chunkify(data))
    }

    prependData(...data: T[]): void {
        const firstChunk = this.getChunk(0)
        if (firstChunk) {
            const remainingSpaceInChunk = this.#chunkSize - firstChunk.length
            if (remainingSpaceInChunk > 0) {
                firstChunk.unshift(...data.splice(-remainingSpaceInChunk))
            }
        }
        this._chunks.unshift(...this.#chunkify(data))
    }

    popData(count: number): void {
        while (true) {
            const lastChunk = this.getChunkByOffset(-1)
            if (!lastChunk) return
            if (count >= lastChunk.length) {
                count -= lastChunk.length
                this.pop()
            } else {
                lastChunk.splice(lastChunk.length - count)
                return
            }
        }
    }

    shiftData(count: number): void {
        while (true) {
            const firstChunk = this.getChunk(0)
            if (!firstChunk) return

            if (count >= firstChunk.length) {
                count -= firstChunk.length
                this.shift()
            } else {
                firstChunk.splice(0, count)
                return
            }
        }
    }

    pop(): void {
        this._chunks.pop()
    }

    shift(): void {
        this._chunks.shift()
    }

    getChunkByOffset(offset: number): T[] | undefined {
        if (offset < 0) offset = this._chunks.length + offset
        const result = this._chunks[offset]
        return result
    }

    getChunk(index: number): T[] | undefined {
        return this._chunks[index]
    }

    #chunkify(data: T[]): T[][] {
        const chunks = []
        let chunkStart = 0
        while (true) {
            const chunkEnd = chunkStart + this.#chunkSize
            const chunk = data.slice(chunkStart, chunkEnd)
            chunks.push(chunk)
            
            if (chunkEnd > data.length) break
            chunkStart = chunkEnd
        }
        return chunks
    }
}

export class MergingChunkifier<T> extends Chunkifier<T> {
    override appendData(...data: T[]): void {
        this.#splitOvergrownLastChunk()
        super.appendData(...data)
        this.#mergeIncompleteLastChunk()
    }

    override prependData(...data: T[]): void {
        this.#splitOvergrownFirstChunk()
        super.prependData(...data) 
        this.#mergeIncompleteFirstChunk()
    }

    override popData(count: number): void {
        super.popData(count)
        this.#mergeIncompleteLastChunk()
    }

    override shiftData(count: number): void {
        super.shiftData(count)
        this.#mergeIncompleteFirstChunk()
    }


    #mergeIncompleteLastChunk(): void {
        const lastChunk = this.getChunkByOffset(-1)
        const penultimateChunk = this.getChunkByOffset(-2) 
        if (lastChunk && penultimateChunk && lastChunk.length < this.chunkSize()) {
            this.pop()
            this.pop()
            this._chunks.push([...penultimateChunk, ...lastChunk])
        }
    }

    #mergeIncompleteFirstChunk(): void {
        const firstChunk = this.getChunk(0)
        const secondChunk = this.getChunk(1)
        if (firstChunk && secondChunk && firstChunk.length < this.chunkSize()) {
            this.shift()
            this.shift()
            this._chunks.push([...firstChunk, ...secondChunk])
        }

    }

    #splitOvergrownLastChunk(): void {
        const lastChunk = this.getChunkByOffset(-1)
        if (lastChunk && lastChunk.length > this.chunkSize()) {
            const newLastChunk = lastChunk.splice(this.chunkSize())
            this._chunks.push(newLastChunk)
        }
    }

    #splitOvergrownFirstChunk(): void {
        const firstChunk = this.getChunk(0)
        if (firstChunk && firstChunk.length > this.chunkSize()) {
            const newFirstChunk = firstChunk.splice(0, firstChunk.length - this.chunkSize())
            this._chunks.unshift(newFirstChunk)
        }
    }
}

export interface IChunkifierWrapper<T> {
    /**
     * Returns the underlying chunkifier.
     */
    getChunkifier(): IChunkifier<T>
}

export interface IChunkifierCursor<T> {

    /**
     * Moves cursor a set number of steps. Always stops at the chunkifiers first or last chunk.
     * 
     * Returns `false` if the cursor did not move, `true` otherwise.
     */
    move(steps?: number): boolean

    /**
     * Moves cursor a set number of steps. If value is out of bounds, it is brought to the nearest chunk.
     * 
     * Returns `false` if the cursor did not move, `true` otherwise.
     */
    setCursor(value: number): boolean

    /**
     * Anchors cursor the the start of chunkifier. For example, `-1` becomes `chunkCount() - 1`.
     * Positive cursor values are unaffected.
     */
    anchorStart(): void

    /**
     * Anchors cursor the the start of chunkifier. For example, `chunkCount() - 1` becomes `-1`. 
     * Negative cursor values are unaffected.
     */
    anchorEnd(): void

    /**
     * Returns the chunk under the current cursor. If there are no chunks, returns `undefined`.
     */
    getChunkUnderCursor(): T[] | undefined

    /**
     * Returns `true` if there are no chunks, `false` otherwise.
     */
    noChunks(): boolean

    /**
     * Returns `true` if cursor is on last chunk or there are no chunks, `false` otherwise.
     */
    lastChunkReached(): boolean

    /**
     * Returns true  if cursor is on firstChunk or there are no chunks, `false` otherwise.
     */
    firstChunkReached(): boolean
}

export class ChunkifierCursor<T> implements IChunkifierCursor<T>, IChunkifierWrapper<T> {
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

export class SuperChunkifierCursor<T> implements IChunkifierCursor<T[]>, IChunkifierWrapper<T> {
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

