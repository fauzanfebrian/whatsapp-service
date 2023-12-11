import express from 'express'
import authRouter from './auth/router'
import { errorHandler } from './util/handler'
import { logout, printQR, status } from './whatsapp/controller'
import whatsappRouter from './whatsapp/router'

const app = express()

app.use(express.json())

app.get('/status', status)
app.get('/qr-code', printQR)
app.delete('/logout', logout)

app.use('/send', whatsappRouter)
app.use('/auth', authRouter)

app.use(errorHandler)

export default app
