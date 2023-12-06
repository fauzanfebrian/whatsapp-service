import makeWASocket, { Contact, proto } from '@whiskeysockets/baileys'

export interface WhatsappSocket extends ReturnType<typeof makeWASocket> {}

export class WhatsappError extends Error {
    constructor(error: string) {
        super(error)
    }
}

export interface StatusWhatsappService {
    isConnected: boolean
    contactConnected?: Contact
    qrcode?: string
}

export interface WhatsappMessage extends proto.IWebMessageInfo {
    sendToJid?: string
}
