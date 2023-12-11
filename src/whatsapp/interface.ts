import makeWASocket, {
    AnyMessageContent,
    AuthenticationState,
    Contact,
    GroupMetadata,
    GroupParticipant as GroupMember,
    WAMessageUpdate,
    proto,
} from '@whiskeysockets/baileys'

export type WhatsappSocket = ReturnType<typeof makeWASocket>

export class WhatsappError extends Error {
    constructor(error: string) {
        super(error)
    }
}

export interface StatusWhatsappService {
    isConnected: boolean
    contactConnected?: Contact
    qrcode?: string
}

export interface WhatsappMessageQuoted {
    sendToJid?: string
    message?: string
}

export interface WhatsappMessage extends proto.IWebMessageInfo {
    quoted?: WhatsappMessageQuoted
}

export interface WhatsappMessageUpdate extends WAMessageUpdate {
    update: Partial<WhatsappMessage>
}

export interface AuthState {
    state: AuthenticationState
    saveCreds: () => Promise<void>
}

export interface ExtractStickerMediaData {
    message: AnyMessageContent
    targetJid: string
}

export interface ExtractViewOnceMediaData {
    message: {
        forward: WhatsappMessage
        force?: boolean
    }
    targetJid: string
}

export interface ValueMessageMedia {
    media: proto.Message.IImageMessage | proto.Message.IVideoMessage
    type: 'image' | 'video'
    viewOnce: boolean
}

export type NewMessageListener = (message: WhatsappMessage) => Promise<any>

export type GroupParticipant = GroupMember

export interface GroupData extends GroupMetadata {
    participants: GroupParticipant[]
}
