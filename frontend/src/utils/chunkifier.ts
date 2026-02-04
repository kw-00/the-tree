


export class Chunkifier<T> {
    _chunks: T[][]
    #chunkSize: number

    constructor(data: T[], chunkSize: number) {
        this.#chunkSize = chunkSize
        this._chunks = this.#chunkify(data)
    }

    /**
     * Returns the number of chunks.
     */
    chunkCount() {
        return this._chunks.length
    }

    /**
     * Returns the maximum size of each chunk configured for the Chunkifier.
     */
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

    /**
     * Removes the last chunk.
     */
    pop() {
        this._chunks.pop()
    }

    /**
     * Removes the first chunk.
     */
    shift() {
        this._chunks.shift()
    }

    /**
     * Returns the chunk at a given index. Negative numbers are treated as
     * reverse indexation.
     */
    getChunkByOffset(offset: number) {
        if (offset < 0) offset = this._chunks.length + offset
        const result = this._chunks[offset]
        return result as T[] | undefined
    }

    /**
     * Returns a chunk at a given index.
     */
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

