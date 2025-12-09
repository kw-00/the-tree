import { DatabaseError } from "pg"
import { DBServiceResponse, pool, userDoesNotExist } from "./general/utility"
import { pgErrorCondition } from "./general/db-error-codes-mapping"


type RegisterUserParams = {
    login: string
    password: string
}

type RegisterUserResponse = {
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
            VALUES ($1, $2)
            RETURNING id; 
        `, [params.login, params.password])

        // Retrieve the user's ID
        const userId = query.rows[0]["id"]

        return {
            userId: userId,
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

type ChangeLoginParams = {
    userId: number
    newLogin: string
}

type ChangeLoginResponse = DBServiceResponse

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

type ChangePasswordParams = {
    userId: number
    newPassword: string
}

type ChangePasswordResponse = DBServiceResponse

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

