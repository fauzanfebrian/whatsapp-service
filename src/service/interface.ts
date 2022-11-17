import {
    AnyMessageContent,
    AuthenticationCreds,
    BaileysEventEmitter,
    BaileysEventMap,
    BinaryNode,
    CatalogCollection,
    ChatModification,
    ConnectionState,
    Contact,
    GroupMetadata,
    InitialReceivedChatsState,
    MediaConnInfo,
    MessageReceiptType,
    MessageRelayOptions,
    MessageUpsertType,
    MiscMessageGenerationOptions,
    OrderDetails,
    ParticipantAction,
    Product,
    ProductCreate,
    ProductUpdate,
    SignalKeyStoreWithTransaction,
    WABusinessProfile,
    WAMediaUpload,
    WAMediaUploadFunction,
    WAPatchCreate,
    WAPresence,
    WAProto,
} from '@adiwajshing/baileys'

export interface WhatsappSocket {
    getOrderDetails: (orderId: string, tokenBase64: string) => Promise<OrderDetails>
    getCatalog: (
        jid?: string | undefined,
        limit?: number
    ) => Promise<{
        products: Product[]
    }>
    getCollections: (
        jid?: string | undefined,
        limit?: number
    ) => Promise<{
        collections: CatalogCollection[]
    }>
    productCreate: (create: ProductCreate) => Promise<Product>
    productDelete: (productIds: string[]) => Promise<{
        deleted: number
    }>
    productUpdate: (productId: string, update: ProductUpdate) => Promise<Product>
    sendMessageAck: ({ tag, attrs }: BinaryNode) => Promise<void>
    sendRetryRequest: (node: BinaryNode, forceIncludeKeys?: boolean) => Promise<void>
    getPrivacyTokens: (jids: string[]) => Promise<BinaryNode>
    assertSessions: (jids: string[], force: boolean) => Promise<boolean>
    relayMessage: (
        jid: string,
        message: WAProto.IMessage,
        { messageId, participant, additionalAttributes, useUserDevicesCache, cachedGroupMetadata }: MessageRelayOptions
    ) => Promise<string>
    sendReceipt: (
        jid: string,
        participant: string | undefined,
        messageIds: string[],
        type: MessageReceiptType
    ) => Promise<void>
    sendReceipts: (keys: WAProto.IMessageKey[], type: MessageReceiptType) => Promise<void>
    readMessages: (keys: WAProto.IMessageKey[]) => Promise<void>
    refreshMediaConn: (forceGet?: boolean) => Promise<MediaConnInfo>
    waUploadToServer: WAMediaUploadFunction
    fetchPrivacySettings: (force?: boolean) => Promise<{
        [_: string]: string
    }>
    updateMediaMessage: (message: WAProto.IWebMessageInfo) => Promise<WAProto.IWebMessageInfo>
    sendMessage: (
        jid: string,
        content: AnyMessageContent,
        options?: MiscMessageGenerationOptions
    ) => Promise<WAProto.WebMessageInfo | undefined>
    groupMetadata: (jid: string) => Promise<GroupMetadata>
    groupCreate: (subject: string, participants: string[]) => Promise<GroupMetadata>
    groupLeave: (id: string) => Promise<void>
    groupUpdateSubject: (jid: string, subject: string) => Promise<void>
    groupParticipantsUpdate: (
        jid: string,
        participants: string[],
        action: ParticipantAction
    ) => Promise<
        {
            status: string
            jid: string
        }[]
    >
    groupUpdateDescription: (jid: string, description?: string | undefined) => Promise<void>
    groupInviteCode: (jid: string) => Promise<string | undefined>
    groupRevokeInvite: (jid: string) => Promise<string | undefined>
    groupAcceptInvite: (code: string) => Promise<string | undefined>
    groupAcceptInviteV4: (
        key: string | WAProto.IMessageKey,
        inviteMessage: WAProto.Message.IGroupInviteMessage
    ) => Promise<string>
    groupGetInviteInfo: (code: string) => Promise<GroupMetadata>
    groupToggleEphemeral: (jid: string, ephemeralExpiration: number) => Promise<void>
    groupSettingUpdate: (
        jid: string,
        setting: 'announcement' | 'locked' | 'not_announcement' | 'unlocked'
    ) => Promise<void>
    groupFetchAllParticipating: () => Promise<{
        [_: string]: GroupMetadata
    }>
    processingMutex: {
        mutex<T>(code: () => T | Promise<T>): Promise<T>
    }
    upsertMessage: (msg: WAProto.IWebMessageInfo, type: MessageUpsertType) => Promise<void>
    appPatch: (patchCreate: WAPatchCreate) => Promise<void>
    sendPresenceUpdate: (type: WAPresence, toJid?: string | undefined) => Promise<void>
    presenceSubscribe: (toJid: string) => Promise<void>
    profilePictureUrl: (
        jid: string,
        type?: 'image' | 'preview',
        timeoutMs?: number | undefined
    ) => Promise<string | undefined>
    onWhatsApp: (...jids: string[]) => Promise<
        {
            exists: boolean
            jid: string
        }[]
    >
    fetchBlocklist: () => Promise<string[]>
    fetchStatus: (jid: string) => Promise<
        | {
              status: string | undefined
              setAt: Date
          }
        | undefined
    >
    updateProfilePicture: (jid: string, content: WAMediaUpload) => Promise<void>
    updateProfileStatus: (status: string) => Promise<void>
    updateProfileName: (name: string) => Promise<void>
    updateBlockStatus: (jid: string, action: 'block' | 'unblock') => Promise<void>
    getBusinessProfile: (jid: string) => Promise<void | WABusinessProfile>
    resyncAppState: (
        collections: readonly (
            | 'critical_block'
            | 'critical_unblock_low'
            | 'regular_high'
            | 'regular_low'
            | 'regular'
        )[],
        recvChats: InitialReceivedChatsState | undefined
    ) => Promise<void>
    chatModify: (mod: ChatModification, jid: string) => Promise<void>
    resyncMainAppState: (ctx?: InitialReceivedChatsState | undefined) => Promise<void>
    type: 'md'
    ws: any
    ev: BaileysEventEmitter & {
        process(handler: (events: Partial<BaileysEventMap<AuthenticationCreds>>) => void | Promise<void>): () => void
        buffer(): boolean
        createBufferedFunction<A extends any[], T_1>(work: (...args: A) => Promise<T_1>): (...args: A) => Promise<T_1>
        flush(): Promise<void>
        processInBuffer(task: Promise<any>): any
    }
    authState: {
        creds: AuthenticationCreds
        keys: SignalKeyStoreWithTransaction
    }
    user: Contact | undefined
    generateMessageTag: () => string
    query: (node: BinaryNode, timeoutMs?: number | undefined) => Promise<BinaryNode>
    waitForMessage: (msgId: string, timeoutMs?: number | undefined) => Promise<any>
    waitForSocketOpen: () => Promise<void>
    sendRawMessage: (data: Buffer | Uint8Array) => Promise<void>
    sendNode: (frame: BinaryNode) => Promise<void>
    logout: () => Promise<void>
    end: (error: Error | undefined) => void
    onUnexpectedError: (error: Error, msg: string) => void
    uploadPreKeys: (count?: number) => Promise<void>
    waitForConnectionUpdate: (
        check: (u: Partial<ConnectionState>) => boolean | undefined,
        timeoutMs?: number | undefined
    ) => Promise<void>
}

export class WhatsappError extends Error {
    constructor(error: string) {
        super(error)
    }
}
