import { mutationOptions } from "@tanstack/react-query"
import * as bs from "../backendService/users-service"
import { throwErrorOnRequestFailure } from "./_utility"


const usersQueries = {
    registerUser: mutationOptions({
        mutationFn: (params: bs.RegisterUserParams) => throwErrorOnRequestFailure(() => bs.registerUser(params))
    }),

    changeLogin: mutationOptions({
        mutationFn: (params: bs.ChangeLoginParams) => throwErrorOnRequestFailure(() => bs.changeLogin(params))
    }),

    changePassword: mutationOptions({
        mutationFn: (params: bs.ChangePasswordParams) => throwErrorOnRequestFailure(() => bs.changePassword(params))
    })
}

export default usersQueries