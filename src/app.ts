import express from 'express'
import sendRouter from './router/send'
import { errorHandler } from './util/handler'
import { logout, printQR, status } from './whatsapp/controller'
import authRouter from './auth/router'

const app = express()

app.use(express.json())

app.get('/status', status)
app.get('/qr-code', printQR)
app.delete('/logout', logout)

app.use('/send', sendRouter)
app.use('/auth', authRouter)

app.use(errorHandler)

export default app
