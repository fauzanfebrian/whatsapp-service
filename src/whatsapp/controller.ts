import { Handler } from 'express'
import QRCode from 'qrcode'
import { joiValidate } from 'src/util/validator'
import { SendContactDto, SendFileDto, SendLocationDto, SendTextDto } from './dto/message.dto'
import whatsappService from './service'
import { sendContactValidator, sendFileValidator, sendLocationValidator, sendTextValidator } from './validator/message'

export const status: Handler = (_req, res, next) => {
    try {
        const status = whatsappService.getStatus()

        res.json(status)
    } catch (error) {
        next(error)
    }
}

export const printQR: Handler = async (_req, res, next) => {
    try {
        const { qrcode, isConnected } = whatsappService.getStatus()

        if (isConnected) {
            return res.status(400).json({ status: 'error', message: 'whatsapp has been connected' })
        }

        if (!qrcode && !isConnected) {
            return res.status(500).json({ status: 'error', message: 'qrcode not generated yet' })
        }

        const buffer = await QRCode.toBuffer(qrcode)

        res.setHeader('Content-Type', 'image/png')

        return res.send(buffer)
    } catch (error) {
        next(error)
    }
}

export const logout: Handler = async (_req, res, next) => {
    try {
        const data = await whatsappService.logout()

        return res.json({ message: 'success', data })
    } catch (error) {
        next(error)
    }
}

export const sendText: Handler = async (req, res, next) => {
    try {
        const dto = await joiValidate<SendTextDto>(sendTextValidator, req.body)

        const data = await whatsappService.sendText(dto)

        return res.json({ status: 'success', data })
    } catch (error) {
        next(error)
    }
}

export const sendContact: Handler = async (req, res, next) => {
    try {
        const dto = await joiValidate<SendContactDto>(sendContactValidator, req.body)

        const data = await whatsappService.sendContact(dto)

        return res.json({ status: 'success', data })
    } catch (error) {
        next(error)
    }
}

export const sendLocation: Handler = async (req, res, next) => {
    try {
        const dto = await joiValidate<SendLocationDto>(sendLocationValidator, req.body)

        const data = await whatsappService.sendLocation(dto)

        return res.json({ status: 'success', data })
    } catch (error) {
        next(error)
    }
}

export const sendImage: Handler = async (req, res, next) => {
    try {
        const file: (typeof req)['file'] = req.files['file']?.[0]

        const dto = await joiValidate<SendFileDto>(sendFileValidator, {
            file: file?.buffer,
            fileName: file?.originalname,
            mimetype: file?.mimetype,
            ...req.body,
        })

        const data = await whatsappService.sendFile(dto)

        return res.json({ status: 'success', data })
    } catch (error) {
        next(error)
    }
}
