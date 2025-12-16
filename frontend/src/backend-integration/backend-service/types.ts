
export type StandardResponse<Status extends string> = {
    status: Status
    message: string
}

export type PaginationParams = {
    before?: Date
    after?: Date
    descending?: boolean
    limit?: number
}