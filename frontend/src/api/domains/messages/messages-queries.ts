import { infiniteQueryOptions, mutationOptions } from "@tanstack/react-query"
import * as bs from "./messages-service"
import { throwErrorOnRequestFailure } from "../00-common/queries/utility"
import { ServerConfig } from "../../server-config"


export const createMessage = mutationOptions({
    mutationFn: async (params: bs.CreateMessageParams) => throwErrorOnRequestFailure(() => bs.createMessage(params))
})




