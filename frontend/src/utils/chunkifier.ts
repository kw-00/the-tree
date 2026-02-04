
export interface IChunkifier<T> {
    /**
     * Returns the number of chunks.
     */
    chunkCount(): number

    /**
     * Returns the maximum size of each chunk configured for the Chunkifier.
     */
    chunkSize(): number

    totalSize(): number

    getData(): T[]

    appendData(...data: T[]): void

    prependData(...data: T[]): void

    popData(count: number): void

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

    chunkCount() {
        return this._chunks.length
    }

    chunkSize() {
        return this.#chunkSize
    }

    totalSize() {
        let size = 0
        for (let i = 0; i < this.chunkCount(); i++) {
            size += this.getChunk(i)!.length
        }
        return size
    }

    getData() {
        const data = []
        for (let i = 0; i < this.chunkCount(); i++) {
            data.push(...this.getChunk(i)!)
        }
        return data
    }

    appendData(...data: T[]) {
        const lastChunk = this.getChunkByOffset(-1)
        if (lastChunk) {
            const remainingSpaceInChunk = this.#chunkSize - lastChunk.length
            lastChunk.push(...data.splice(0, remainingSpaceInChunk))
        }
        this._chunks.push(...this.#chunkify(data))
    }

    prependData(...data: T[]) {
        const firstChunk = this.getChunk(0)
        if (firstChunk) {
            const remainingSpaceInChunk = this.#chunkSize - firstChunk.length
            if (remainingSpaceInChunk > 0) {
                firstChunk.unshift(...data.splice(-remainingSpaceInChunk))
            }
        }
        this._chunks.unshift(...this.#chunkify(data))
    }

    popData(count: number) {
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

    shiftData(count: number) {
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

    pop() {
        this._chunks.pop()
    }

    shift() {
        this._chunks.shift()
    }

    getChunkByOffset(offset: number) {
        if (offset < 0) offset = this._chunks.length + offset
        const result = this._chunks[offset]
        return result as T[] | undefined
    }

    getChunk(index: number) {
        return this._chunks[index] as T[] | undefined
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


    #mergeIncompleteLastChunk() {
        const lastChunk = this.getChunkByOffset(-1)
        const penultimateChunk = this.getChunkByOffset(-2) 
        if (lastChunk && penultimateChunk && lastChunk.length < this.chunkSize()) {
            this.pop()
            this.pop()
            this._chunks.push([...penultimateChunk, ...lastChunk])
        }
    }

    #mergeIncompleteFirstChunk() {
        const firstChunk = this.getChunk(0)
        const secondChunk = this.getChunk(1)
        if (firstChunk && secondChunk && firstChunk.length < this.chunkSize()) {
            this.shift()
            this.shift()
            this._chunks.push([...firstChunk, ...secondChunk])
        }

    }

    #splitOvergrownLastChunk() {
        const lastChunk = this.getChunkByOffset(-1)
        if (lastChunk && lastChunk.length > this.chunkSize()) {
            const newLastChunk = lastChunk.splice(this.chunkSize())
            this._chunks.push(newLastChunk)
        }
    }

    #splitOvergrownFirstChunk() {
        const firstChunk = this.getChunk(0)
        if (firstChunk && firstChunk.length > this.chunkSize()) {
            const newFirstChunk = firstChunk.splice(0, firstChunk.length - this.chunkSize())
            this._chunks.unshift(newFirstChunk)
        }
    }
}

export class ChunkifierWithCursor<T> implements IChunkifier<T> {
    #chunkifer: IChunkifier<T>
    #cursor: number

    constructor(chunkifier: IChunkifier<T>, initialCursor: number) {
        this.#chunkifer = chunkifier
        this.#cursor = initialCursor
    }

    chunkCount(): number {
        return this.#chunkifer.chunkCount()
    }

    chunkSize(): number {
        return this.#chunkifer.chunkSize()
    }

    totalSize(): number {
        return this.#chunkifer.totalSize()
    }

    getData(): T[] {
        return this.#chunkifer.getData()
    }

    appendData(...data: T[]): void {
        this.#chunkifer.appendData(...data)
        this.moveCursorIntoBounds()
    }

    prependData(...data: T[]): void {
        this.#chunkifer.prependData(...data)
        this.moveCursorIntoBounds()
    }

    popData(count: number): void {
        this.#chunkifer.popData(count)
        this.moveCursorIntoBounds()
    }

    shiftData(count: number): void {
        this.#chunkifer.shiftData(count)
        this.moveCursorIntoBounds()
    }

    pop(): void {
        this.#chunkifer.pop()
        this.moveCursorIntoBounds()
    }

    shift(): void {
        this.#chunkifer.shift()
        this.moveCursorIntoBounds()
    }

    getChunkByOffset(offset: number): T[] | undefined {
        return this.#chunkifer.getChunkByOffset(offset)
    }

    getChunk(index: number): T[] | undefined {
        return this.#chunkifer.getChunk(index)
    }

    moveCursorIntoBounds() {
        if (this.#cursor === -1 || this.#cursor === 0) {
            return
        }

        const lowerBound = -this.chunkCount() 
        const upperBound = this.chunkCount() - 1

        if (this.#cursor < lowerBound) {
            this.#cursor = lowerBound
        } else if (this.#cursor > upperBound) {
            this.#cursor = upperBound
        }
    }

    incrementCursor(increment?: number) {
        this.#cursor += increment ?? 1
        this.moveCursorIntoBounds()
    }

    reverseCursor(steps?: number) {
        this.#cursor -= steps ?? 1
        this.moveCursorIntoBounds()
    }

    getChunkUnderCursor() {
        return this.getChunkByOffset(this.#cursor)
    }
}

