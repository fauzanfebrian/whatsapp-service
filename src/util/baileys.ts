import { BufferJSON, jidNormalizedUser } from '@whiskeysockets/baileys'
import { WhatsappMessage } from 'src/whatsapp/interface'

export function sanitizePhoneNumber(number: string) {
    if (typeof number == 'undefined' || number == '') {
        return ''
    }

    number = number.split(':')[0]
    number = number.replace(/\D/g, '')

    if (number.startsWith('08')) {
        number = '62' + number.substring(1)
    }

    return number
}

export function formatToJid(number: string) {
    const jid = jidNormalizedUser(number)
    if (jid) {
        return jid
    }

    const sanitized = sanitizePhoneNumber(number)
    if (!sanitized) {
        return ''
    }

    return sanitized + '@s.whatsapp.net'
}

export function extractJidFromMessage(message: WhatsappMessage): string {
    const extract = () => {
        if (message?.quoted?.sendToJid?.endsWith('@s.whatsapp.net') || message?.quoted?.sendToJid?.endsWith('@g.us')) {
            return message.quoted.sendToJid
        }
        if (message?.key?.remoteJid?.endsWith('@s.whatsapp.net')) {
            return message.key.remoteJid
        }
        if (message?.key?.participant?.endsWith('@s.whatsapp.net') && message?.key?.remoteJid?.endsWith('@g.us')) {
            return message.key.remoteJid
        }
        return ''
    }
    return formatToJid(extract())
}

export function getCaptionAttribute(caption: string, attr: string): string {
    if (!caption?.includes(`${attr}:`)) return ''

    const attrRegex = new RegExp(`.*${attr}:`, 'g')
    return caption.split(attrRegex)[1]?.split('\n')[0]?.trim()
}

export function prepareDataToWrite<T>(value: T): T {
    return JSON.parse(JSON.stringify(value, BufferJSON.replacer))
}

export function prepareDataToRead<T>(value: T): T {
    return JSON.parse(JSON.stringify(value), BufferJSON.reviver)
}

export function extractViewOnce(message: WhatsappMessage): WhatsappMessage {
    message = JSON.parse(JSON.stringify(message))

    const viewOnce = message?.message?.viewOnceMessage || message?.message?.viewOnceMessageV2
    if (!viewOnce) {
        return null
    }

    for (const key in viewOnce.message) {
        const data = viewOnce.message[key]
        if (data?.viewOnce) {
            data.viewOnce = false
        }
    }
    message.message = viewOnce.message

    return message
}

export function parseTimeStamp(message: WhatsappMessage): string {
    if (typeof message.messageTimestamp !== 'number') return ''

    const date = new Date(message.messageTimestamp * 1000) // Multiply by 1000 to convert from seconds to milliseconds

    const formattedDate = [
        date.getDate().toString().padStart(2, '0'),
        (date.getMonth() + 1).toString().padStart(2, '0'), // Months are zero-based
        date.getFullYear(),
    ].join('/')

    const formattedTime = [
        date.getHours().toString().padStart(2, '0'),
        date.getMinutes().toString().padStart(2, '0'),
        date.getSeconds().toString().padStart(2, '0'),
    ].join(':')

    return `${formattedDate} ${formattedTime}`
}
