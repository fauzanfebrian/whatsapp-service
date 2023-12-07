import { downloadMediaMessage, proto } from '@whiskeysockets/baileys'
import { STICKER_PASSWORD } from 'src/config/config'
import Sticker, { StickerTypes } from 'wa-sticker-formatter'
import { WhatsappMessage } from '../interface'

interface ExtractStickerMediaData {
    media: Buffer
    targetJid: string
}

interface ValueMessageMedia {
    media: proto.Message.IImageMessage | proto.Message.IVideoMessage
    type: 'image' | 'video'
    viewOnce: boolean
}

export class MediaMessage {
    private message: WhatsappMessage

    constructor(message: WhatsappMessage) {
        this.message = JSON.parse(JSON.stringify(message))
    }

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

    async extractViewOnceMedia(): Promise<{ media: Buffer; type: 'image' | 'video'; targetJid: string } | null> {
        const targetJid = this.extractJidFromMessage()

        if (!this.shouldConvertViewOnceMedia() || !targetJid) {
            return null
        }

        const media = await downloadMediaMessage(this.message, 'buffer', {})

        return { targetJid, media: media as Buffer, type: this.getMessageMedia(this.message.message)?.type }
    }

    private getMessageMedia(message: WhatsappMessage['message']): ValueMessageMedia {
        if (message?.imageMessage) {
            return { media: message.imageMessage, type: 'image', viewOnce: false }
        }
        if (message?.viewOnceMessageV2?.message?.imageMessage) {
            return { media: message?.viewOnceMessageV2?.message?.imageMessage, type: 'image', viewOnce: true }
        }
        if (message?.viewOnceMessageV2?.message?.videoMessage) {
            return { media: message?.viewOnceMessageV2?.message?.imageMessage, type: 'video', viewOnce: true }
        }
        if (message?.videoMessage) {
            return { media: message.videoMessage, type: 'video', viewOnce: false }
        }

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

        let caption = this.message.message.extendedTextMessage.text.toLowerCase().trim()
        const destination = this.getCaptionAttribute(caption, 'destination')
        if (destination === 'sender') {
            this.message.sendToJid = quoMessage.participant
            caption = caption.replace('destination:sender', '')
        }

        const message = quoMessage.quotedMessage
        this.message.message = message

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
        let caption = this.getMessageMedia(this.message.message)?.media?.caption?.toLowerCase()?.trim?.()

        const quotedCaption = this.checkQuotedMessage()
        if (quotedCaption) {
            caption = quotedCaption
        }

        // check after quoted checked
        if (this.getMessageMedia(this.message.message)?.type !== 'image') {
            return false
        }

        if (!caption?.startsWith('#convert_sticker') && !caption?.startsWith('#sticker')) {
            return false
        }

        return this.checkPassword(caption)
    }

    private shouldConvertViewOnceMedia(): boolean {
        const caption = this.checkQuotedMessage()

        if (!this.getMessageMedia(this.message.message)?.viewOnce) {
            return false
        }

        if (!caption?.startsWith('#download_view_once')) {
            return false
        }

        return this.checkPassword(caption)
    }
}
