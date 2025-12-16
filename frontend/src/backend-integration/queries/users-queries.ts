import { mutationOptions } from "@tanstack/react-query"
import * as bs from "../backend-service/users-service"
import { throwErrorOnRequestFailure } from "./_utility"


export const registerUser = mutationOptions({
    mutationFn: (params: bs.RegisterUserParams) => throwErrorOnRequestFailure(() => bs.registerUser(params))
})

export const changeLogin = mutationOptions({
    mutationFn: (params: bs.ChangeLoginParams) => throwErrorOnRequestFailure(() => bs.changeLogin(params))
})

export const changePassword = mutationOptions({
    mutationFn: (params: bs.ChangePasswordParams) => throwErrorOnRequestFailure(() => bs.changePassword(params))
})
