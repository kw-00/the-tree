import "dotenv/config"

import fs from "fs"
import Fastify from "fastify"
import cors from "@fastify/cors"
import cookie from "@fastify/cookie"
import { authRoutes } from "@/routes/auth-routes"
import { usersRoutes } from "@/routes/users-routes"
import { friendsRoutes } from "@/routes/friends-routes"
import { chatroomsRoutes } from "@/routes/chatrooms-routes"
import { messagesRoutes } from "@/routes/messages-routes"
import { sharedSchema } from "@/routes/shared-schema"



const fastify = Fastify({
    logger: false,
    https: {
        cert: fs.readFileSync("./cert/certificate.crt"),
        key: fs.readFileSync("./cert/key.pem")
    },
    ajv: {
        customOptions: {
            removeAdditional: true,
            strictRequired: true
        }
    }
})

fastify.register(cors, {
    origin: true, 
    allowedHeaders: ["Content-Type"], 
    methods: ["GET", "POST"], 
    credentials: true}
)
fastify.register(cookie, {hook: "onRequest", parseOptions: {}})

// Register shared schema
fastify.register(sharedSchema)

// Register routes
fastify.register(authRoutes)
fastify.register(usersRoutes)
fastify.register(friendsRoutes)
fastify.register(chatroomsRoutes)
fastify.register(messagesRoutes)


fastify.listen({port: 3000})

