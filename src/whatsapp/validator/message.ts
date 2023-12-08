import joi from 'joi'
import { SendContactDto, SendFileDto, SendLocationDto, SendTextDto } from '../dto/message.dto'

export const sendTextValidator = joi.object<SendTextDto>({
    message: joi.string().required(),
    sendTo: joi.string().required(),
})

export const sendContactValidator = joi.object<SendContactDto>({
    name: joi.string().required(),
    phoneNumber: joi.string().required(),
    sendTo: joi.string().required(),
})

export const sendLocationValidator = joi.object<SendLocationDto>({
    lat: joi.number().required(),
    long: joi.number().required(),
    sendTo: joi.string().required(),
})

export const sendFileValidator = joi.object<SendFileDto>({
    caption: joi.string().optional().allow(''),
    sendTo: joi.string().required(),
    file: joi.binary().encoding('utf-8').required(),
    fileName: joi.string().required(),
    mimetype: joi.string().required(),
})
