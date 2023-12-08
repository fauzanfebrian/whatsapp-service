import { proto } from '@whiskeysockets/baileys'
import { AuthCredential } from 'src/auth/entities/credential'
import datasource from 'src/db/datasource'
import { Repository } from 'typeorm'
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
        return await this.messageRepository.save(
            this.messageRepository.create({
                credentialId: credential.id,
                key: this.stringifyKey(credential, key),
                value,
            }),
        )
    }

    async getMessage(credential: AuthCredential, key: proto.IMessageKey): Promise<WhatsappMessage> {
        const data = await this.messageRepository.findOne({
            where: {
                credentialId: credential.id,
                key: this.stringifyKey(credential, key),
            },
        })

        return data?.value || null
    }
}

const whatsappMessageService = new WhatsappMessageService()
export default whatsappMessageService
