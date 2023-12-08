import { Response } from 'express'
import { HttpStatus } from './http-status'

type DataType<T> = T extends void | null | undefined | Promise<any> ? never : T

interface Json<T> {
    data: T
    status: HttpStatus
}

export type ResponseJson<T> = Response<Json<T>>

export function responseJson<T>(res: ResponseJson<T>, data: DataType<T>, status = HttpStatus.OK): ResponseJson<T> {
    return res.status(status).json({
        data,
        status,
    })
}
