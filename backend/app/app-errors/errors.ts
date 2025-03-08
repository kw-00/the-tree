import config from "../utilities/config"


interface ErrorPayload {
    status: "error"
    code: string
    message: string
}


export class AppError extends Error {
    errorPayload: ErrorPayload
    httpStatusCode: number

    constructor(code: string, message: string, httpStatusCode: number) {
        super(message)
        this.errorPayload = {
            status: "error",
            code: code,
            message: message
        }
        this.httpStatusCode = httpStatusCode
    }
}

export class PkInUseError extends AppError {
    constructor(message: string) {
        super("PK_IN_USE", message, 409)
    }
}

export class LoginInUseError extends AppError {
    constructor(message: string) {
        super("LOGIN_IN_USE", message, 409)
    }
}

export class UserNotFoundError extends AppError {
    constructor(message: string) {
        super("USER_NOT_FOUND", message, 404)
    }
}

export class AuthenticationFailedError extends AppError {
    constructor(message: string) {
        super("AUTHENTICATION_FAILED", message, 401)
    }
}

export class AuthorizationFailedError extends AppError {
    constructor(message: string) {
        super("AUTHORIZATION_FAILED", message, 403)
    }
}

export class RefreshTokenExpiredError extends AppError {
    constructor(message: string) {
        super("REFRESH_TOKEN_EXPIRED", message, 403)
    }
}

export class RefreshTokenReuseError extends AppError {
    constructor(message: string) {
        super("REFRESH_TOKEN_REUSE", message, 403)
    }
}

export class RefreshTokenRevokedError extends AppError {
    constructor(message: string) {
        super("REFRESH_TOKEN_REVOKED", message, 403)
    }
}


export class GenericError extends AppError {
    constructor(message: string, encapsulatedError: Error) {
        super("GENERIC_ERROR", config.debug ? encapsulatedError.message : message, 500)
    }
}