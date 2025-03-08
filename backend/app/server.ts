import express from "express"
import DatabaseService from "./services/database-service"
import * as appErrors from "./app-errors/errors"

import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors())

const databaseService = new DatabaseService()


app.post("/register_user", async (req, res) => {

    const { login, password } = req.body

    try {
        await databaseService.registerUser(login, password)
        const { accessToken, refreshToken } = await databaseService.authenticateUser(login, password)
        res.status(200)
            .cookie("access_token", accessToken, { "httpOnly": true })
            .cookie("refresh_token", refreshToken, { "httpOnly": true })
            .json({
                status: "success",
                message: "Registration successful!"
            })
    } catch (error) {
        if (error instanceof appErrors.AppError) {
            res.status(error.httpStatusCode).json(error.errorPayload)
        }
    }
})

app.post("/authenticate_user", async (req, res) => {
    const { refresh_token } = req.body

    try {
         
    }
})

app.post("/")

app.listen(3000)