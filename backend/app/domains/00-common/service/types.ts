import type { stMap } from "@/utilities/status-mapping";


type ServiceResponseStatus = keyof typeof stMap

/**
 * Every database service function should return a result that
 * satisfies this type.
 */
export type ServiceResponse = {
    status: ServiceResponseStatus
    message: string
}

/**
 * Represents a database service function.
 */
export type DBServiceFunction<P, R extends ServiceResponse> = (params: P) => Promise<R>


