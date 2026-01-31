
export type StandardResponse<Status extends string> = {
    status: Status | "UNEXPECTED_ERROR"
    message: string
}
