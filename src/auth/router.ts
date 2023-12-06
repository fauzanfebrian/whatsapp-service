import { Router } from 'express'
import { WA_AUTH_METHOD } from 'src/config/config'
import { getAllSessions } from './controller'

const authRouter = Router()

authRouter.use((_req, res, next) => {
    if (WA_AUTH_METHOD === 'file') {
        return res.status(500).json({
            status: 'error',
            message: 'Authentication is not using a database session',
        })
    }

    return next()
})

authRouter.get('sessions', getAllSessions)

export default authRouter
