export interface Session {
    id: number
    active: boolean
    createdAt: Date
    updatedAt: Date
    connected: boolean
    user?: {
        name?: string
        phone?: string
    }
    platform?: string
}
