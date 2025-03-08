import fs from "fs"
import path from "path"
import jwtWebToken, { JwtPayload } from "jsonwebtoken"

import config from "./config"


export interface AccessTokenPayload {
    sub: number,
    iat: number,
    exp: number
}

export class AccessTokenManagement {

    static getToken(sub: number): string {
        return this._getToken(sub, config.jwt.access.validityPeriod, config.jwt.access.secret)
    }

    static verifyToken(token: string): AccessTokenPayload | null {
        try {
            const secret = config.jwt.access.secret
            const payload = jwtWebToken.verify(token, secret)
            // @ts-ignore
            return payload
        } catch (err) {
            return null
        }
    }

    private static _getToken(sub: number, validityPeriod: number, secret: string): string {
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