import datasource from 'src/db/datasource'
import { Repository } from 'typeorm'
import { AuthCredential } from './entities/credential'
import { AuthState } from './entities/state'

export class AuthService {
    private credentialRepository: Repository<AuthCredential>
    private stateRepository: Repository<AuthState>

    constructor() {
        this.credentialRepository = datasource.getRepository(AuthCredential)
        this.stateRepository = datasource.getRepository(AuthState)
    }

    async getActiveCredential(): Promise<AuthCredential> {
        const activeCreds = await this.credentialRepository.findOne({
            where: {
                active: true,
            },
        })

        if (activeCreds) {
            return activeCreds
        }

        const credential = await this.credentialRepository.save(
            this.credentialRepository.create({
                active: true,
            })
        )

        return credential
    }

    async removeActiveCredential(): Promise<boolean> {
        const res = await this.credentialRepository.delete({
            active: true,
        })
        return !!res.affected
    }

    async saveCredential(credential: AuthCredential, newValue: any) {
        credential.value = newValue

        return this.credentialRepository.save(this.credentialRepository.create(credential))
    }

    async getStateValue(credential: AuthCredential, key: string): Promise<any> {
        const state = await this.stateRepository.findOne({
            where: {
                credentialId: credential.id,
                key,
            },
        })

        return state?.value || null
    }

    async setStateValue(credential: AuthCredential, key: string, value: any): Promise<void> {
        await this.stateRepository.save(
            this.stateRepository.create({
                credentialId: credential.id,
                key,
                value,
            })
        )
    }

    async removeStateValue(credential: AuthCredential, key: string): Promise<void> {
        try {
            await this.stateRepository.delete({
                credentialId: credential.id,
                key,
            })
        } catch {}
    }
}

const authService = new AuthService()
export default authService
