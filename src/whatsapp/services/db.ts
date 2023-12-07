import { AuthenticationCreds, SignalDataSet, SignalDataTypeMap, initAuthCreds, proto } from '@whiskeysockets/baileys'
import { AuthCredential } from 'src/auth/entities/credential'
import authService from 'src/auth/service'
import { WhatsappBaseService } from '../bases/service'
import { AuthState } from '../interface'

export class WhatsappServiceDBAuth extends WhatsappBaseService {
    protected async makeAuthState(): Promise<AuthState> {
        const credential = await authService.getActiveCredential()

        const creds: AuthenticationCreds = credential?.value || initAuthCreds()

        return {
            state: {
                creds,
                keys: {
                    get: (type, ids) => this.getStateData(credential, type, ids),
                    set: data => this.setStateData(credential, data),
                },
            },
            saveCreds: async () => {
                await authService.saveCredential(credential, creds)
            },
        }
    }

    private fixKey(credential: AuthCredential, type: string, id: string) {
        return Buffer.from(JSON.stringify({ credentialId: credential.id, type, id })).toString('base64url')
    }

    private async getStateData<T extends keyof SignalDataTypeMap>(
        credential: AuthCredential,
        type: T,
        ids: string[]
    ): Promise<Record<string, SignalDataTypeMap[T]>> {
        const data: Record<string, SignalDataTypeMap[T]> = {}

        await Promise.all(
            ids.map(async id => {
                let value = await authService.getStateValue(credential, this.fixKey(credential, type, id))

                if (type === 'app-state-sync-key' && value) {
                    value = proto.Message.AppStateSyncKeyData.fromObject(value)
                }

                data[id] = value
            })
        )

        return data
    }

    private async setStateData(credential: AuthCredential, data: SignalDataSet) {
        const tasks: Promise<void>[] = []

        for (const type in data) {
            for (const id in data[type]) {
                const value = data[type][id]
                const key = this.fixKey(credential, type, id)
                tasks.push(
                    value
                        ? authService.setStateValue(credential, key, value)
                        : authService.removeStateValue(credential, key)
                )
            }
        }

        await Promise.all(tasks)
    }

    protected async removeSession(): Promise<void> {
        await authService.removeActiveCredential()
    }
}
