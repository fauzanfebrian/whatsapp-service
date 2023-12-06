import {
    AuthenticationCreds,
    BufferJSON,
    SignalDataSet,
    SignalDataTypeMap,
    initAuthCreds,
    proto,
} from '@whiskeysockets/baileys'
import { AuthCredential } from 'src/auth/entities/credential'
import authService from 'src/auth/service'
import { WhatsappBaseService } from '../bases/service'
import { AuthState } from '../interface'

export class WhatsappServiceDBAuth extends WhatsappBaseService {
    protected async makeAuthState(): Promise<AuthState> {
        const credential = await authService.getActiveCredential()

        const creds: AuthenticationCreds = this.readData(credential?.value) || initAuthCreds()

        return {
            state: {
                creds,
                keys: {
                    get: (type, ids) => this.getStateData(credential, type, ids),
                    set: data => this.setStateData(credential, data),
                },
            },
            saveCreds: async () => {
                await authService.saveCredential(credential, this.writeData(creds))
            },
        }
    }

    private fixKey(key?: string) {
        return key?.replace(/\//g, '__')?.replace(/:/g, '-')
    }

    private readData(value: any): any {
        if (!value) return value

        return JSON.parse(JSON.stringify(value), BufferJSON.reviver)
    }

    private writeData(value: any): any {
        return JSON.parse(JSON.stringify(value, BufferJSON.replacer))
    }

    private async getStateData<T extends keyof SignalDataTypeMap>(
        credential: AuthCredential,
        type: T,
        ids: string[]
    ): Promise<Record<string, SignalDataTypeMap[T]>> {
        const data: Record<string, SignalDataTypeMap[T]> = {}

        await Promise.all(
            ids.map(async id => {
                let value = await authService.getStateValue(credential, this.fixKey(`${type}-${id}`))

                if (type === 'app-state-sync-key' && value) {
                    value = proto.Message.AppStateSyncKeyData.fromObject(value)
                }

                data[id] = this.readData(value)
            })
        )

        return data
    }

    private async setStateData(credential: AuthCredential, data: SignalDataSet) {
        const tasks: Promise<void>[] = []

        for (const category in data) {
            for (const id in data[category]) {
                const value = data[category][id]
                const key = this.fixKey(`${category}-${id}`)
                tasks.push(
                    value
                        ? authService.setStateValue(credential, key, this.writeData(value))
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
