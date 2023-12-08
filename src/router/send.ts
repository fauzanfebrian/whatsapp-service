import { Router } from 'express'
import multer from 'multer'
import { sendContact, sendImage, sendLocation, sendText } from 'src/whatsapp/controller'

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const sendRouter = Router()

sendRouter.post('/text', sendText)
sendRouter.post('/contact', sendContact)
sendRouter.post('/location', sendLocation)

sendRouter.post('/file', upload.fields([{ name: 'file', maxCount: 1 }]), sendImage)

export default sendRouter
