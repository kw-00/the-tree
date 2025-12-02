import "dotenv/config"

import express, {Request, Response} from "express"
import DatabaseInterface from "./services/database-interface"

import cookieParser from "cookie-parser"
import cors from "cors"
import * as validator from "express-validator"

import https from "https"
import fs from "fs"
import { Pool } from "pg"
import DatabaseService, { type DatabaseServiceResponse } from "./services/database-service"

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
pool.connect()

const API_PATH = "api"


const databaseService = new DatabaseService(pool)

type ValidatorType = "login" | "password" | "accessToken" | "refreshToken" | "id" | "uuid" | "chatroomName" | "friendshipCode"

const myValidators = (keyName: string, validatorType: ValidatorType, isBody: boolean = true) => {
    let baseValidator;
    if (isBody) {
        baseValidator = validator.body(keyName)
    } else {
        baseValidator = validator.check(keyName)
    } 
    const validators = {
        login: baseValidator.isString().notEmpty()
            .isLength({min: Number(process.env.LOGIN_LENGTH_MIN), max: Number(process.env.LOGIN_LENGTH_MAX)}),
        password: baseValidator.isString().notEmpty()
            .isLength({min: Number(process.env.PASSWORD_LENGTH_MIN), max: Number(process.env.PASSWORD_LENGTH_MAX)}),
        accessToken: baseValidator.isJWT(),
        refreshToken: baseValidator.isUUID("4"),
        id: baseValidator.isNumeric().isInt({min: 0}),
        uuid: baseValidator.isUUID(),
        chatroomName: baseValidator.isString().notEmpty()
            .isLength({min: Number(process.env.CHATROOM_NAME_LENGTH_MIN), max: Number(process.env.CHATROOM_NAME_LENGTH_MAX)})
            .optional({values: "null"}),
        friendshipCode: baseValidator.isString().notEmpty()
            .isLength({min: Number(process.env.FRIENDSHIP_CODE_LENGTH_MIN), max: Number(process.env.FRIENDSHIP_CODE_LENGTH_MAX)})
    }
    // @ts-ignore
    return validators[validatorType]
}




const handleRequest = async (req: Request, res: Response, 
    callback: (validatedData: Record<string, any>) => Promise<DatabaseServiceResponse>) => {
    try {
        // Validate request
        const validationErrors = validator.validationResult(req)
        if (!validationErrors.isEmpty()) {
            res.status(400).json({ 
                httpStatus: 400,
                status: "BAD_REQUEST",
                message: "Request did not pass validation",
                validationErrors: validationErrors.array() 
            })
            return
        }
        const validatedData = validator.matchedData(req)
        // Get database service response, separating auth from the rest of the body
        const {auth, ...rest} = await callback(validatedData)
        // Attach auth in cookies
        Object.entries(auth!).forEach(([name, value]) => {
            res.cookie(name, value, {httpOnly: true, secure: true, sameSite: "strict"})
        })
        // Send the response
        res.status(rest.httpStatus).json(rest)
    } catch (error) {
        // On error, send a general error response
        if (error instanceof Error) {
            res.status(500).json({
                httpStatus: 500,
                status: `UNKNOWN_ERROR`,
                message: "An error occurred.",
                error: {
                    name: error.name,
                    message: error.message,
                    cause: error.cause,
                    stack: error.stack,
                }
            })            
        } else {
            res.status(500).json({
                httpStatus: 500,
                status: "UNKNOWN_ERROR",
                message: "An error occurred.",
                error: error
            })
        }
    }
}


app.post(`${API_PATH}/register_user`,
    [myValidators("login", "login"), myValidators("password", "password")],
    async (req: Request, res: Response) => {
        handleRequest(req, res, async (req) => {
            const {login, password} = req.body
            return databaseService.registerUser(login, password)
        })
    }
)


app.post(`${API_PATH}/authenticate_user`,
    [myValidators("login", "login"), myValidators("password", "password")],
    async (req: Request, res: Response) => {
        handleRequest(req, res, async (validatedData) => {
            const {login, password} = validatedData
            return databaseService.authenticateUser(login, password)
        })
    }
)

app.post(`${API_PATH}/refresh_token`,
    [myValidators("refreshToken", "refreshToken", false)],
    async (req: express.Request, res: express.Response) => {
        handleRequest(req, res, async (validatedData) => {
            const {refreshToken} = validatedData
            return databaseService.refreshToken(refreshToken)
        })
    }
)

app.post(`${API_PATH}/log_out`,
    [myValidators("refreshToken", "refreshToken", false)],
    async (req: Request, res: Response) => {
        handleRequest(req, res, async (validatedData) => {
            const {refreshToken} = validatedData
            return databaseService.logOut(refreshToken)
        })
    }
)

app.post(`${API_PATH}/add_friend`,
    [
        myValidators("accessToken", "accessToken", false),
        myValidators("userToBefriend", "login"),
        myValidators("friendshipCode", "friendshipCode")
    ],
    async (req: Request, res: Response) => {
        handleRequest(req, res, async (validatedData) => {
            const {accessToken, userToBefriend, frienshipCode} = validatedData
            return databaseService.addFriend(accessToken, userToBefriend, frienshipCode)
        })
    }
)

app.post(`${API_PATH}/add_users_to_chatroom`,
    [
        myValidators("accessToken", "accessToken", false),
        validator.body("friendIds").isArray().notEmpty(),
        myValidators("friendIds.*", "id"),
        myValidators("chatroomId", "id")
    ],
    async (req: Request, res: Response) => {
        handleRequest(req, res, async (validatedData) => {
            const {accessToken, friendIds, chatroomId} = validatedData
            return databaseService.addUsersToChatroom(accessToken, friendIds, chatroomId)
        })
    }
)

app.post(`${API_PATH}/create_chatroom`,
    [
        myValidators("accessToken", "accessToken", false),
        myValidators("chatroomName", "chatroomName")
    ],
    async (req: Request, res: Response) => {
        handleRequest(req, res, async (validatedData) => {
            const {accessToken, chatroomName} = validatedData
            return databaseService.createChatroom(accessToken, chatroomName)
        })
    }
)

app.post(`${API_PATH}/get_connected_rooms`,
    [
        myValidators("accessToken", "accessToken", false),
        validator.body("after").isDate(),
    ],
    async (req: Request, res: Response) => {
        handleRequest(req, res, async (validatedData) => {
            const {accessToken, after} = validatedData
            return databaseService.getConnectedRooms(accessToken, after)
        })
    }
)


app.post(`${API_PATH}/create_message`,
    [
        myValidators("accessToken", "accessToken", false),
        myValidators("chatroomId", "id"),
        validator.body("content").isString()
    ],
    async (req: Request, res: Response) => {
        handleRequest(req, res, async (validatedData) => {
            const {accessToken, chatroomId, content} = validatedData
            return databaseService.createMessage(accessToken, chatroomId, content)
        })
    }
)
app.post(`${API_PATH}/get_conversation`,
    [
        myValidators("accessToken", "accessToken", false),
        myValidators("chatroomId", "id"),
        validator.body("before").isDate().optional({values: "null"}),
        validator.body("after").isDate().optional({values: "null"}),
        validator.body("nRows").isInt({min: 1}),
        validator.body("descending").isBoolean()
    ],
    async (req: Request, res: Response) => {
        handleRequest(req, res, async (validatedData) => {
            const {
                accessToken,
                chatroomId,
                before,
                after,
                nRows,
                descending
            } = validatedData
            return databaseService.getConversation(
                accessToken,
                chatroomId,
                before,
                after,
                nRows,
                descending
            )
        })
    }
)


const options = {
    key: fs.readFileSync("./cert/key.pem"),
    cert: fs.readFileSync("./cert/certificate.crt")

}

https.createServer(options, app).listen(3000)