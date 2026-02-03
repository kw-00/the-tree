








export class Chunkifier<T> {
    #chunks: T[][]
    #chunkSize: number

    constructor(data: T[], chunkSize: number) {
        this.#chunkSize = chunkSize
        this.#chunks = this.#chunkify(data)
    }

    chunkCount() {
        return this.#chunks.length
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
        firstChunk.unshift(...data.splice(-remainingSpaceInChunk))
        this.#chunks.unshift(...this.#chunkify(data))
    }

    pop() {
        this.#chunks.pop()
    }

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