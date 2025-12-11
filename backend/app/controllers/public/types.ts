

import type { DBServiceResponse } from "@/database-service/public/types"

/**
 * Contains mandatory fields that every response by a controller should have.
 * Effectively converts a ```DBServiceResponse``` to a ```ControllerResponse```
 * 
 * For example:
 * ```
 * type FunEndpointControllerResponse = ControllerResponse<FunDatabaseServiceFunction>
 * ```
 */
export type ControllerResponse<Body = DBServiceResponse> = {
    httpStatus: number
    body: Body
}

/**
 * Adds an optional ```auth``` field to controller response. This field
 * may hold an access token and a refresh token if the associated controller function
 * provides them and returns a SUCCESS response.
 * 
 * Overall, the response's structure looks like this:
 *  ```
 *   {
 *       httpStatus: number
 *       body: {...}
 *       auth?: { // Optional. If response does not have status "SUCCESS", auth is typically not sent
 *           accessToken: string
 *           refreshToken: string
 *       }
 * }
 * ```
 */
export type ControllerAuthResponse<Body = DBServiceResponse> = {
    auth?: Auth
} & ControllerResponse<Body>

type Auth = {
    accessToken: string
    refreshToken: string
}


/**
 * Represents a controller function.
 */
export type ControllerFunction<
    P, 
    B = DBServiceResponse, 
    R extends ControllerResponse<B> = ControllerResponse<B>
> = (params: P) => Promise<R>



/**
 * Switches ```userId: number``` for ```accessToken: string```. Useful for types
 * representing controller params that are analogous to some database service function's params.
 * 
 * For example:
 * 
 * ```
 * // Database service
 * export type MyServiceParams = {userId: number, favouriteColor: string}
 * export async function myService(params: MyServiceParams): ...
 * 
 * // Controller
 * export type MyControllerParams = AccessTokenParams<MyServiceParams> // {accessToken: string, favouriteColor: string}
 * export async function myController(params: MyControllerParams): ...
 * ```
 */
export type AccessTokenParams<DBParams extends IdParams> = Omit<DBParams, "userId"> & { accessToken: string} 
export type IdParams = { userId: number} 


