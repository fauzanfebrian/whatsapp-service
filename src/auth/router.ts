import { Router } from 'express'
import { WA_AUTH_METHOD } from 'src/config/config'
import { activateSession, deactivateSession, getAllSessions } from './controller'
import { responseJson } from 'src/util/response'
import { HttpStatus } from 'src/util/http-status'

const authRouter = Router()

authRouter.use((_req, res, next) => {
    if (WA_AUTH_METHOD === 'file') {
        return responseJson(res, 'authentication is not using a database session', HttpStatus.InternalServerError)
    }

    return next()
})

authRouter.get('/', getAllSessions)
authRouter.put('/:id/activate', activateSession)
authRouter.put('/:id/deactivate', deactivateSession)

export default authRouter
