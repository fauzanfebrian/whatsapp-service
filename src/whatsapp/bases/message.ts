import { jidNormalizedUser, proto } from '@whiskeysockets/baileys'
import { AuthCredential } from 'src/auth/entities/credential'
import datasource from 'src/db/datasource'
import { sanitizePhoneNumber } from 'src/util/baileys'
import { QueryFailedError, Repository } from 'typeorm'
import { Message } from '../entities/message'
import { WhatsappMessage } from '../interface'

export class WhatsappMessageService {
    private messageRepository: Repository<Message>

    constructor() {
        this.messageRepository = datasource.getRepository(Message)
    }

    private stringifyKey(credential: AuthCredential, key: proto.IMessageKey): string {
        return Buffer.from(JSON.stringify({ ...key, credentialId: credential.id })).toString('base64')
    }

    async createMessage(credential: AuthCredential, key: proto.IMessageKey, value: WhatsappMessage) {
        try {
            const senderJid = jidNormalizedUser(key.participant || key.remoteJid)

            return await this.messageRepository.save(
                this.messageRepository.create({
                    credentialId: credential.id,
                    key: this.stringifyKey(credential, key),
                    value,
                    sender: sanitizePhoneNumber(senderJid),
                }),
            )
        } catch (error) {
            if (error instanceof QueryFailedError) {
                if (error.message.includes('duplicate key value violates unique constraint')) {
                    return null
                }
            }
            throw error
        }
    }

    async getMessage(credential: AuthCredential, key: proto.IMessageKey): Promise<WhatsappMessage> {
        const message = await this.messageRepository.findOne({
            where: {
                credentialId: credential.id,
                key: this.stringifyKey(credential, key),
            },
        })

        return message?.value || null
    }

    async deleteMessage(credential: AuthCredential, key: proto.IMessageKey): Promise<boolean> {
        const res = await this.messageRepository.update(
            {
                credentialId: credential.id,
                key: this.stringifyKey(credential, key),
                isDeleted: false,
            },
            { isDeleted: true },
        )
        return !!res?.affected
    }
}

const whatsappMessageService = new WhatsappMessageService()
export default whatsappMessageService
