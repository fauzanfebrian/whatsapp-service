import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { STICKER_PASSWORD } from 'src/config/config'
import Sticker, { StickerTypes } from 'wa-sticker-formatter'
import { WhatsappMessage } from '../interface'

interface ExtractStickerMediaData {
    media: Buffer
    targetJid: string
}

export class MediaMessage {
    constructor(private message: WhatsappMessage) {}

    async extractStickerMedia(pack: string, author?: string): Promise<ExtractStickerMediaData | null> {
        const targetJid = this.extractJidFromMessage()

        if (!this.shouldConvertSticker() || !targetJid) {
            return null
        }

        const media = await downloadMediaMessage(this.message, 'buffer', {})

        const sticker = new Sticker(media as Buffer, {
            quality: 50,
            type: StickerTypes.CROPPED,
            author,
            pack,
        })
        const buffer = await sticker.toBuffer()

        return { targetJid, media: buffer }
    }

    private getMessageMedia(message: WhatsappMessage['message']) {
        if (message?.imageMessage) {
            return message.imageMessage
        }
        // if (message?.videoMessage && message.videoMessage.seconds <= 10) {
        //     return message.videoMessage
        // }

        return null
    }

    private getCaptionAttribute(caption: string, attr: string): string {
        if (!caption?.includes(`${attr}:`)) return ''

        const attrRegex = new RegExp(`.*${attr}:`, 'g')
        return caption.split(attrRegex)[1]?.split('\n')[0]?.trim()
    }

    private checkPassword(caption: string): boolean {
        if (!STICKER_PASSWORD) return true

        return this.getCaptionAttribute(caption, 'password') === STICKER_PASSWORD
    }

    private checkQuotedMessage(): string {
        const quoMessage = this.message?.message?.extendedTextMessage?.contextInfo

        const media = this.getMessageMedia(quoMessage?.quotedMessage)
        if (!media) return ''

        if (quoMessage.quotedMessage.videoMessage) {
            this.message.message.videoMessage = quoMessage.quotedMessage.videoMessage
        } else {
            this.message.message.imageMessage = quoMessage.quotedMessage.imageMessage
        }

        let caption = this.message.message.extendedTextMessage.text.toLowerCase().trim()
        const destination = this.getCaptionAttribute(caption, 'destination')
        if (destination === 'sender') {
            this.message.sendToJid = quoMessage.participant
            caption = caption.replace('destination:sender', '')
        }

        delete this.message.message.extendedTextMessage

        return caption
    }

    private extractJidFromMessage(): string {
        if (this.message?.sendToJid?.includes('@s.whatsapp.net')) {
            return this.message.sendToJid
        }
        if (this.message?.key?.remoteJid?.includes('@s.whatsapp.net')) {
            return this.message.key.remoteJid
        }
        if (
            this.message?.key?.participant?.includes('@s.whatsapp.net') &&
            this.message?.key?.remoteJid?.includes('@g.us')
        ) {
            return this.message.key.participant
        }

        return ''
    }

    private shouldConvertSticker(): boolean {
        const media = this.getMessageMedia(this.message.message)
        let caption = (media?.caption || '').toLowerCase().trim()

        const quotedCaption = this.checkQuotedMessage()
        if (quotedCaption) {
            caption = quotedCaption
        }

        if (!caption.startsWith('#convert_sticker') && !caption.startsWith('#sticker')) {
            return false
        }

        return this.checkPassword(caption)
    }
}
