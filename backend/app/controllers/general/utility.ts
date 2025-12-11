import { type DBServiceResponse } from "@/database-service/general/utility"
import { AccessTokenManagement } from "@/utilities/access-token-management"
import { stMap } from "@/utilities/status-mapping"

export type ControllerResponse<Body = DBServiceResponse> = {
    httpStatus: number
    body: Body
}

export type ControllerAuthResponse<Body = DBServiceResponse, Auth = {accessToken: string, refreshToken: string}> = {
    auth?: Auth
} & ControllerResponse<Body>

/**
 * Accepts a database service function and converts it 1:1 to a controller function.
 * Use to create controller functions that merely call database service functions and return an analogous ```ControllerResponse```.
 */
export function dbServiceToController<Params, Body extends DBServiceResponse>(
    dbService: (params: Params) => Promise<Body>
): (params: Params) => Promise<ControllerResponse<Body>> {

    const controller = async (params: Params) => {
        const dbResult = await dbService(params)
        const httpStatus = stMap[dbResult.status]
        return {
            httpStatus: httpStatus,
            body: dbResult
        }
    }
    return controller
}

/**
 * Predictably reates ```ControllerResponse``` from a ```DBServiceResponse```. Use when you don't want to manipulate
 * the DBResponse and want a simple conversion.
 */
export function simpleResponse<DBResponse extends DBServiceResponse>(response: DBResponse): ControllerResponse<DBResponse> {
    return {
        httpStatus: stMap[response.status],
        body: response
    }
}

/**
 * A type that represents any given type passed in as DBParams, but with ```userId: number``` converted to ```accessToken: string```.
 * 
 * Many controllers will use this, particularly those which accept access tokens and then pass on the parameters with access token converted
 * to user ID.
 */
export type AccessTokenParams<DBParams extends IdParams> = Omit<DBParams, "userId"> & {accessToken: string}
type IdParams = {userId: number}

/**
 * Wraps a callback. First converts ```accessToken``` from params to ```userId```, then fires callback with the altered params.
 * 
 * Callback should be a database service function. You should not tamper with the generic parameters. They exist only to ensure that
 * the ```callback``` is compatible with ```params``` after access token is converted.
 */
export async function accessToIdThenCall<IdP extends IdParams, ResExtras extends Record<Exclude<string, "status" | "message">, unknown>> (
    params: AccessTokenParams<IdP>, 
    callback: (params: IdP) => Promise<DBServiceResponse & Partial<ResExtras>>): Promise<ControllerResponse<DBServiceResponse & Partial<ResExtras>>> {

    const {accessToken, ...rest} = params 
    const verificationResult = AccessTokenManagement.verifyToken(accessToken)
    if (verificationResult === null) {
        const status = "INVALID_ACCESS_TOKEN"
        return {
            httpStatus: stMap[status],
            // @ts-ignore
            body: {
                status: status,
                message: "Access token is not valid."
            }
        }
    }

    const userId = verificationResult.sub
    return simpleResponse(await callback({userId, ...(rest as any)}))
}