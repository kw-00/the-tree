

import type { DBServiceResponse } from "@/database-service/general/types"

export type ControllerResponse<Body = DBServiceResponse> = {
    httpStatus: number
    body: Body
}

export type ControllerAuthResponse<Body = DBServiceResponse, Auth = { accessToken: string; refreshToken: string} > = {
    auth?: Auth
} & ControllerResponse<Body>



/**
 * A type that represents any given type passed in as DBParams, but with ```userId: number``` converted to ```accessToken: string```.
 *
 * Many controllers will use this, particularly those which accept access tokens and then pass on the parameters with access token converted
 * to user ID.
 */
export type AccessTokenParams<DBParams extends IdParams> = Omit<DBParams, "userId"> & { accessToken: string} 
export type IdParams = { userId: number} 


