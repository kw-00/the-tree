
import * as s from "@/database-service/users-service"
import { dbServiceToController } from "./_internal/utility"


export const registerUser = dbServiceToController(s.registerUser)

export const changeLogin = dbServiceToController(s.changeLogin)

export const changePassword = dbServiceToController(s.changePassword)