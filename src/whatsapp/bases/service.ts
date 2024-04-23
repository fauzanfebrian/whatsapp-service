import makeWASocket, {
    AnyMessageContent,
    AuthenticationState,
    ConnectionState,
    Contact,
    DisconnectReason,
    MessageUpsertType,
    MiscMessageGenerationOptions,
    delay,
    fetchLatestBaileysVersion,
    jidDecode,
    jidNormalizedUser,
    promiseTimeout,
} from '@whiskeysockets/baileys'
import { pino } from 'pino'
import QRCodeTerminal from 'qrcode-terminal'
import { QR_TERMINAL } from 'src/config/config'
import { extractViewOnce, formatToJid, sanitizePhoneNumber } from 'src/util/baileys'
import { SendContactDto, SendFileDto, SendLocationDto, SendTextDto } from '../dto/message.dto'
import {
    AuthState,
    GroupData,
    StatusWhatsappService,
    WhatsappError,
    WhatsappMessage,
    WhatsappMessageUpdate,
    WhatsappSocket,
} from '../interface'
import { MediaMessage } from './media'

export abstract class WhatsappBaseService {
    protected contactConnected: Contact
    protected socket: WhatsappSocket
    protected qrcode: string

    constructor(
        protected serviceName = 'Whatsapp Service',
        protected serviceVersion = '0.0.1',
    ) {}

    async initialize() {
        if (this.socket) {
            return
        }
        this.socket = await this.createNewSocket()
        console.log(`Whatsapp service "${this.serviceName}" v${this.serviceVersion} ready`)
    }

    async reInitialize() {
        this.socket.ev.removeAllListeners('connection.update')
        this.socket.ev.removeAllListeners('creds.update')
        this.socket.ev.removeAllListeners('messages.upsert')
        this.socket.ev.removeAllListeners('messages.update')

        this.socket = await this.createNewSocket()

        console.log(`Reinitialize Whatsapp service "${this.serviceName}" v${this.serviceVersion}`)
    }

    async groupData(id: string) {
        if (!id.endsWith('@g.us')) {
            id = `${id}@g.us`
        }
        try {
            const group: GroupData = await this.socket.groupMetadata(id)

            if (!group) {
                return null
            }

            group.participants = await Promise.all(
                group.participants?.map(async participant => {
                    try {
                        participant.imgUrl = await this.socket.profilePictureUrl(participant.id, 'image')
                        return participant
                    } catch {
                        return participant
                    }
                }),
            )

            return group
        } catch (error) {
            return null
        }
    }

    async sendText(dto: SendTextDto) {
        return this.sendMessage(dto.sendTo, { text: dto.message })
    }

    async sendContact(dto: SendContactDto) {
        const waid = sanitizePhoneNumber(dto.phoneNumber)

        const vcard = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${dto.name}`,
            `TEL;type=CELL;type=VOICE;waid=${waid}:${dto.phoneNumber}`,
            'END:VCARD',
        ].join('\n')

        return this.sendMessage(dto.sendTo, {
            contacts: {
                displayName: dto.name,
                contacts: [{ vcard }],
            },
        })
    }

    async sendLocation(dto: SendLocationDto) {
        return this.sendMessage(dto.sendTo, {
            location: { degreesLatitude: dto.lat, degreesLongitude: dto.long },
        })
    }

    async sendFile(dto: SendFileDto) {
        return this.sendMessage(dto.sendTo, {
            document: dto.file,
            caption: dto.caption,
            fileName: dto.fileName,
            mimetype: dto.mimetype,
        })
    }

    async sendImage(dto: SendFileDto) {
        return this.sendMessage(dto.sendTo, {
            image: dto.file,
            caption: dto.caption,
        })
    }

    async convertAndSendSticker(message: WhatsappMessage) {
        if (formatToJid(message?.key?.remoteJid) === formatToJid(this.contactConnected.id)) {
            return false
        }

        const media = new MediaMessage(message)

        const sticker = await media.extractStickerMedia(`${this.serviceName} X ${message.pushName}`, this.serviceName)
        if (!sticker) {
            return false
        }

        console.log(`Sending sticker to ${sticker.targetJid}`)
        await this.sendMessage(sticker.targetJid, sticker.message, { quoted: message })
        return true
    }

    async downloadViewOnce(message: WhatsappMessage) {
        const media = new MediaMessage(message)

        const viewOnce = await media.extractViewOnceMedia()
        if (!viewOnce) {
            return false
        }

        console.log(`Sending view once media to ${viewOnce.targetJid}`)
        await this.sendMessage(viewOnce.targetJid, viewOnce.message, { quoted: message })
        return true
    }

    async forwardViewOnce(message: WhatsappMessage) {
        const forwardMessage = extractViewOnce(message)
        if (!forwardMessage || !this.contactConnected.id) {
            return false
        }

        // saveMessageMediaToPublic(message)

        const targetJid = jidNormalizedUser(this.contactConnected.id)
        console.log(`Forward view once to ${targetJid}`)
        await this.sendMessage(targetJid, { forward: forwardMessage }, { quoted: message })
        return true
    }

    protected abstract removeSession(): Promise<void>

    async logout() {
        this.checkIsConnected()

        await this.socket.logout()

        await this.removeSession()

        delete this.contactConnected
        await this.reInitialize()

        return true
    }

    getStatus(): StatusWhatsappService {
        return {
            isConnected: !this.qrcode && !!this.contactConnected?.id,
            contactConnected: this.contactConnected,
            qrcode: this.qrcode,
        }
    }

    protected async sendMessage(
        phoneNumber: string,
        content: AnyMessageContent,
        options?: MiscMessageGenerationOptions,
        recursive?: number,
    ): Promise<WhatsappMessage> {
        try {
            this.checkIsConnected()

            // create 1 minute timeout for whatsapp send message
            return await promiseTimeout(1000 * 15, async (resolve, reject) => {
                try {
                    const jid = formatToJid(phoneNumber)
                    await this.socket.presenceSubscribe(jid)
                    await delay(1 * 1000)
                    await this.socket.sendPresenceUpdate('composing', jid)
                    await delay(2 * 1000)
                    await this.socket.sendPresenceUpdate('paused', jid)
                    await delay(1 * 1000)
                    const message = await this.socket.sendMessage(jid, content, options)
                    resolve(message)
                } catch (error) {
                    reject(error)
                }
            })
        } catch (error) {
            // check if can reload and the recursive not at maximum
            if (this.isShouldResend(error) && (recursive || 0) < 20) {
                await delay(500)
                return await this.sendMessage(phoneNumber, content, options, (recursive || 0) + 1)
            }

            throw error
        }
    }

    protected abstract makeAuthState(): Promise<AuthState>

    private async createNewSocket(): Promise<WhatsappSocket> {
        const { state, saveCreds } = await this.makeAuthState()
        const { version } = await fetchLatestBaileysVersion()

        const socket = makeWASocket({
            version: version,
            auth: state,
            logger: pino({ enabled: false }) as any,
            defaultQueryTimeoutMs: undefined,
            qrTimeout: 1000 * 60 * 60 * 24,
            browser: [this.serviceName, 'Desktop', this.serviceVersion],
            markOnlineOnConnect: false,
        })

        socket.ev.on('connection.update', update => this.onConnectionUpdate(socket, state, update))
        socket.ev.on('creds.update', saveCreds)
        socket.ev.on('messages.upsert', chats => this.onNewMessage(chats))
        socket.ev.on('messages.update', chats => this.onUpdateMessage(chats))

        return socket
    }

    protected newMessageListeners = async (message: WhatsappMessage): Promise<boolean[]> => {
        return await Promise.all([
            this.convertAndSendSticker(message),
            this.downloadViewOnce(message),
            // uncomment this if you want forward every view once come
            // this.forwardViewOnce(message),
        ])
    }

    private async onNewMessage(messages: { messages: WhatsappMessage[]; type: MessageUpsertType }) {
        return Promise.all(
            messages?.messages?.map(async message => {
                try {
                    await this.newMessageListeners(message)
                } catch (error) {
                    console.error(`new message listener error: ${error}`)
                }
            }),
        )
    }

    protected updateMessageListeners = async (message: WhatsappMessageUpdate): Promise<boolean[]> => {
        return await Promise.all([!!message])
    }

    private async onUpdateMessage(messages: WhatsappMessageUpdate[]) {
        return Promise.all(
            messages?.map(async message => {
                try {
                    await this.updateMessageListeners(message)
                } catch (error) {
                    console.error(`update message listener error: ${error}`)
                }
            }),
        )
    }

    private async onConnectionUpdate(
        socket: WhatsappSocket,
        state: AuthenticationState,
        update: Partial<ConnectionState>,
    ): Promise<void> {
        const { connection, lastDisconnect } = update

        this.qrcode = update.qr
        if (update.qr && QR_TERMINAL) {
            console.log('\n')
            QRCodeTerminal.generate(update.qr, { small: true })
            console.log('Scan QRCode to connect your whatsapp\n')
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error as any)?.output?.statusCode

            if (statusCode === DisconnectReason.loggedOut) {
                await this.removeSession()
                delete this.contactConnected

                console.log('Whatsapp logged out')
            }

            console.log(`Connection close (${statusCode}): ${lastDisconnect?.error}`)
            if (statusCode !== 403) {
                await this.reInitialize()
            }
            return
        }

        if (connection === 'open') {
            this.contactConnected = {
                ...state.creds.me,
                id: jidDecode(state.creds.me?.id)?.user,
            }
            delete this.qrcode

            await socket.sendPresenceUpdate('unavailable')

            console.log(`Whatsapp connected to ${this.contactConnected.id}`)
            return
        }
    }

    private checkIsConnected() {
        const status = this.getStatus()

        if (!status.isConnected) throw new WhatsappError('Whatsapp not connected yet')
    }

    private isShouldResend(error: any): boolean {
        if (error === 1006) return true

        const payload = error?.output?.payload

        if (!payload) return false

        return (
            payload.statusCode === 428 &&
            payload.error === 'Precondition Required' &&
            payload.message === 'Connection Closed'
        )
    }
}
