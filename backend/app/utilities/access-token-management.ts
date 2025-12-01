import fs from "fs"
import path from "path"
import jwtWebToken from "jsonwebtoken"


export interface AccessTokenPayload {
    sub: number,
    iat: number,
    exp: number
}

export class AccessTokenManagement {

    static getToken(sub: string): string {
        return this._getToken(sub, Number(process.env.ACCESS_TOKEN_VALIDITY_PERIOD), process.env.ACCESS_TOKEN_SECRET as string)
    }

    static verifyToken(token: string): AccessTokenPayload | null {
        try {
            const secret = process.env.ACCESS_TOKEN_SECRET as string
            const payload = jwtWebToken.verify(token, secret)
            return payload as any
        } catch (err) {
            return null
        }
    }

    private static _getToken(sub: string, validityPeriod: number, secret: string): string {
        const iat = Date.now()
        const exp = iat + validityPeriod
        const payload = {
            "sub": sub,
            "iat": iat,
            "exp": exp
        }
        const token = jwtWebToken.sign(payload, secret)
        return token
    }
}