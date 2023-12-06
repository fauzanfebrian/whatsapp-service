import { APPLICATION_NAME, APPLICATION_VERSION, WA_AUTH_METHOD } from 'src/config/config'
import { WhatsappServiceDBAuth } from './services/db'
import { WhatsappServiceFileAuth } from './services/file'
import { WhatsappBaseService } from './bases/service'

let whatsappService: WhatsappBaseService

if (WA_AUTH_METHOD === 'db') {
    whatsappService = new WhatsappServiceDBAuth(APPLICATION_NAME, APPLICATION_VERSION)
} else {
    whatsappService = new WhatsappServiceFileAuth(APPLICATION_NAME, APPLICATION_VERSION)
}

export default whatsappService
