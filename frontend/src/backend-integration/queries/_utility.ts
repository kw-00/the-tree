import type { StandardResponse } from "../backendService/types"


export class ServerServiceError<T extends StandardResponse<S>, S extends string> extends Error {
    response
    
    constructor(response: T) {
        super(response.message)
        this.response = response
    }
}

export async function throwErrorOnRequestFailure
        <Response extends StandardResponse<S>, S extends string>(request: () => Promise<Response>): Promise<Response> {
    const result = await request()
    if (result.status === "SUCCESS") {
        return result
    } else {
        throw new ServerServiceError(result)
    }
}


