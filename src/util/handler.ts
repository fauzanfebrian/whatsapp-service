import { NextFunction, Request, Response } from 'express'
import { ValidationError } from 'joi'
import { ErrorCode, MulterError } from 'multer'

function translateMulterError(errorCode: ErrorCode) {
    let httpStatus: number
    let message: string

    switch (errorCode) {
        case 'LIMIT_PART_COUNT':
            httpStatus = 413 // Request Entity Too Large
            message = 'Too many parts in the request'
            break
        case 'LIMIT_FILE_SIZE':
            httpStatus = 413 // Request Entity Too Large
            message = 'File size exceeds the limit'
            break
        case 'LIMIT_FILE_COUNT':
            httpStatus = 413 // Request Entity Too Large
            message = 'Too many files in the request'
            break
        case 'LIMIT_FIELD_KEY':
        case 'LIMIT_FIELD_VALUE':
        case 'LIMIT_FIELD_COUNT':
            httpStatus = 400 // Bad Request
            message = 'Invalid field in the request'
            break
        case 'LIMIT_UNEXPECTED_FILE':
            httpStatus = 400 // Bad Request
            message = 'Unexpected file in the request'
            break
        default:
            httpStatus = 500 // Internal Server Error
            message = 'Internal Server Error'
    }

    return { httpStatus, message }
}

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof ValidationError) {
        return res.status(400).json({ status: 'error', message: error.message, error: error.details })
    }

    if (error instanceof MulterError) {
        const customError = translateMulterError(error.code)

        if (customError.httpStatus !== 500) {
            return res.status(customError.httpStatus).json({ status: 'error', message: customError.message })
        }
    }

    return res.status(500).json({
        status: 'error',
        message: 'internal server error',
        error: {
            ...error,
            message: error.message,
            context: error.name,
        },
    })
}
