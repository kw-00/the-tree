import "dotenv/config"

import express from "express"
import DatabaseInterface from "./services/database-interface"

import cookieParser from "cookie-parser"
import cors from "cors"
import * as validator from "express-validator"

import https from "https"
import fs from "fs"
import { Pool } from "pg"

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: (origin, callback) => { callback(null, origin)},
    credentials: true
}))

const databaseCredentials = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
}

const pool = new Pool(databaseCredentials)


const databaseService = new DatabaseInterface()

const loginAndPasswordValidators = [
    validator.body("login").isString().notEmpty()
        .isLength({min: Number(process.env.LOGIN_LENGTH_MIN), max: Number(process.env.LOGIN_LENGTH_MAX)}),
    validator.body("password").isString().notEmpty()
        .isLength({min: Number(process.env.PASSWORD_LENGTH_MIN), max: Number(process.env.PASSWORD_LENGTH_MAX) }),
]

const accessTokenValidator = validator.check("accessToken").isJWT()
const refreshTokenValidator = validator.check("refreshToken").isUUID("4")

const respondWithUnknownError = (res: express.Response) => {
    res.status(500).json({
        status: "error",
        code: "UNKNOWN_ERROR",
        message: "An error occurred."
    })
}


app.post("/api/register_user",
    loginAndPasswordValidators,

    async (req: express.Request, res: express.Response) => {
        try {
            const validationErrors = validator.validationResult(req)
            if (!validationErrors.isEmpty()) {
                res.status(400).json({ validationErrors: validationErrors.array() })
                return
            }

            const { login, password } = req.body
            const result = await databaseService.registerUser(login, password)
            res.status(200).send(result)
        } catch (error) {
            respondWithUnknownError(res)
        }

    }
)


// app.post("/api/authenticate_user",
//     loginAndPasswordValidators,
//     async (req: express.Request, res: express.Response) => {
//         try {
//             const validationErrors = validator.validationResult(req)
//             if (!validationErrors.isEmpty()) {
//                 res.status(400).json({ validationErrors: validationErrors.array() })
//                 return
//             }

//             const { login, password } = req.body
//             const { accessToken, refreshToken } = await databaseService.authenticateUser(login, password)
//             res.status(200)
//                 .cookie("accessToken", accessToken, { httpOnly: true, sameSite: "strict", secure: true })
//                 .cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "strict", secure: true })
//                 .json({
//                     status: "success",
//                     message: "Authentication successful!"
//                 })
//         } catch (error) {
//             if (error instanceof appErrors.AppError) {
//                 res.status(error.httpStatusCode).json(error.errorPayload)
//             } else {
//                 respondWithUnknownError(res)
//             }
//         }
//     })


// app.post("/api/refresh_token",
//     refreshTokenValidator,
//     async (req: express.Request, res: express.Response) => {
//         try {
//             const validationErrors = validator.validationResult(req)
//             if (!validationErrors.isEmpty()) {
//                 res.status(400).json({ validationErrors: validationErrors.array() })
//                 return
//             }

//             const currentRefreshToken = req.cookies.refreshToken as string
//             const { accessToken, refreshToken } = await databaseService.refreshToken(currentRefreshToken)
//             res.status(200)
//                 .cookie("accessToken", accessToken, { httpOnly: true, sameSite: "strict", secure: true })
//                 .cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "strict", secure: true })
//                 .json({
//                     status: "success",
//                     message: "Token refreshed successfully!"
//                 })
//         } catch (error) {
//             if (error instanceof appErrors.AppError) {
//                 res.status(error.httpStatusCode).json(error.errorPayload)
//             } else {
//                 respondWithUnknownError(res)
//             }
//         }
//     }
// )


// app.post("/api/log_out_user",
//     refreshTokenValidator,
//     async (req: express.Request, res: express.Response) => {
//         try {
//             const validationErrors = validator.validationResult(req)
//             if (!validationErrors.isEmpty()) {
//                 res.status(400).json({validationErrors: validationErrors.array()})
//                 return
//             }

//             const refreshToken = req.cookies.refreshToken
//             await databaseService.logOutUser(refreshToken)

//             res.status(200).json({
//                 status: "success",
//                 message: "Logged out successfully!"
//             })
//         } catch (error) {
//             if (error instanceof appErrors.AppError) {
//                 res.status(error.httpStatusCode).json(error.errorPayload)
//             } else {
//                 respondWithUnknownError(res)
//             }
//         }
//     }
// )


// app.post("/api/create_message",
//     [
//         accessTokenValidator,
//         validator.body("recipientId").isInt(),
//         validator.body("content").isString()
//     ],
//     async (req: express.Request, res: express.Response) => {
//         try {
//             const validationErrors = validator.validationResult(req)
//             if (!validationErrors.isEmpty()) {
//                 res.status(400).json(validationErrors.array())
//                 return
//             }

//             const accessToken = req.cookies.accessToken
//             const recipientId = req.body.recipientId
//             const content = req.body.content

//             await databaseService.createMessage(accessToken, recipientId, content)
//             res.status(200).json({
//                 status: "success",
//                 message: "Message successfully sent!"
//             })
//         } catch (error) {
//             if (error instanceof appErrors.AppError) {
//                 res.status(error.httpStatusCode).json(error.errorPayload)
//             } else {
//                 respondWithUnknownError(res)
//             }
//         }
//     }
// )


// app.post("/api/find_connected_users",
//     accessTokenValidator,
//     async (req: express.Request, res: express.Response) => {
//         try {
//             const validationErrors = validator.validationResult(req)
//             if (!validationErrors.isEmpty()) {
//                 res.status(400).json(validationErrors.array())
//                 return
//             }

//             const accessToken = req.cookies.accessToken
//             const connectedUsers = await databaseService.findConnectedUsers(accessToken)
//             res.status(200).json({
//                 status: "success",
//                 message: "Connected users successfully determined!",
//                 connectedUsers: connectedUsers
//             })

//         } catch (error) {
//             if (error instanceof appErrors.AppError) {
//                 res.status(error.httpStatusCode).json(error.errorPayload)
//             } else {
//                 respondWithUnknownError(res)
//             }
//         }
//     }
// )


// app.post("/api/get_conversation",
//     [
//         accessTokenValidator,
//         validator.body("otherUserId").isInt()
//     ],
//     async (req: express.Request, res: express.Response) => {
//         try {
//             const validationErrors = validator.validationResult(req)
//             if (!validationErrors.isEmpty()) {
//                 res.status(400).json(validationErrors.array())
//                 return
//             }

//             const accessToken = req.cookies.accessToken
//             const otherUserId = req.body.otherUserId

//             const conversation = await databaseService.getConversation(accessToken, otherUserId)
//             res.status(200).json({
//                 conversation: conversation
//             })

//         } catch (error) {
//             if (error instanceof appErrors.AppError) {
//                 res.status(error.httpStatusCode).json(error.errorPayload)
//             } else {
//                 respondWithUnknownError(res)
//             }
//         }
//     }
// )


const options = {
    key: fs.readFileSync("./cert/key.pem"),
    cert: fs.readFileSync("./cert/certificate.crt")

}

https.createServer(options, app).listen(3000)