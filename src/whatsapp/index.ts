import makeWASocket, {
    AuthenticationState,
    ConnectionState,
    Contact,
    delay,
    DisconnectReason,
    fetchLatestBaileysVersion,
    promiseTimeout,
    useMultiFileAuthState,
} from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'
import pino from 'pino'
import { SendMessageDto } from './dto/send-message.dto'
import { StatusWhatsappService, WhatsappError, WhatsappSocket } from './interface'
import QRCodeTerminal from 'qrcode-terminal'

export class WhatsappService {
    private session_directory = 'sessions'
    private contactConnected: Contact
    private socket: WhatsappSocket
    private qrcode: string

    constructor(private serviceName = 'Whatsapp Service', private serviceVersion = '0.0.1') {}

    async init() {
        if (this.socket) return
        this.socket = await this.createNewSocket()
    }

    async sendMessage(dto: SendMessageDto, recursive?: number): Promise<boolean> {
        try {
            this.checkIsConnected()

            // create 1 minute timeout for whatsapp send message
            await promiseTimeout(60000, async (resolve, reject) => {
                try {
                    const jid = this.formatToWhatsappJid(dto.phoneNumber)
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
            // check if can reload and the recursive not at maximum
            if (this.isShouldResend(error) && (recursive || 0) < 20) {
                await delay(500)
                return await this.sendMessage(dto, (recursive || 0) + 1)
            }

            throw error
        }
    }

    async logout() {
        this.checkIsConnected()

        await this.socket.logout()

        this.removeSession()

        delete this.contactConnected
        this.socket = await this.createNewSocket()

        return true
    }

    getStatus(): StatusWhatsappService {
        return {
            isConnected: !this.qrcode && !!this.contactConnected?.id,
            contactConnected: this.contactConnected,
            qrcode: this.qrcode,
        }
    }

    private async createNewSocket(): Promise<WhatsappSocket> {
        const { state, saveCreds } = await useMultiFileAuthState(this.session_directory)
        const { version } = await fetchLatestBaileysVersion()

        const socket = makeWASocket({
            version: version,
            auth: state,
            logger: pino({ enabled: false }),
            defaultQueryTimeoutMs: undefined,
            qrTimeout: 1000 * 60 * 60 * 24,
            browser: [this.serviceName, 'Desktop', this.serviceVersion],
            markOnlineOnConnect: false,
        })

        // listener
        socket.ev.on('connection.update', update => this.onConnectionUpdate(socket, state, update))
        socket.ev.on('creds.update', saveCreds)

        return socket
    }

    private async onConnectionUpdate(
        socket: WhatsappSocket,
        state: AuthenticationState,
        update: Partial<ConnectionState>
    ): Promise<void> {
        const { connection, lastDisconnect } = update

        this.qrcode = update.qr
        if (update.qr && process.env.QR_TERMINAL === 'true') {
            console.log('\n')
            QRCodeTerminal.generate(update.qr, { small: true })
            console.log('Scan QRCode to connect your whatsapp\n')
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error as any)?.output?.statusCode

            if (statusCode === DisconnectReason.loggedOut) {
                this.removeSession()
                delete this.contactConnected

                console.log('Whatsapp logged out')
            }

            this.socket = await this.createNewSocket()
            return
        }

        if (connection === 'open') {
            const user = { ...state.creds.me }
            user.id = this.formatToIndonesian(user?.id)

            this.contactConnected = user
            await socket.sendPresenceUpdate('unavailable')
            delete this.qrcode

            console.log(`Whatsapp connected to ${user.id}`)
            return
        }
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
        try {
            fs.rmSync(path.resolve(process.cwd(), this.session_directory), { recursive: true, force: true })
        } catch {}
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

const whatsapp = new WhatsappService()

export default whatsapp
