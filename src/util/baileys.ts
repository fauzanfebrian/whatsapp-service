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
