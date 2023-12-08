import { jidNormalizedUser } from '@whiskeysockets/baileys'

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
