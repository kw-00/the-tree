import { DatabaseError } from "pg"
import { userDoesNotExist } from "./general/_utility"
import { type DBServiceResponse } from "./general/types"
import { pool } from "./general/pool"
import { pgErrorCondition } from "./general/db-error-codes-mapping"


export type RegisterUserParams = {
    login: string
    password: string
}

export type RegisterUserResponse = {
    userId?: number
} & DBServiceResponse

/**
 * Registers a user.
 */
export async function registerUser(params: RegisterUserParams): Promise<RegisterUserResponse> {
    try {
        // Insert new user into database
        const query = await pool.query(`
            INSERT INTO users (login, password) 
            VALUES ($1, $2);
        `, [params.login, params.password])

        return {
            status: "SUCCESS",
            message: `Successfully registered user with login of ${params.login}.`
        }
    } catch (error) {
        if (error instanceof DatabaseError) {
            // If the error is unique violation, return LOGIN_IN_USE
            if (error.code !== undefined && pgErrorCondition(error.code) === "unique_violation") {
                return {
                    status: "LOGIN_IN_USE",
                    message: `Login of ${params.login} is already in use.`
                }
            }
        }
        // But if not, pass on the error
        throw error
    }

}

export type ChangeLoginParams = {
    userId: number
    newLogin: string
}

export type ChangeLoginResponse = DBServiceResponse

/**
 * Changes a user's login.
 */
export async function changeLogin(params: ChangeLoginParams): Promise<ChangeLoginResponse> {
    // Make sure the user exists
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists

    // Update the user's login
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

export type ChangePasswordParams = {
    userId: number
    newPassword: string
}

export type ChangePasswordResponse = DBServiceResponse

/**
 * Changes a user's password.
 */
export async function changePassword(params: ChangePasswordParams): Promise<ChangePasswordResponse> {
    // Make sure the user exists
    const userNotExists = await userDoesNotExist(params.userId)
    if (userNotExists) return userNotExists

    // Change the password
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

