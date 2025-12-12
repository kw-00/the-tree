import type { FastifyReply } from "fastify/types/reply";
import type { FastifyRequest } from "fastify/types/request";

export type Req = FastifyRequest<{Body: Record<string, any>, Params: Record<string, any>}>

export type Rep = FastifyReply