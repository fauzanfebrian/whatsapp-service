import makeWASocket, {
    Contact,
    delay,
    DisconnectReason,
    fetchLatestBaileysVersion,
    promiseTimeout,
    useMultiFileAuthState,
} from '@adiwajshing/baileys'
import * as fs from 'fs'
import * as path from 'path'
import pino from 'pino'
import { SendMessageDto } from './dto/send-message.dto'
import { WhatsappError, WhatsappSocket } from './interface'

export class WhatsappService {
    private session_directory = 'whatsapp_session'
    private contactConnected: Contact
    private socket: WhatsappSocket
    private qrcode: string

    constructor(private serviceName = 'Whatsapp Service', private serviceVersion = '0.0.1') {
        this.init()
    }

    async init() {
        if (this.socket) return
        this.socket = await this.createNewSocket()
    }

    async sendMessage(dto: SendMessageDto, recursive?: number): Promise<boolean> {
        try {
            const status = this.getStatus()

            if (!status.isConnected) throw new WhatsappError('Whatsapp not connected yet')

            // create 1 minute timeout for whatsapp send message
            await promiseTimeout(60000, async (resolve, reject) => {
                try {
                    const jid = this.formatToWhatsappJid(dto.phone_number)
                    await this.socket.presenceSubscribe(jid)
                    await delay(3)
                    await this.socket.sendPresenceUpdate('composing', jid)
                    await delay(3)
                    await this.socket.sendPresenceUpdate('paused', jid)
                    await delay(3)
                    await this.socket.sendMessage(jid, { text: dto.message })
                    resolve(true)
                } catch (error) {
                    reject(error)
                }
            })

            return true
        } catch (error) {
            const payload = error?.output?.payload

            // is can reload or not
            const reload =
                error === 1006 ||
                (payload?.statusCode === 428 &&
                    payload?.error === 'Precondition Required' &&
                    payload?.message === 'Connection Closed')

            // check if can reload and the recursive not at maximum
            if (reload && (recursive || 0) < 20) {
                await delay(500)
                return await this.sendMessage(dto, (recursive || 0) + 1)
            }

            throw error
        }
    }

    getStatus(): {
        isConnected: boolean
        contactConnected?: Contact | undefined
        qrcode?: string | undefined
    } {
        return {
            isConnected: !this.qrcode && !!this.contactConnected?.id,
            contactConnected: this.contactConnected,
            qrcode: this.qrcode,
        }
    }

    async logout() {
        const status = this.getStatus()

        if (!status.isConnected) throw new WhatsappError('Whatsapp not connected yet')

        await this.socket.logout()

        this.removeSession()

        delete this.contactConnected
        this.socket = await this.createNewSocket()

        return true
    }

    private async createNewSocket() {
        const { state, saveCreds } = await useMultiFileAuthState(this.session_directory)
        const { version } = await fetchLatestBaileysVersion()

        const socket = makeWASocket({
            version: version,
            auth: state,
            logger: pino({ enabled: false }),
            defaultQueryTimeoutMs: undefined,
            qrTimeout: 1000 * 60 * 60 * 24,
            browser: [this.serviceName, 'Desktop', this.serviceVersion],
        })

        // autoreconnect
        socket.ev.on('connection.update', async update => {
            const { connection, lastDisconnect, qr } = update

            if (connection == 'close') {
                const statusCode = (lastDisconnect?.error as any)?.output.statusCode

                if (statusCode === DisconnectReason.loggedOut) {
                    this.removeSession()
                    delete this.contactConnected
                    this.socket = await this.createNewSocket()
                }

                if (statusCode !== DisconnectReason.loggedOut) this.socket = await this.createNewSocket()
            } else if (connection === 'open') {
                // saat connection open, ambil nomor hp yang sedang terkoneksi
                this.contactConnected = { ...state.creds.me }
                this.contactConnected.id = this.formatToIndonesian(this.contactConnected?.id)
                delete this.qrcode
            }

            if (qr) this.qrcode = qr
        })

        socket.ev.on('creds.update', saveCreds)

        return socket
    }

    private formatToIndonesian(number: string) {
        if (typeof number == 'undefined' || number == '') {
            return ''
        }

        number = number.split(':')[0]
        number = number.replace(/\D/g, '')
        if (number.startsWith('+')) {
            number = number.substring(1)
        }
        if (number.startsWith('62')) {
            number = '0' + number.substring(2)
        }
        return number
    }

    private formatToWhatsappJid(number: string) {
        if (typeof number == 'undefined' || number == '') {
            return ''
        }

        number = number.replace(/\D/g, '')
        if (number.startsWith('+')) {
            number = number.substring(1)
        }
        if (number.startsWith('08')) {
            number = '62' + number.substring(1)
        }
        if (!number.endsWith('@s.whatsapp.net')) {
            number = number + '@s.whatsapp.net'
        }
        return number
    }

    private removeSession() {
        fs.rmSync(path.resolve(process.cwd(), this.session_directory), { recursive: true, force: true })
    }
}
