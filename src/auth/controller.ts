import { Handler } from 'express'
import authService from './service'
import { responseJson } from 'src/util/response'

export const getAllSessions: Handler = async (_req, res, next) => {
    try {
        const data = await authService.getSessions()
        return responseJson(res, data)
    } catch (error) {
        next(error)
    }
}
