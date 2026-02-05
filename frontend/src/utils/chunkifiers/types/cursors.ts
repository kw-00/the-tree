import type { IChunkifier } from "./chunkifiers"

export interface IChunkifierWrapper<T> {
    /**
     * Returns the underlying chunkifier.
     */
    getChunkifier(): IChunkifier<T>
}

export interface IPureChunkifierCursor<T> {

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

export interface IChunkifierCursor<T> extends IPureChunkifierCursor<T>, IChunkifierWrapper<T> {}

export interface ISuperChunkifierCursor<T> extends IPureChunkifierCursor<T[]>, IChunkifierWrapper<T> {}