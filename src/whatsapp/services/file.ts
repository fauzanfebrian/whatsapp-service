import { useMultiFileAuthState } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'
import { WhatsappBaseService } from '../bases/service'
import { AuthState } from '../interface'

export class WhatsappServiceFileAuth extends WhatsappBaseService {
    private session_directory = 'sessions'

    protected async makeAuthState(): Promise<AuthState> {
        return useMultiFileAuthState(this.session_directory)
    }

    protected async removeSession(): Promise<void> {
        try {
            fs.rmSync(path.resolve(process.cwd(), this.session_directory), { recursive: true, force: true })
        } catch {}
    }
}
