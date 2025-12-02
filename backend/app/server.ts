import "dotenv/config"

import express from "express"
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

const myValidators = {
    login: validator.body("login").isString().notEmpty()
        .isLength({min: Number(process.env.LOGIN_LENGTH_MIN), max: Number(process.env.LOGIN_LENGTH_MAX)}),
    password: validator.body("password").isString().notEmpty(),
    accessToken: validator.check("accessToken").isJWT(),
    refreshToken: validator.check("refreshToken").isUUID("4")
}




const handleRequest = async (req: express.Request, res: express.Response, 
    callback: (req: express.Request) => Promise<DatabaseServiceResponse>) => {
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
        // Get database service response, separating auth from the rest of the body
        const {auth, ...rest} = await callback(req)
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
    [myValidators.login, myValidators.password],
    async (req: express.Request, res: express.Response) => {
        handleRequest(req, res, async (req) => {
            const {login, password} = req.body
            return databaseService.registerUser(login, password)
        })
    }
)


app.post(`${API_PATH}/authenticate_user`,
    [myValidators.login, myValidators.password],
    async (req: express.Request, res: express.Response) => {
        handleRequest(req, res, async (req) => {
            const {login, password} = req.body
            return databaseService.authenticateUser(login, password)
        })
    }
)

app.post(`${API_PATH}/refresh_token`,
    [myValidators.refreshToken],
    async (req: express.Request, res: express.Response) => {
        handleRequest(req, res, async (req) => {
            const refreshToken = req.cookies.refreshToken
            return databaseService.refreshToken(refreshToken)
        })
    }
)

app.post(`${API_PATH}/log_out`,
    [myValidators.refreshToken],
    async (req: express.Request, res: express.Response) => {
        handleRequest(req, res, async (req) => {
            const refreshToken = req.cookies.refreshToken
            return databaseService.logOut(refreshToken)
        })
    }
)



const options = {
    key: fs.readFileSync("./cert/key.pem"),
    cert: fs.readFileSync("./cert/certificate.crt")

}

https.createServer(options, app).listen(3000)