import { AuthCredential } from 'src/auth/entities/credential'
import { AuthState } from 'src/auth/entities/state'
import { Message } from 'src/whatsapp/entities/message'

/**
 * add manual entities that has been created so webpack can compile it
 */
export const entities = [AuthCredential, AuthState, Message]
