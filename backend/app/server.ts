import express from "express"
import DatabaseService from "./services/database-service"
import * as appErrors from "./app-errors/errors"

import cookieParser from "cookie-parser"
import cors from "cors"
import * as validator from "express-validator"

import config from "./utilities/config"

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors())

const databaseService = new DatabaseService()

const loginAndPasswordValidators = [
    validator.body("login").isString().notEmpty()
        .isLength({ min: config.dataRules.login.minLength, max: config.dataRules.login.maxLength }),
    validator.body("password").isString().notEmpty()
        .isLength({ min: config.dataRules.password.minLength, max: config.dataRules.password.maxLength }),
]

const accessTokenValidator = validator.check("access_token").isJWT()
const refreshTokenValidator = validator.check("refresh_token").isUUID("4")

const respondWithUnknownError = (res: express.Response) => {
    res.status(500).json({
        status: "error",
        code: "UNKNOWN_ERROR",
        message: "An error occurred."
    })
}


app.post("/register_user",
    loginAndPasswordValidators,

    async (req: express.Request, res: express.Response) => {
        try {
            const validationErrors = validator.validationResult(req)
            if (!validationErrors.isEmpty()) {
                res.status(400).json({ validation_errors: validationErrors.array() })
                return
            }

            const { login, password } = req.body
            await databaseService.registerUser(login, password)
            res.status(200).send({
                "status": "success",
                "message": "Registration successful!"
            })
        } catch (error) {
            if (error instanceof appErrors.AppError) {
                res.status(error.httpStatusCode).json(error.errorPayload)
            } else {
                respondWithUnknownError(res)
            }
        }

    }
)


app.post("/authenticate_user",
    loginAndPasswordValidators,
    async (req: express.Request, res: express.Response) => {
        try {
            const validationErrors = validator.validationResult(req)
            if (!validationErrors.isEmpty()) {
                res.status(400).json({ validation_errors: validationErrors.array() })
                return
            }

            const { login, password } = req.body
            const { accessToken, refreshToken } = await databaseService.authenticateUser(login, password)
            res.status(200)
                .cookie("access_token", accessToken, { "httpOnly": true })
                .cookie("refresh_token", refreshToken, { "httpOnly": true })
                .json({
                    status: "success",
                    message: "Authentication successful!"
                })
        } catch (error) {
            if (error instanceof appErrors.AppError) {
                res.status(error.httpStatusCode).json(error.errorPayload)
            } else {
                respondWithUnknownError(res)
            }
        }
    })

app.post("/refresh_token",
    refreshTokenValidator,
    async (req: express.Request, res: express.Response) => {
        try {
            const validationErrors = validator.validationResult(req)
            if (!validationErrors.isEmpty()) {
                res.status(400).json({ validation_errors: validationErrors.array() })
                return
            }

            const currentRefreshToken = req.body.refresh_token as string
            const { accessToken, refreshToken } = await databaseService.refreshToken(currentRefreshToken)
            res.status(200)
                .cookie("access_token", accessToken, { "httpOnly": true })
                .cookie("refresh_token", refreshToken, { "httpOnly": true })
                .json({
                    status: "success",
                    message: "Token refreshed successfully!"
                })
        } catch (error) {
            if (error instanceof appErrors.AppError) {
                res.status(error.httpStatusCode).json(error.errorPayload)
            } else {
                respondWithUnknownError(res)
            }
        }
    }

)
app.post("/create_message",
    [
        accessTokenValidator,
        validator.body("recipient_id").isInt(),
        validator.body("content").isString()
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const validationErrors = validator.validationResult(req)
            if (!validationErrors.isEmpty()) {
                res.status(400).json(validationErrors.array())
                return
            }

            const accessToken = req.cookies.access_token
            const recipientId = req.body.recipient_id
            const content = req.body.content

            await databaseService.createMessage(accessToken, recipientId, content)
            res.status(200).json({
                "status": "success",
                "message": "Message successfully sent!"
            })
        } catch (error) {
            if (error instanceof appErrors.AppError) {
                res.status(error.httpStatusCode).json(error.errorPayload)
            } else {
                respondWithUnknownError(res)
            }
        }
    }
)
app.post("/find_connected_users",
    accessTokenValidator,
    async (req: express.Request, res: express.Response) => {
        try {
            const validationErrors = validator.validationResult(req)
            if (!validationErrors.isEmpty()) {
                res.status(400).json(validationErrors.array())
                return
            }

            const accessToken = req.cookies.access_token
            const connectedUsers = await databaseService.findConnectedUsers(accessToken)
            res.status(200).json({
                "status": "success",
                "message": "Connected users successfully determined!",
                "connected_users": connectedUsers
            })

        } catch (error) {
            if (error instanceof appErrors.AppError) {
                res.status(error.httpStatusCode).json(error.errorPayload)
            } else {
                respondWithUnknownError(res)
            }
        }
    }
)
app.post("/get_conversation",
    [
        accessTokenValidator,
        validator.body("other_user_id").isInt()
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const validationErrors = validator.validationResult(req)
            if (!validationErrors.isEmpty()) {
                res.status(400).json(validationErrors.array())
                return
            }

            const accessToken = req.cookies.accessToken
            const otherUserId = req.body.other_user_id

            const conversation = await databaseService.getConversation(accessToken, otherUserId)
            res.status(200).json({
                "conversation": conversation
            })

        } catch (error) {
            if (error instanceof appErrors.AppError) {
                res.status(error.httpStatusCode).json(error.errorPayload)
            } else {
                respondWithUnknownError(res)
            }
        }
    }
)

app.listen(3000)