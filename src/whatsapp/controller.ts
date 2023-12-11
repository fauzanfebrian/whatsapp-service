import { Handler } from 'express'
import QRCode from 'qrcode'
import { HttpStatus } from 'src/util/http-status'
import { responseJson } from 'src/util/response'
import { joiValidate } from 'src/util/validator'
import whatsappService from './service'
import { sendContactValidator, sendFileValidator, sendLocationValidator, sendTextValidator } from './validator/message'

export const status: Handler = (_req, res, next) => {
    try {
        const status = whatsappService.getStatus()
        return responseJson(res, status)
    } catch (error) {
        next(error)
    }
}

export const printQR: Handler = async (_req, res, next) => {
    try {
        const { qrcode, isConnected } = whatsappService.getStatus()

        if (isConnected) {
            return responseJson(res, 'whatsapp has been connected', HttpStatus.BadRequest)
        }

        if (!qrcode && !isConnected) {
            return responseJson(res, 'qrcode not generated yet', HttpStatus.InternalServerError)
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
        return responseJson(res, data)
    } catch (error) {
        next(error)
    }
}

export const sendText: Handler = async (req, res, next) => {
    try {
        const dto = await joiValidate(sendTextValidator, req.body)

        const data = await whatsappService.sendText(dto)
        return responseJson(res, data)
    } catch (error) {
        next(error)
    }
}

export const sendContact: Handler = async (req, res, next) => {
    try {
        const dto = await joiValidate(sendContactValidator, req.body)

        const data = await whatsappService.sendContact(dto)
        return responseJson(res, data)
    } catch (error) {
        next(error)
    }
}

export const sendLocation: Handler = async (req, res, next) => {
    try {
        const dto = await joiValidate(sendLocationValidator, req.body)

        const data = await whatsappService.sendLocation(dto)
        return responseJson(res, data)
    } catch (error) {
        next(error)
    }
}

export const sendFile: Handler = async (req, res, next) => {
    try {
        const file: Express.Multer.File = req.files['file']?.[0]

        const dto = await joiValidate(sendFileValidator, {
            file: file?.buffer,
            fileName: file?.originalname,
            mimetype: file?.mimetype,
            ...req.body,
        })

        const data = await whatsappService.sendFile(dto)
        return responseJson(res, data)
    } catch (error) {
        next(error)
    }
}

export const sendImage: Handler = async (req, res, next) => {
    try {
        const file: Express.Multer.File = req.files['file']?.[0]

        const dto = await joiValidate(sendFileValidator, {
            file: file?.buffer,
            fileName: file?.originalname,
            mimetype: file?.mimetype,
            ...req.body,
        })

        const data = await whatsappService.sendImage(dto)
        return responseJson(res, data)
    } catch (error) {
        next(error)
    }
}
