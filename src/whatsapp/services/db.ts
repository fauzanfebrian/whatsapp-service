import {
    AuthenticationCreds,
    SignalDataSet,
    SignalDataTypeMap,
    initAuthCreds,
    isJidGroup,
    proto,
} from '@whiskeysockets/baileys'
import { AuthCredential } from 'src/auth/entities/credential'
import authService from 'src/auth/service'
import {
    deepCopy,
    extractViewOnce,
    formatToJid,
    isValidMessageSend,
    parseTimeStamp,
    sanitizePhoneNumber,
} from 'src/util/baileys'
import whatsappMessageService from '../bases/message'
import { WhatsappBaseService } from '../bases/service'
import { AuthState, WhatsappMessage, WhatsappMessageUpdate } from '../interface'

export class WhatsappServiceDBAuth extends WhatsappBaseService {
    private credential: AuthCredential

    protected async makeAuthState(): Promise<AuthState> {
        const credential = await authService.getActiveCredential()
        const creds: AuthenticationCreds = credential?.value || initAuthCreds()

        this.credential = credential

        return {
            state: {
                creds,
                keys: {
                    get: (type, ids) => this.getStateData(type, ids),
                    set: data => this.setStateData(data),
                },
            },
            saveCreds: async () => {
                await authService.saveCredential(credential, creds)
            },
        }
    }

    protected async removeSession(): Promise<void> {
        await authService.removeActiveCredential()
    }

    async saveMessage(message: WhatsappMessage) {
        const jid = formatToJid(message?.key?.participant || message?.key?.remoteJid)

        if (
            !isValidMessageSend(message.key) ||
            !jid ||
            message.key.fromMe ||
            !message.message ||
            message.message.protocolMessage
        ) {
            return false
        }

        await whatsappMessageService.createMessage(this.credential, message.key, message)
        return true
    }

    async sendDeletedMessage(key: proto.IMessageKey, recursive?: number): Promise<boolean> {
        const jid = formatToJid(key?.participant || key?.remoteJid)

        // set recursive set to 6 time because each recursive 5 second so in 30 seconds function will stop
        if (recursive > 6 || !isValidMessageSend(key) || !jid || key.fromMe) {
            return false
        }

        const waMessage = await whatsappMessageService.getMessage(this.credential, key)
        if (!waMessage) {
            setTimeout(() => this.sendDeletedMessage(key, (recursive || 0) + 1), 1000 * 5)
            return false
        }

        const forwardMessage = extractViewOnce(waMessage) || deepCopy(waMessage)
        const messageResult = await this.sendMessage(
            this.contactConnected.id,
            { forward: forwardMessage },
            { quoted: waMessage },
        )

        const phoneNumber = sanitizePhoneNumber(jid)

        const isGroupMessage = isJidGroup(key.remoteJid)
        const group = isGroupMessage ? await this.socket.groupMetadata(key.remoteJid) : null
        const descriptions = [
            isGroupMessage ? 'Deleted Group Message' : 'Deleted Message',
            isGroupMessage ? `group: ${group.subject} (${group.participants?.length} members)` : '',
            `phone: ${phoneNumber}`,
            `name: ${waMessage.pushName}`,
            parseTimeStamp(waMessage.messageTimestamp as number),
        ].filter(Boolean)

        await this.sendMessage(this.contactConnected.id, { text: descriptions.join('\n') }, { quoted: messageResult })
        await whatsappMessageService.deleteMessage(this.credential, key)
        return true
    }

    protected newMessageListeners = async (message: WhatsappMessage): Promise<boolean[]> => {
        return await Promise.all([
            this.convertAndSendSticker(message),
            this.downloadViewOnce(message),
            this.saveMessage(message),
            // uncomment this if you want forward every view once come
            // this.forwardViewOnce(message),
        ])
    }

    protected updateMessageListeners = async (message: WhatsappMessageUpdate): Promise<boolean[]> => {
        const listeners = []

        if (!message?.update?.message) {
            listeners.push(this.sendDeletedMessage(message.key))
        }

        return await Promise.all(listeners)
    }

    private fixKey(type: string, id: string) {
        return Buffer.from(JSON.stringify({ credentialId: this.credential.id, type, id })).toString('base64')
    }

    private async getStateData<T extends keyof SignalDataTypeMap>(
        type: T,
        ids: string[],
    ): Promise<Record<string, SignalDataTypeMap[T]>> {
        const data: Record<string, SignalDataTypeMap[T]> = {}

        await Promise.all(
            ids.map(async id => {
                let value = await authService.getStateValue(this.credential, this.fixKey(type, id))

                if (type === 'app-state-sync-key' && value) {
                    value = proto.Message.AppStateSyncKeyData.fromObject(value)
                }

                data[id] = value
            }),
        )

        return data
    }

    private async setStateData(data: SignalDataSet) {
        const tasks: Promise<void>[] = []

        for (const type in data) {
            for (const id in data[type]) {
                const value = data[type][id]
                const key = this.fixKey(type, id)
                tasks.push(
                    value
                        ? authService.setStateValue(this.credential, key, value)
                        : authService.removeStateValue(this.credential, key),
                )
            }
        }

        await Promise.all(tasks)
    }
}
