import datasource from 'src/db/datasource'
import { Not, Repository } from 'typeorm'
import { AuthCredential } from './entities/credential'
import { AuthState } from './entities/state'
import { Session } from './interface'
import whatsappService from 'src/whatsapp/service'

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
        const existState = await this.stateRepository.findOne({
            where: {
                credentialId: credential.id,
                key,
            },
        })

        await this.stateRepository.save(
            this.stateRepository.create({
                ...(existState || {}),
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

    async getSessions(): Promise<Session[]> {
        const sessions = await this.credentialRepository.find()
        return sessions.map(this.buildSession)
    }

    async activateSession(id: number): Promise<boolean> {
        const session = await this.credentialRepository.findOne({ where: { id } })

        if (session?.active) return false

        await this.credentialRepository.update({ id: Not(id), active: true }, { active: false })

        session.active = true
        await this.credentialRepository.save(session)

        await whatsappService.reInitialize()

        return true
    }

    async deactivateSession(id: number): Promise<boolean> {
        const session = await this.credentialRepository.findOne({ where: { id } })

        if (!session?.active) return false

        session.active = false
        await this.credentialRepository.save(session)

        await whatsappService.reInitialize()

        return true
    }

    private buildSession(credential: AuthCredential): Session {
        return {
            id: credential.id,
            active: credential.active,
            createdAt: credential.createdAt,
            updatedAt: credential.updatedAt,
            connected: !!credential.value?.me?.id,
            user: credential.value?.me,
            platform: credential.value?.platform,
        }
    }
}

const authService = new AuthService()
export default authService
