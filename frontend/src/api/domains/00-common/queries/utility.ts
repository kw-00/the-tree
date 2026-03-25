import type { StandardResponse } from "../service/types"


export class ServerServiceError<T extends StandardResponse<S>, S extends string> extends Error {
    response
    
    constructor(response: T) {
        super(response.message)
        this.response = response
    }
}

export async function throwErrorOnRequestFailure
        <Response extends StandardResponse<S>, S extends string>(request: () => Promise<Response>): Promise<Required<Response>> {
    const result = await request()
    if (result.status === "SUCCESS") {
        return result as Required<Response>
    } else {
        throw new ServerServiceError(result)
    }
}


