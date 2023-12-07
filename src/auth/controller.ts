import { Handler } from 'express'
import { responseJson } from 'src/util/response'
import { joiValidateNumber } from 'src/util/validator'
import authService from './service'
import { HttpStatus } from 'src/util/http-status'

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

        if (!data) {
            return responseJson(res, 'session already active', HttpStatus.Forbidden)
        }

        return responseJson(res, data)
    } catch (error) {
        next(error)
    }
}

export const deactivateSession: Handler = async (req, res, next) => {
    try {
        const id = await joiValidateNumber(req.params.id)
        const data = await authService.deactivateSession(id)

        if (!data) {
            return responseJson(res, 'session not active yet', HttpStatus.Forbidden)
        }

        return responseJson(res, data)
    } catch (error) {
        next(error)
    }
}
