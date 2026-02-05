
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