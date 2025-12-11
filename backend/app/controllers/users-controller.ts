import { dbServiceToController, type ControllerResponse } from "./general/utility"
import * as s from "@/database-service/users-service"


export const registerUser = dbServiceToController(s.registerUser)

export const changeLogin = dbServiceToController(s.changeLogin)

export const changePassword = dbServiceToController(s.changePassword)