import { mutationOptions, queryOptions, type QueryKey, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query"


class ServerServiceError<T extends ss.StandardResponseBody> extends Error {
    response
    
    constructor(response: T) {
        super(response.message)
        this.response = response
    }
}

const defaultQueryOptions: Partial<UseQueryOptions> = {

}

const defaultMutationOptions: Partial<UseMutationOptions> = {
    
}

type KeyFactory<T> = (params: T) => QueryKey

export function createKeyFactory<T>(fn: (params: T) => QueryKey): KeyFactory<T> {
    return fn
}


export function createUseQueryFactory<T extends ss.StandardResponseBody, K, P>(
        request: (params: P) => Promise<T>, 
        keyFactory: KeyFactory<K>) {
            
    return (kfParams: K, fnParams: P, options?: Partial<UseQueryOptions>) => queryOptions<T, Error, T, readonly unknown[]>({
        queryKey: keyFactory(kfParams),

        // @ts-ignore
        queryFn: () =>  throwErrorOnRequestFailure(() => request(fnParams)),
        ...defaultQueryOptions,
        ...options
    })

}

export function createUseMutationFactory<T extends ss.StandardResponseBody, P>(
        request: (params: P) => Promise<T>) {
            
    return (options?: Partial<UseMutationOptions>) => mutationOptions<T, Error, P, unknown>({
        // @ts-ignore
        mutationFn: (params: P) => throwErrorOnRequestFailure(() => request(params)),
        ...defaultMutationOptions,
        ...options
    })
}

async function throwErrorOnRequestFailure
        <T extends ss.StandardResponseBody>(request: () => Promise<T>): Promise<T> {
    const result = await request()
    if (result.httpStatus === 200) {
        return result
    } else {
        throw new ServerServiceError(result)
    }
}
