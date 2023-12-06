import { Contact } from '@whiskeysockets/baileys'

export interface Session {
    id: number
    active: boolean
    createdAt: Date
    updatedAt: Date
    connected: boolean
    user?: Contact
    platform?: string
}
