import { Router } from 'express'
import multer from 'multer'
import { sendContact, sendFile, sendImage, sendLocation, sendText } from 'src/whatsapp/controller'

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const whatsappRouter = Router()

whatsappRouter.post('/text', sendText)
whatsappRouter.post('/contact', sendContact)
whatsappRouter.post('/location', sendLocation)

whatsappRouter.post('/file', upload.fields([{ name: 'file', maxCount: 1 }]), sendFile)
whatsappRouter.post('/image', upload.fields([{ name: 'file', maxCount: 1 }]), sendImage)

export default whatsappRouter
