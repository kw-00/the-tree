import type { stMap } from "@/utilities/status-mapping";


type DBResponseStatus = keyof typeof stMap

/**
 * Used to determine which and how many records are retrieved
 * in a query that returns many rows. Used for pagination.
 */
export type PaginationParams = {
    before?: Date
    after?: Date
    descending?: boolean
    limit?: number
}
/**
 * Every database service function should return a result that
 * satisfied this type.
 */

export type DBServiceResponse = {
    status: DBResponseStatus
    message: string
}
export type RecordDoesNotExistParams<T> = {
    value: T
    column: string
    table: string
}
