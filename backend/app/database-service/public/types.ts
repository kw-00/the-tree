import type { stMap } from "@/utilities/status-mapping";


type DBResponseStatus = keyof typeof stMap

/**
 * Every database service function should return a result that
 * satisfies this type.
 */
export type DBServiceResponse = {
    status: DBResponseStatus
    message: string
}

/**
 * Represents a database service function.
 */
export type DBServiceFunction<P, R extends DBServiceResponse> = (params: P) => Promise<R>


