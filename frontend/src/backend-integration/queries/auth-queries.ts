import { mutationOptions } from "@tanstack/react-query"
import * as bs from "../backendService/auth-service"
import { throwErrorOnRequestFailure } from "./_utility"


export const logIn = mutationOptions({
    mutationFn: async (params: bs.LogInParams) => throwErrorOnRequestFailure(() => bs.logIn(params))
})

export const logOut = mutationOptions({
    mutationFn: async (params: bs.LogOutParams) => throwErrorOnRequestFailure(() => bs.logOut(params))
})
