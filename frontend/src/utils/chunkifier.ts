


class BaseChunkifier<T> {
    #chunks: T[][]
    #chunkSize: number

    constructor(data: T[], chunkSize: number) {
        this.#chunkSize = chunkSize
        this.#chunks = this.#chunkify(data)
    }

    /**
     * Returns the number of chunks.
     */
    chunkCount() {
        return this.#chunks.length
    }

    /**
     * Returns the maximum size of each chunk configured for the Chunkifier.
     */
    chunkSize() {
        return this.#chunkSize
    }

    appendData(...data: T[]) {
        const lastChunk = this.#chunks[this.chunkCount() - 1]
        const remainingSpaceInChunk = this.#chunkSize - lastChunk.length
        lastChunk.push(...data.splice(0, remainingSpaceInChunk))
        this.#chunks.push(...this.#chunkify(data))
    }

    prependData(...data: T[]) {
        const firstChunk = this.#chunks[0]
        const remainingSpaceInChunk = this.#chunkSize - firstChunk.length
        if (remainingSpaceInChunk > 0) {
            firstChunk.unshift(...data.splice(-remainingSpaceInChunk))
        }
        this.#chunks.unshift(...this.#chunkify(data))
    }

    /**
     * Returns the chunk at a given index. Negative numbers are treated as
     * reverse indexation.
     */
    getChunkByOffset(offset: number) {
        if (offset < 0) offset = this.#chunks.length + offset
        const result = this.#chunks[offset]
        return result as T[] | undefined
    }

    /**
     * Returns a chunk at a given index.
     */
    getChunk(index: number) {
        return this.#chunks[index] as T[] | undefined
    }

    /**
     * Removes the last chunk.
     */
    pop() {
        this.#chunks.pop()
    }

    /**
     * Removes the first chunk.
     */
    shift() {
        this.#chunks.shift()
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

export class Chunkifier<T> extends BaseChunkifier<T> {
    #cursor: number

    constructor(data: T[], chunkSize: number, initialCursor: number) {
        super(data, chunkSize)
        const lastChunk = this.getChunkByOffset(-1)
        if (lastChunk) {
            const bufferForIncompleteLastChunk = this.#chunkIsFull(lastChunk) ? 0 : 1
            this.#cursor = initialCursor < 0 
                ? 
                Math.max(this.chunkCount() + initialCursor - bufferForIncompleteLastChunk, 0) 
                : 
                Math.min(initialCursor, this.chunkCount() - 1 - bufferForIncompleteLastChunk)
        } else {
            this.#cursor = 0
        }
    }

    override prependData(...data: T[]): void {
        const oldChunkCount = this.chunkCount()
        super.prependData(...data)
        const newChunkCount = this.chunkCount()
        this.#cursor += newChunkCount - oldChunkCount
    }

    override shift() {
        super.shift()
        this.#cursor -= 1
    }

    /**
     * Moves the cursor to the next chunk and returns that chunk.
     * 
     * Works only if there is a next chunk - otherwise, returns `undefined`.
     */
    next() {
        const currentChunk = this.getChunk(this.#cursor)
        if (!currentChunk) return undefined
        
        const nextCursor = this.#cursor + 1
        const nextChunk = this.getChunk(nextCursor)

        if (nextChunk && this.#chunkIsFull(nextChunk)) {
            this.#cursor = nextCursor
            return this.current()
        }
    }

    /**
     * Moves the cursor to the previous chunk and returns that chunk.
     * 
     * Works only if cursor can move backwards - otherwise, returns `undefined`.
     */
    previous() {
        const currentChunk = this.getChunkByOffset(this.#cursor)
        if (!currentChunk) return undefined

        const prevCursor = this.#cursor - 1
        const prevChunk = this.getChunk(prevCursor)

        if (prevChunk && this.#chunkIsFull(prevChunk)) {
            this.#cursor = prevCursor
            return this.current()
        }
    }

    /**
     * Returns the chunk under the current cursor, merged with surrounding chunks if they are not full.
     */
    current() {
        const currentChunk = this.getChunk(this.#cursor)
        if (currentChunk) {
            return this.#absorbIncompleteChunks(this.#cursor)
        }
    }

    #chunkIsFull(chunk: T[]) {
        return chunk.length === this.chunkSize()
    }

    /**
     * Returns the chunk with the given index, potentially merged with surrounding chunks.
     * Surrounding chunks are merged only if they are not full. 
     * 
     * No mutation occurs.
     * 
     * @throws RangeError - if index is out of bounds.
     */
    #absorbIncompleteChunks(index: number) {
        const chunk = this.getChunkByOffset(index)
        if (!chunk) throw new RangeError(`Index of ${index} is out of bounds for chunkCount of ${this.chunkCount()}`)
        return [...this.#getPreviousChunkIfIncomplete(index) ?? [], ...chunk, ...this.#getNextChunkIfIncomplete(index) ?? []]
    }

    /**
     * Returns the chunk after the given index if that chunk is not full.
     */
    #getNextChunkIfIncomplete(index: number) {
        const nextChunk = this.getChunkByOffset(index + 1)
        if (nextChunk && !this.#chunkIsFull(nextChunk)) {
            return nextChunk
        }
    }

    /**
     * Returns the chunk before the given index if that chunk is not full.
     */
    #getPreviousChunkIfIncomplete(index: number) {
        const prevChunk = this.getChunkByOffset(index - 1)
        if (prevChunk && !this.#chunkIsFull(prevChunk)) {
            return prevChunk
        }
    }
}
