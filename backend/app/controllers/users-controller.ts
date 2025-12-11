import { dbServiceToController } from "./general/_utility"
import { type ControllerResponse } from "./general/types"
import * as s from "@/database-service/users-service"


export const registerUser = dbServiceToController(s.registerUser)

export const changeLogin = dbServiceToController(s.changeLogin)

export const changePassword = dbServiceToController(s.changePassword)