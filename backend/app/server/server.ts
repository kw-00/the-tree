import "dotenv/config"

import fs from "fs"
import Fastify from "fastify"
import cors from "@fastify/cors"
import cookie from "@fastify/cookie"
import { authRoutes } from "@/domains/auth/auth-routes"
import { chatroomsRoutes } from "@/domains/chatrooms/chatrooms-routes"
import { friendsRoutes } from "@/domains/friends/friends-routes"
import { messagesRoutes } from "@/domains/messages/messages-routes"
import { usersRoutes } from "@/domains/users/users-routes"



const fastify = Fastify({
    logger: true,
    https: {
        cert: fs.readFileSync("./cert/certificate.crt"),
        key: fs.readFileSync("./cert/key.pem")
    }
})

fastify.register(cors, {
    origin: true, 
    allowedHeaders: ["Content-Type"], 
    methods: ["GET", "POST"], 
    credentials: true}
)
fastify.register(cookie, {hook: "onRequest", parseOptions: {}})


// Register routes
fastify.register(authRoutes)
fastify.register(usersRoutes)
fastify.register(friendsRoutes)
fastify.register(chatroomsRoutes)
fastify.register(messagesRoutes)


fastify.listen({port: 3000})

