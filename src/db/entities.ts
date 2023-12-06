import { AuthCredential } from 'src/auth/entities/credential'
import { AuthState } from 'src/auth/entities/state'

/**
 * add manual entities that has been created so webpack can compile it
 */
export const entities = [AuthCredential, AuthState]
