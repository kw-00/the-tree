import { DatabaseError } from "pg"
import { DBServiceResponse, pgErrorCondition, pool, userDoesNotExist } from "./utility"


type RegisterUserParams = {
    login: string
    password: string
}

type RegisterUserResponse = {
    userId?: number
} & DBServiceResponse

export async function registerUser(params: RegisterUserParams): Promise<RegisterUserResponse> {
    try {
        const query = await pool.query(`
            INSERT INTO users (login, password) 
            VALUES ($1, $2)
            RETURNING id; 
        `, [params.login, params.password])

        const userId = query.rows[0]["id"]

        return {
            userId: userId,
            status: "SUCCESS",
            message: `Successfully registered user with login of ${params.login}.`
        }
    } catch (error) {
        if (error instanceof DatabaseError) {
            if (error.code !== undefined && pgErrorCondition(error.code) === "unique_violation") {
                return {
                    status: "LOGIN_IN_USE",
                    message: `Login of ${params.login} is already in use.`
                }
            }
        }
        throw error
    }

}

type ChangeLoginParams = {
    userId: number
    newLogin: string
}

type ChangeLoginResponse = DBServiceResponse

export async function changeLogin(params: ChangeLoginParams): Promise<ChangeLoginResponse> {
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists

    await pool.query(`
        UPDATE users
        SET login = $1
        WHERE id = $2;
    `, [params.newLogin, params.userId])

    return {
        status: "SUCCESS",
        message: `Successfully changed login to ${params.newLogin} for user with ID of ${params.userId}.`
    }
}

type ChangePasswordParams = {
    userId: number
    newPassword: string
}

type ChangePasswordResponse = DBServiceResponse

export async function changePassword(params: ChangePasswordParams): Promise<ChangePasswordResponse> {
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists

    await pool.query(`
        UPDATE users
        SET password = $1
        WHERE id = $2;
    `, [params.newPassword, params.userId])

    return {
        status: "SUCCESS",
        message: `Successfully changed password for user with ID of ${params.userId}.`
    }
}

