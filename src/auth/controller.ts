import { Handler } from 'express'
import { responseJson } from 'src/util/response'
import { joiValidateNumber } from 'src/util/validator'
import authService from './service'

export const getAllSessions: Handler = async (_req, res, next) => {
    try {
        const data = await authService.getSessions()
        return responseJson(res, data)
    } catch (error) {
        next(error)
    }
}

export const activateSession: Handler = async (req, res, next) => {
    try {
        const id = await joiValidateNumber(req.params.id)
        const data = await authService.activateSession(id)
        return responseJson(res, data)
    } catch (error) {
        next(error)
    }
}

export const deactivateSession: Handler = async (req, res, next) => {
    try {
        const id = await joiValidateNumber(req.params.id)
        const data = await authService.deactivateSession(id)
        return responseJson(res, data)
    } catch (error) {
        next(error)
    }
}
