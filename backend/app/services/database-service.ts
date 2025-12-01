import { Pool } from "pg";
import DatabaseInterface from "./database-interface";
import { AccessTokenManagement } from "../utilities/access-token-management";

type DatabaseServiceResponse = {
    httpStatus: number,
    status: string,
    message: string
} & any


export default class DatabaseService {
    dbi: DatabaseInterface

    constructor(pool: Pool) {
        this.dbi = new DatabaseInterface(pool)
    }

    async registerUser(login: string, password: string): Promise<DatabaseServiceResponse> {
        return this.dbi.registerUser(login, password)
    }

    async authenticateUser(login: string, password: string): Promise<DatabaseServiceResponse> {
        const authenticationResult = await this.dbi.authenticateUser(login, password)
        if (authenticationResult.httpStatus === 200) {
            const userId = authenticationResult.userId!
            const refreshTokenCreationResult = await this.dbi.createRefreshToken(userId, Number(process.env.REFRESH_TOKEN_VALIDITY_PERIOD))
            if (refreshTokenCreationResult.httpStatus === 200) {
                return {
                    ...refreshTokenCreationResult,
                    accessToken: AccessTokenManagement.getToken(userId)
                }
            } else {
                return refreshTokenCreationResult
            }
        } else {
            return authenticationResult
        }
    }

    async refreshToken(refreshToken: string): Promise<DatabaseServiceResponse> {
        const verificationResult = await this.dbi.verifyRefreshToken(refreshToken)
        if (verificationResult.httpStatus === 200) {
            const userId = verificationResult.userId!
            const creationResult = await this.dbi.createRefreshToken(userId, Number(process.env.REFRESH_TOKEN_VALIDITY_PERIOD))
            if (creationResult.httpStatus === 200) {
                return {
                    ...creationResult,
                    accessToken: AccessTokenManagement.getToken(userId)
                }
            } else {
                return creationResult
            }

        } else {
            return verificationResult
        }
    }

    async logOut(refreshToken: string): Promise<DatabaseServiceResponse> {
        return await this.dbi.revokeRefreshToken(refreshToken)
    }
}