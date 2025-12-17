import { throwErrorOnRequestFailure } from "@/backend-integration/00-common/queries/utility"
import { mutationOptions } from "@tanstack/react-query"
import * as bs from "./auth-service"


export const logIn = mutationOptions({
    mutationFn: async (params: bs.LogInParams) => throwErrorOnRequestFailure(() => bs.logIn(params))
})

export const logOut = mutationOptions({
    mutationFn: async (params: bs.LogOutParams) => throwErrorOnRequestFailure(() => bs.logOut(params))
})
