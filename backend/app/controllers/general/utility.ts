import { dbServiceToHttpStatusMapping, type DBServiceResponse } from "@/database-service/general/utility"

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
        const httpStatus = dbServiceToHttpStatusMapping[dbResult.status]
        return {
            httpStatus: httpStatus,
            body: dbResult
        }
    }
    return controller
}

export function simpleResponse(response: DBServiceResponse): ControllerResponse {
    return {
        httpStatus: dbServiceToHttpStatusMapping[response.status],
        body: response
    }
}